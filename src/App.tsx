/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { JournalEditor } from './components/JournalEditor';
import { JournalList } from './components/JournalList';
import { AnalyticsView } from './components/AnalyticsView';
import type { JournalEntry, ChatMessage, JournalFrameworkId } from './types/journal';
import {
  fetchUserJournals,
  deleteJournalFromFirestore,
  togglePinJournal,
} from './lib/firebase';
import { Loader2 } from 'lucide-react';

function JournalApp() {
  const { user, loading: authLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<'editor' | 'history' | 'analytics'>('editor');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  // Resume or loaded editor state
  const [editorTranscript, setEditorTranscript] = useState<ChatMessage[] | undefined>(undefined);
  const [editorFramework, setEditorFramework] = useState<JournalFrameworkId | undefined>(undefined);
  const [editorMood, setEditorMood] = useState<string | undefined>(undefined);

  // Load journals from Firestore when user is authenticated
  useEffect(() => {
    if (user?.uid) {
      loadJournals(user.uid);
    } else {
      setEntries([]);
    }
  }, [user?.uid]);

  const loadJournals = async (uid: string) => {
    setLoadingEntries(true);
    try {
      const userEntries = await fetchUserJournals(uid);
      setEntries(userEntries);
    } catch (err) {
      console.error('Failed to load journals from Firestore:', err);
    } finally {
      setLoadingEntries(false);
    }
  };

  // Calculate user streak (consecutive days of journaling)
  const streakCount = useMemo(() => {
    if (entries.length === 0) return 0;

    const uniqueDates: string[] = Array.from(
      new Set<string>(
        entries.map((e) => new Date(e.createdAt).toISOString().split('T')[0])
      )
    ).sort().reverse();

    if (uniqueDates.length === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if the most recent entry was today or yesterday
    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterday) {
      return 0;
    }

    let streak = 1;
    let currentCheck = new Date(uniqueDates[0]);

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i]);
      const diffDays = Math.round(
        (currentCheck.getTime() - prevDate.getTime()) / (1000 * 3600 * 24)
      );

      if (diffDays === 1) {
        streak++;
        currentCheck = prevDate;
      } else {
        break;
      }
    }

    return streak;
  }, [entries]);

  const handleEntrySaved = (newEntry: JournalEntry) => {
    // Prepend new entry
    setEntries((prev) => [newEntry, ...prev.filter((e) => e.id !== newEntry.id)]);
    // Switch to history tab to see the saved entry
    setCurrentTab('history');
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user?.uid) return;
    try {
      await deleteJournalFromFirestore(user.uid, entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  const handleTogglePinEntry = async (entryId: string, currentPin: boolean) => {
    if (!user?.uid) return;
    try {
      await togglePinJournal(user.uid, entryId, currentPin);
      setEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, pinned: !currentPin } : e))
      );
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleResumeSession = (entry: JournalEntry) => {
    setEditorTranscript(entry.transcript);
    setEditorFramework(entry.framework);
    setEditorMood(entry.detectedMood || entry.initialMood);
    setCurrentTab('editor');
  };

  const handleStartNewEntry = () => {
    setEditorTranscript(undefined);
    setEditorFramework(undefined);
    setEditorMood(undefined);
    setCurrentTab('editor');
  };

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fbfaf5] flex items-center justify-center text-[#5c5c52]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#7d8461]" />
          <p className="text-sm font-serif italic text-[#2c2c26]">Loading your journal...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated Visitor View
  if (!user) {
    return <LandingPage />;
  }

  // Authenticated User Dashboard
  return (
    <div className="min-h-screen bg-[#fbfaf5] text-[#2c2c26] flex flex-col selection:bg-[#7d8461] selection:text-white">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        streakCount={streakCount}
        onNewEntry={handleStartNewEntry}
      />

      <main className="flex-1 bg-[#fbfaf5]">
        {currentTab === 'editor' && (
          <JournalEditor
            key={`${editorFramework || 'default'}_${editorTranscript?.length || 0}`}
            initialTranscript={editorTranscript}
            initialFramework={editorFramework}
            initialMood={editorMood}
            onEntrySaved={handleEntrySaved}
          />
        )}

        {currentTab === 'history' && (
          <JournalList
            entries={entries}
            loading={loadingEntries}
            onDeleteEntry={handleDeleteEntry}
            onTogglePinEntry={handleTogglePinEntry}
            onStartNewEntry={handleStartNewEntry}
            onResumeSession={handleResumeSession}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView entries={entries} streakCount={streakCount} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <JournalApp />
    </AuthProvider>
  );
}
