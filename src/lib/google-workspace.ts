/**
 * Google Workspace Integration Module for Fuenzer Journal
 * Handles Google Tasks and Google Calendar synchronization using client-side OAuth tokens.
 * Scopes configured:
 *  - https://www.googleapis.com/auth/tasks
 *  - https://www.googleapis.com/auth/calendar.events
 */

import { auth, workspaceGoogleProvider, signInWithPopup, GoogleAuthProvider } from './firebase';

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/calendar.events',
];

// In-memory token cache (never stored in localStorage or sessionStorage per security guidelines)
let cachedAccessToken: string | null = null;

export function setCachedAccessToken(token: string | null) {
  cachedAccessToken = token;
}

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

export function clearCachedAccessToken() {
  cachedAccessToken = null;
}

/**
 * Request or refresh Google Workspace access token using Firebase Auth popup
 */
export async function requestWorkspaceAccessToken(): Promise<string> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  try {
    const result = await signInWithPopup(auth, workspaceGoogleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not obtain Google Workspace access token from authentication.');
    }
    cachedAccessToken = credential.accessToken;
    return cachedAccessToken;
  } catch (error: any) {
    console.error('[Google Workspace] Error requesting access token:', error);
    throw error;
  }
}

export interface GoogleTaskItem {
  id?: string;
  title: string;
  notes?: string;
  status?: 'needsAction' | 'completed';
  due?: string; // RFC 3339 timestamp formatted string (e.g. 2026-08-27T00:00:00.000Z)
}

export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
}

/**
 * Get or create the dedicated Fuenzer Journal task list
 */
export async function getOrCreateFuenzerTaskList(
  accessToken: string,
  listTitle: string = '🌿 Fuenzer Journal'
): Promise<string> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  try {
    // 1. Fetch user's task lists
    const listRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      headers,
    });

    if (!listRes.ok) {
      if (listRes.status === 401) {
        clearCachedAccessToken();
        throw new Error('Google Workspace session expired. Please sign in again.');
      }
      throw new Error(`Failed to list Google Tasks: ${listRes.statusText}`);
    }

    const listData = await listRes.json();
    const lists: GoogleTaskList[] = listData.items || [];

    // Check if custom list already exists
    const existing = lists.find(
      (l) => l.title.toLowerCase() === listTitle.toLowerCase() || l.title.includes('Fuenzer')
    );
    if (existing) {
      return existing.id;
    }

    // 2. Create the dedicated list if not found
    const createRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      method: 'POST',
      headers,
      body: JSON.stringify({ title: listTitle }),
    });

    if (createRes.ok) {
      const createdData = await createRes.json();
      return createdData.id || '@default';
    }

    // Fallback to default list if custom list creation fails
    return '@default';
  } catch (error) {
    console.warn('[Google Tasks] TaskList retrieval fallback to @default:', error);
    return '@default';
  }
}

/**
 * Synchronize a list of action items to Google Tasks
 */
export async function syncActionItemsToGoogleTasks(
  accessToken: string,
  entryTitle: string,
  actionItems: string[],
  dueDateIso?: string
): Promise<{
  success: boolean;
  syncedCount: number;
  taskListId: string;
  errors: string[];
}> {
  if (!actionItems || actionItems.length === 0) {
    return { success: true, syncedCount: 0, taskListId: '@default', errors: [] };
  }

  const taskListId = await getOrCreateFuenzerTaskList(accessToken);
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  let syncedCount = 0;
  const errors: string[] = [];

  for (const rawItem of actionItems) {
    if (!rawItem || !rawItem.trim()) continue;

    const isCompleted =
      rawItem.startsWith('[x] ') || rawItem.startsWith('[X] ') || rawItem.startsWith('[✓] ');
    const cleanTitle = rawItem.replace(/^\[[xX✓ ]\]\s*/, '').trim();

    if (!cleanTitle) continue;

    const taskPayload: Record<string, any> = {
      title: cleanTitle,
      notes: `Extracted from Fuenzer Journal reflection: "${entryTitle}"\nSynced on ${new Date().toLocaleDateString()}`,
      status: isCompleted ? 'completed' : 'needsAction',
    };

    if (dueDateIso) {
      // Google Tasks requires RFC 3339 with date/time
      taskPayload.due = new Date(dueDateIso).toISOString();
    }

    try {
      const res = await fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(taskPayload),
        }
      );

      if (res.ok) {
        syncedCount++;
      } else {
        const errorBody = await res.text().catch(() => '');
        errors.push(`Failed to add task "${cleanTitle}": ${res.statusText} ${errorBody}`);
      }
    } catch (err: any) {
      errors.push(`Network error adding "${cleanTitle}": ${err?.message}`);
    }
  }

  return {
    success: syncedCount > 0,
    syncedCount,
    taskListId,
    errors,
  };
}

export interface CalendarEventPayload {
  title: string;
  description: string;
  startDateTime: string; // ISO 8601 string
  durationMinutes: number;
}

/**
 * Schedule a mindful reflection or decompression block on Google Calendar
 */
export async function scheduleReflectionCalendarBlock(
  accessToken: string,
  options: CalendarEventPayload
): Promise<{
  eventId: string;
  htmlLink: string;
  summary: string;
  startTime: string;
  endTime: string;
}> {
  const startDate = new Date(options.startDateTime);
  const endDate = new Date(startDate.getTime() + options.durationMinutes * 60 * 1000);
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const eventPayload = {
    summary: options.title || '🌿 Mindful Reflection Time',
    description: options.description || 'Dedicated reflection & decompression block in Fuenzer Journal.',
    start: {
      dateTime: startDate.toISOString(),
      timeZone: userTimeZone,
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: userTimeZone,
    },
    colorId: '10', // Basil / Sage green in Google Calendar colors
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 10 },
        { method: 'popup', minutes: 60 },
      ],
    },
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearCachedAccessToken();
      throw new Error('Google Calendar session expired. Please re-authenticate.');
    }
    const errText = await response.text().catch(() => '');
    throw new Error(`Google Calendar error: ${response.statusText} ${errText}`);
  }

  const createdEvent = await response.json();
  return {
    eventId: createdEvent.id,
    htmlLink: createdEvent.htmlLink || 'https://calendar.google.com/',
    summary: createdEvent.summary,
    startTime: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    endTime: endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
