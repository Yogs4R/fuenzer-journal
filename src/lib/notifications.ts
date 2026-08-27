export interface NotificationSettings {
  enabled: boolean;
  reminderTime: string; // "HH:MM" in 24-hour format (e.g. "09:00" or "20:30")
  reminderType: 'morning' | 'evening' | 'custom';
  lastNotifiedDate?: string;
}

const STORAGE_KEY = 'fuenzer_mindful_notifications_v1';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  reminderTime: '20:00',
  reminderType: 'evening',
};

/**
 * Check if Web Notifications are supported in current browser
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission state
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.warn('[Notifications] Error requesting permission:', error);
    return 'denied';
  }
}

/**
 * Load saved notification settings from LocalStorage
 */
export function getStoredNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

/**
 * Save notification settings to LocalStorage
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('[Notifications] Failed to save settings to localStorage:', err);
  }
}

export interface NotificationResult {
  success: boolean;
  method: 'serviceworker' | 'notification' | 'in-app-only' | 'unsupported';
  permission: NotificationPermission | 'unsupported';
  title: string;
  body: string;
}

/**
 * Trigger an immediate mindful notification with full fallback
 */
export async function sendMindfulNotification(
  title: string = '🌿 Moment for Mindful Reflection',
  body: string = 'Take 2 tranquil minutes to reflect on what is in your control today.',
  url: string = '/app'
): Promise<NotificationResult> {
  const currentPerm = getNotificationPermission();
  let finalPerm = currentPerm;

  // Dispatch custom in-app event so UI components can display an in-app banner/toast
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('fuenzer-mindful-prompt-dispatched', {
          detail: { title, body, url, timestamp: Date.now() },
        })
      );
    } catch {
      // Ignore custom event dispatch errors in restricted environments
    }
  }

  if (!isNotificationSupported()) {
    return {
      success: true,
      method: 'in-app-only',
      permission: 'unsupported',
      title,
      body,
    };
  }

  // If permission is default, attempt to request it
  if (currentPerm === 'default') {
    try {
      finalPerm = await requestNotificationPermission();
    } catch (e) {
      console.warn('[Notifications] Permission request error:', e);
      finalPerm = 'denied';
    }
  }

  if (finalPerm !== 'granted') {
    return {
      success: true,
      method: 'in-app-only',
      permission: finalPerm,
      title,
      body,
    };
  }

  const options: NotificationOptions & { renotify?: boolean } = {
    body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'fuenzer-mindful-prompt',
    data: { url },
    renotify: true,
  };

  try {
    // 1. Attempt ServiceWorker registration with a short 400ms timeout to avoid hanging
    if ('serviceWorker' in navigator) {
      try {
        const swPromise = navigator.serviceWorker.ready;
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 400));
        const registration = await Promise.race([swPromise, timeoutPromise]);

        if (registration && 'showNotification' in registration) {
          await registration.showNotification(title, options);
          return {
            success: true,
            method: 'serviceworker',
            permission: 'granted',
            title,
            body,
          };
        }
      } catch (swErr) {
        console.warn('[Notifications] ServiceWorker notification error:', swErr);
      }
    }

    // 2. Fallback to standard window Notification
    new Notification(title, options);
    return {
      success: true,
      method: 'notification',
      permission: 'granted',
      title,
      body,
    };
  } catch (error) {
    console.warn('[Notifications] Error displaying system notification, fallback to in-app:', error);
    return {
      success: true,
      method: 'in-app-only',
      permission: finalPerm,
      title,
      body,
    };
  }
}

/**
 * Mindful Prompts Catalog for daily rotation
 */
export const MINDFUL_PROMPTS = [
  {
    title: '🌿 Morning Intention',
    body: 'How do you wish to show up for yourself today? Take a moment to set a mindful intention.',
  },
  {
    title: '⚖️ Stoic Check-In',
    body: 'What is within your control right now? Let go of what you cannot govern.',
  },
  {
    title: '✨ Daily Gratitude',
    body: 'What small victory or quiet kindness made a difference in your day today?',
  },
  {
    title: '🌙 Evening Decompression',
    body: 'Unpack the weight of your day. Share your thoughts in a safe Socratic space.',
  },
  {
    title: '🌱 Growth Retrospective',
    body: 'What did a recent challenge teach you about your inner resilience?',
  },
];

/**
 * Get random or time-based mindful prompt
 */
export function getPromptForCurrentTime(): { title: string; body: string } {
  const hour = new Date().getHours();
  if (hour < 12) {
    return MINDFUL_PROMPTS[0]; // Morning
  } else if (hour < 17) {
    return MINDFUL_PROMPTS[1]; // Afternoon
  } else {
    return MINDFUL_PROMPTS[3]; // Evening
  }
}

export interface WorkspaceIntegrationSettings {
  tasksEnabled: boolean;
  calendarEnabled: boolean;
}

export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceIntegrationSettings = {
  tasksEnabled: true,
  calendarEnabled: true,
};

const WORKSPACE_SETTINGS_KEY = 'fuenzer_workspace_integrations_v1';

export function getStoredWorkspaceSettings(): WorkspaceIntegrationSettings {
  if (typeof window === 'undefined') return DEFAULT_WORKSPACE_SETTINGS;
  try {
    const saved = localStorage.getItem(WORKSPACE_SETTINGS_KEY);
    if (!saved) return DEFAULT_WORKSPACE_SETTINGS;
    return { ...DEFAULT_WORKSPACE_SETTINGS, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_WORKSPACE_SETTINGS;
  }
}

export function saveWorkspaceSettings(settings: WorkspaceIntegrationSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WORKSPACE_SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('workspace-settings-changed', { detail: settings }));
  } catch (err) {
    console.warn('[Workspace] Failed to persist workspace integration settings:', err);
  }
}

