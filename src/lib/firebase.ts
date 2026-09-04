import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  Firestore,
} from 'firebase/firestore';
import type { JournalEntry } from '../types/journal';
import { parseTimestamp } from './date-utils';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfigJson) : getApp();

export const auth = getAuth(app);

// Initialize default Firestore database (standard database shown in Firebase Console)
export const defaultDb: Firestore = getFirestore(app);

// Check if a secondary/custom Firestore database ID exists in applet configuration
const configuredDbId = (firebaseConfigJson as any).firestoreDatabaseId;
export const customDb: Firestore =
  configuredDbId && configuredDbId !== '(default)'
    ? getFirestore(app, configuredDbId)
    : defaultDb;

export const FIRESTORE_DATABASE_ID = configuredDbId || '(default)';

// Dynamic resilient active database reference
let activeDb: Firestore = defaultDb;

export const db = new Proxy({} as Firestore, {
  get(_target, prop) {
    return (activeDb as any)[prop];
  },
});

// Clean Standard Google Auth Provider (profile & email only for instant, error-free sign-in)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Dedicated Google Workspace Provider for incremental Tasks & Calendar sync
export const workspaceGoogleProvider = new GoogleAuthProvider();
workspaceGoogleProvider.setCustomParameters({ prompt: 'select_account' });
workspaceGoogleProvider.addScope('https://www.googleapis.com/auth/tasks');
workspaceGoogleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

/**
 * Strict Undefined-Stripping Utility per Production Directive 6
 * Strips all `undefined` values and ensures clean payloads before passing to Firestore
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  return JSON.parse(
    JSON.stringify(data, (_key, value) => (value === undefined ? null : value))
  );
}

/**
 * Helper to query journals from a specific Firestore database instance
 */
async function queryJournalsFromInstance(
  instance: Firestore,
  userId: string
): Promise<JournalEntry[]> {
  const journalsRef = collection(instance, 'users', userId, 'journals');
  const q = query(journalsRef, orderBy('createdAt', 'desc'));

  const querySnapshot = await getDocs(q);
  const entries: JournalEntry[] = [];

  querySnapshot.forEach((docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const createdAt = parseTimestamp(data.createdAt);
      const updatedAt = parseTimestamp(data.updatedAt || data.createdAt);
      entries.push({
        ...data,
        createdAt,
        updatedAt,
      } as JournalEntry);
    }
  });

  return entries;
}

/**
 * Save or update a journal entry in Firestore under user-isolated path:
 * /users/{userId}/journals/{journalId}
 * Resiliently falls back between defaultDb and customDb if permission or database mismatch occurs.
 */
export async function saveJournalToFirestore(
  userId: string,
  entry: JournalEntry
): Promise<void> {
  if (!userId) throw new Error('User ID is required to save journal');
  if (!entry.id) throw new Error('Journal ID is required');

  const createdAt = parseTimestamp(entry.createdAt || Date.now());
  const updatedAt = Date.now();

  const sanitized = sanitizeForFirestore({
    ...entry,
    userId,
    createdAt,
    updatedAt,
  });

  try {
    const journalDocRef = doc(activeDb, 'users', userId, 'journals', entry.id);
    await setDoc(journalDocRef, sanitized, { merge: true });
  } catch (err: any) {
    const fallbackDb = activeDb === defaultDb ? customDb : defaultDb;
    if (fallbackDb !== activeDb) {
      console.warn('Save on primary db failed, attempting fallback db:', err);
      const journalDocRef = doc(fallbackDb, 'users', userId, 'journals', entry.id);
      await setDoc(journalDocRef, sanitized, { merge: true });
      activeDb = fallbackDb;
      return;
    }
    throw err;
  }
}

/**
 * Fetch all journals for authenticated user in chronological order.
 * Checks defaultDb (Firebase Console standard database) first, then falls back to customDb.
 */
export async function fetchUserJournals(userId: string): Promise<JournalEntry[]> {
  if (!userId) return [];

  // 1. Try defaultDb first (where databases created via Firebase Console live)
  try {
    const defaultEntries = await queryJournalsFromInstance(defaultDb, userId);
    activeDb = defaultDb;
    if (defaultEntries.length > 0) {
      return defaultEntries;
    }
  } catch (err: any) {
    console.warn('Query on defaultDb had error, checking customDb:', err?.message || err);
  }

  // 2. If defaultDb returned 0 or threw an error, and customDb is distinct, try customDb
  if (customDb !== defaultDb) {
    try {
      const customEntries = await queryJournalsFromInstance(customDb, userId);
      if (customEntries.length > 0) {
        activeDb = customDb;
        return customEntries;
      }
    } catch (err: any) {
      console.warn('Query on customDb had error:', err?.message || err);
    }
  }

  // If neither had entries, keep activeDb set to defaultDb
  activeDb = defaultDb;
  return [];
}

/**
 * Delete a journal entry strictly under user's isolated path
 */
export async function deleteJournalFromFirestore(
  userId: string,
  journalId: string
): Promise<void> {
  if (!userId || !journalId) throw new Error('Invalid user or journal ID');
  try {
    const journalDocRef = doc(activeDb, 'users', userId, 'journals', journalId);
    await deleteDoc(journalDocRef);
  } catch (err: any) {
    const fallbackDb = activeDb === defaultDb ? customDb : defaultDb;
    if (fallbackDb !== activeDb) {
      const journalDocRef = doc(fallbackDb, 'users', userId, 'journals', journalId);
      await deleteDoc(journalDocRef);
      activeDb = fallbackDb;
      return;
    }
    throw err;
  }
}

/**
 * Toggle pinned status of a journal entry
 */
export async function togglePinJournal(
  userId: string,
  journalId: string,
  pinned: boolean
): Promise<void> {
  if (!userId || !journalId) return;
  try {
    const journalDocRef = doc(activeDb, 'users', userId, 'journals', journalId);
    await updateDoc(journalDocRef, { pinned: !pinned, updatedAt: Date.now() });
  } catch (err: any) {
    const fallbackDb = activeDb === defaultDb ? customDb : defaultDb;
    if (fallbackDb !== activeDb) {
      const journalDocRef = doc(fallbackDb, 'users', userId, 'journals', journalId);
      await updateDoc(journalDocRef, { pinned: !pinned, updatedAt: Date.now() });
      activeDb = fallbackDb;
      return;
    }
    throw err;
  }
}

/**
 * Update action items (todos) for a journal entry
 */
export async function updateJournalActionItems(
  userId: string,
  journalId: string,
  actionItems: string[]
): Promise<void> {
  if (!userId || !journalId) return;
  const sanitizedItems = sanitizeForFirestore(actionItems);
  try {
    const journalDocRef = doc(activeDb, 'users', userId, 'journals', journalId);
    await updateDoc(journalDocRef, {
      actionItems: sanitizedItems,
      updatedAt: Date.now(),
    });
  } catch (err: any) {
    const fallbackDb = activeDb === defaultDb ? customDb : defaultDb;
    if (fallbackDb !== activeDb) {
      const journalDocRef = doc(fallbackDb, 'users', userId, 'journals', journalId);
      await updateDoc(journalDocRef, {
        actionItems: sanitizedItems,
        updatedAt: Date.now(),
      });
      activeDb = fallbackDb;
      return;
    }
    throw err;
  }
}

/**
 * Save draft session interaction to Firestore /users/{userId}/interactions/active_draft
 */
export async function saveDraftSession(
  userId: string,
  draftData: any
): Promise<void> {
  if (!userId) return;
  const payload = sanitizeForFirestore({ ...draftData, updatedAt: Date.now() });
  try {
    const draftRef = doc(activeDb, 'users', userId, 'interactions', 'active_draft');
    await setDoc(draftRef, payload);
  } catch (err: any) {
    const fallbackDb = activeDb === defaultDb ? customDb : defaultDb;
    if (fallbackDb !== activeDb) {
      const draftRef = doc(fallbackDb, 'users', userId, 'interactions', 'active_draft');
      await setDoc(draftRef, payload);
      activeDb = fallbackDb;
      return;
    }
    // Draft autosave errors are silent to avoid disrupting flow
  }
}

/**
 * Get draft session from Firestore
 */
export async function getDraftSession(userId: string): Promise<any | null> {
  if (!userId) return null;
  try {
    const draftRef = doc(activeDb, 'users', userId, 'interactions', 'active_draft');
    const snap = await getDoc(draftRef);
    return snap.exists() ? snap.data() : null;
  } catch (err: any) {
    const fallbackDb = activeDb === defaultDb ? customDb : defaultDb;
    if (fallbackDb !== activeDb) {
      try {
        const draftRef = doc(fallbackDb, 'users', userId, 'interactions', 'active_draft');
        const snap = await getDoc(draftRef);
        if (snap.exists()) {
          activeDb = fallbackDb;
          return snap.data();
        }
      } catch {}
    }
    return null;
  }
}

/**
 * Clear draft session
 */
export async function clearDraftSession(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const draftRef = doc(activeDb, 'users', userId, 'interactions', 'active_draft');
    await deleteDoc(draftRef).catch(() => {});
  } catch {
    const fallbackDb = activeDb === defaultDb ? customDb : defaultDb;
    if (fallbackDb !== activeDb) {
      const draftRef = doc(fallbackDb, 'users', userId, 'interactions', 'active_draft');
      await deleteDoc(draftRef).catch(() => {});
    }
  }
}

export { firebaseSignOut, signInWithPopup, onAuthStateChanged, GoogleAuthProvider };
export type { User };
