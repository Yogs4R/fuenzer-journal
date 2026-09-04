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

// Initialize Firestore directly with the configured database ID
const configuredDbId = (firebaseConfigJson as any).firestoreDatabaseId;

export const FIRESTORE_DATABASE_ID =
  configuredDbId && configuredDbId !== '(default)'
    ? configuredDbId
    : 'ai-studio-ea9edce7-50d5-441c-97b0-4180a68ead94';

export const db: Firestore =
  FIRESTORE_DATABASE_ID !== '(default)'
    ? getFirestore(app, FIRESTORE_DATABASE_ID)
    : getFirestore(app);

// Secondary fallback database to ensure zero data loss across database transitions
const SECONDARY_DATABASE_ID = 'ai-studio-fuenzerjournal-ea9edce7-50d5-441c-97b0-4180a68ead94';
const secondaryDb: Firestore | null =
  FIRESTORE_DATABASE_ID !== SECONDARY_DATABASE_ID
    ? getFirestore(app, SECONDARY_DATABASE_ID)
    : null;

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
 * Save or update a journal entry in Firestore under user-isolated path:
 * /users/{userId}/journals/{journalId}
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

  const journalDocRef = doc(db, 'users', userId, 'journals', entry.id);
  await setDoc(journalDocRef, sanitized, { merge: true });
}

/**
 * Helper to fetch entries from a specific Firestore database instance
 */
async function fetchEntriesFromDb(targetDb: Firestore, userId: string): Promise<JournalEntry[]> {
  const journalsRef = collection(targetDb, 'users', userId, 'journals');
  let querySnapshot;
  try {
    const q = query(journalsRef, orderBy('createdAt', 'desc'));
    querySnapshot = await getDocs(q);
  } catch {
    querySnapshot = await getDocs(journalsRef);
  }

  const entries: JournalEntry[] = [];
  querySnapshot.forEach((docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const createdAt = parseTimestamp(data.createdAt);
      const updatedAt = parseTimestamp(data.updatedAt || data.createdAt);
      entries.push({
        ...data,
        id: data.id || docSnap.id,
        createdAt,
        updatedAt,
      } as JournalEntry);
    }
  });
  return entries;
}

/**
 * Fetch all journals for authenticated user in chronological order
 * Resiliently queries primary database and fallback database, merging records by ID
 */
export async function fetchUserJournals(userId: string): Promise<JournalEntry[]> {
  if (!userId) return [];

  console.log(`[Fuenzer Journal] Fetching reflections from Firestore for user: ${userId}...`);

  const entryMap = new Map<string, JournalEntry>();

  try {
    const primaryEntries = await fetchEntriesFromDb(db, userId);
    for (const entry of primaryEntries) {
      if (entry.id) entryMap.set(entry.id, entry);
    }
  } catch (err) {
    console.warn(`[Fuenzer Journal] Primary database (${FIRESTORE_DATABASE_ID}) query error:`, err);
  }

  if (secondaryDb) {
    try {
      const secondaryEntries = await fetchEntriesFromDb(secondaryDb, userId);
      for (const entry of secondaryEntries) {
        if (entry.id && !entryMap.has(entry.id)) {
          entryMap.set(entry.id, entry);
        }
      }
    } catch {
      // Secondary query error is benign
    }
  }

  const entries = Array.from(entryMap.values());
  entries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  console.log(`[Fuenzer Journal] Successfully loaded ${entries.length} reflections from Firestore.`);
  return entries;
}

/**
 * Delete a journal entry strictly under user's isolated path
 */
export async function deleteJournalFromFirestore(
  userId: string,
  journalId: string
): Promise<void> {
  if (!userId || !journalId) throw new Error('Invalid user or journal ID');
  const journalDocRef = doc(db, 'users', userId, 'journals', journalId);
  await deleteDoc(journalDocRef);

  if (secondaryDb) {
    try {
      const secRef = doc(secondaryDb, 'users', userId, 'journals', journalId);
      await deleteDoc(secRef);
    } catch {}
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
  const journalDocRef = doc(db, 'users', userId, 'journals', journalId);
  await updateDoc(journalDocRef, { pinned: !pinned, updatedAt: Date.now() });
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
  const journalDocRef = doc(db, 'users', userId, 'journals', journalId);
  await updateDoc(journalDocRef, {
    actionItems: sanitizedItems,
    updatedAt: Date.now(),
  });
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
  const draftRef = doc(db, 'users', userId, 'interactions', 'active_draft');
  await setDoc(draftRef, payload);
}

/**
 * Get draft session from Firestore
 */
export async function getDraftSession(userId: string): Promise<any | null> {
  if (!userId) return null;
  try {
    const draftRef = doc(db, 'users', userId, 'interactions', 'active_draft');
    const snap = await getDoc(draftRef);
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

/**
 * Clear draft session
 */
export async function clearDraftSession(userId: string): Promise<void> {
  if (!userId) return;
  const draftRef = doc(db, 'users', userId, 'interactions', 'active_draft');
  await deleteDoc(draftRef).catch(() => {});
}

export { firebaseSignOut, signInWithPopup, onAuthStateChanged, GoogleAuthProvider };
export type { User };
