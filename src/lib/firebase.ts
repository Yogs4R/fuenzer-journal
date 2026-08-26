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
} from 'firebase/firestore';
import type { JournalEntry } from '../types/journal';
import { parseTimestamp } from './date-utils';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfigJson) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfigJson as any).firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

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
 * Fetch all journals for authenticated user in chronological order
 */
export async function fetchUserJournals(userId: string): Promise<JournalEntry[]> {
  if (!userId) return [];

  const journalsRef = collection(db, 'users', userId, 'journals');
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
 * Delete a journal entry strictly under user's isolated path
 */
export async function deleteJournalFromFirestore(
  userId: string,
  journalId: string
): Promise<void> {
  if (!userId || !journalId) throw new Error('Invalid user or journal ID');
  const journalDocRef = doc(db, 'users', userId, 'journals', journalId);
  await deleteDoc(journalDocRef);
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
 * Save draft session interaction to Firestore /users/{userId}/interactions/active_draft
 */
export async function saveDraftSession(
  userId: string,
  draftData: any
): Promise<void> {
  if (!userId) return;
  const draftRef = doc(db, 'users', userId, 'interactions', 'active_draft');
  await setDoc(draftRef, sanitizeForFirestore({ ...draftData, updatedAt: Date.now() }));
}

/**
 * Get draft session from Firestore
 */
export async function getDraftSession(userId: string): Promise<any | null> {
  if (!userId) return null;
  const draftRef = doc(db, 'users', userId, 'interactions', 'active_draft');
  const snap = await getDoc(draftRef);
  return snap.exists() ? snap.data() : null;
}

/**
 * Clear draft session
 */
export async function clearDraftSession(userId: string): Promise<void> {
  if (!userId) return;
  const draftRef = doc(db, 'users', userId, 'interactions', 'active_draft');
  await deleteDoc(draftRef).catch(() => {});
}

export { firebaseSignOut, signInWithPopup, onAuthStateChanged };
export type { User };
