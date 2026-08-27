/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { JournalEditor } from './components/JournalEditor';
import { JournalList } from './components/JournalList';
import { AnalyticsView } from './components/AnalyticsView';
import { CommandPalette } from './components/CommandPalette';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { PrivacyPolicyModal } from './components/LegalModals';
import { PageTitleManager } from './hooks/usePageTitle';
import type { JournalEntry, ChatMessage, JournalFrameworkId } from './types/journal';
import {
  fetchUserJournals,
  deleteJournalFromFirestore,
  togglePinJournal,
} from './lib/firebase';
import { getLocalDateString } from './lib/date-utils';
import { Loader2, Feather, X, Sparkles } from 'lucide-react';

interface JournalDashboardProps {
  initialTab?: 'editor' | 'history' | 'analytics';
}

function JournalDashboard({ initialTab = 'editor' }: JournalDashboardProps) {
  const { user, isGuest, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current tab based on URL or initial prop
  const currentTab: 'editor' | 'history' | 'analytics' = useMemo(() => {
    if (location.pathname.startsWith('/archive')) return 'history';
    if (location.pathname.startsWith('/analytics')) return 'analytics';
    return 'editor';
  }, [location.pathname]);

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  // Daily reminder nudge dismiss state
  const [reminderDismissed, setReminderDismissed] = useState<boolean>(() => {
    const todayStr = getLocalDateString(new Date());
    return localStorage.getItem(`fuenzer_reminder_dismissed_${todayStr}`) === 'true';
  });

  // Resume or loaded editor state
  const [editorTranscript, setEditorTranscript] = useState<ChatMessage[] | undefined>(undefined);
  const [editorFramework, setEditorFramework] = useState<JournalFrameworkId | undefined>(undefined);
  const [editorMood, setEditorMood] = useState<string | undefined>(undefined);
  const [editingEntryId, setEditingEntryId] = useState<string | undefined>(undefined);
  const [editingEntryCreatedAt, setEditingEntryCreatedAt] = useState<number | undefined>(undefined);

  // Local storage key for guest reflection archive
  const GUEST_STORAGE_KEY = 'fuenzer_guest_journal_entries';

  // Load journals from Firestore when authenticated, or from localStorage in guest mode
  useEffect(() => {
    if (user?.uid) {
      loadJournals(user.uid);
    } else {
      try {
        const localData = localStorage.getItem(GUEST_STORAGE_KEY);
        if (localData) {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed)) {
            setEntries(parsed);
          } else {
            setEntries([]);
          }
        } else {
          setEntries([]);
        }
      } catch (err) {
        console.warn('Failed to load guest journals from localStorage:', err);
        setEntries([]);
      }
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

  // Check if today has a logged entry
  const hasEntryToday = useMemo(() => {
    const todayStr = getLocalDateString(new Date());
    return entries.some((e) => getLocalDateString(new Date(e.createdAt)) === todayStr);
  }, [entries]);

  const handleDismissReminder = () => {
    const todayStr = getLocalDateString(new Date());
    localStorage.setItem(`fuenzer_reminder_dismissed_${todayStr}`, 'true');
    setReminderDismissed(true);
  };

  // Calculate user streak (consecutive days of journaling based on local dates)
  const streakCount = useMemo(() => {
    if (entries.length === 0) return 0;

    const uniqueDates: string[] = Array.from(
      new Set<string>(
        entries.map((e) => getLocalDateString(new Date(e.createdAt)))
      )
    ).sort().reverse();

    if (uniqueDates.length === 0) return 0;

    const todayStr = getLocalDateString(new Date());
    const yesterday = getLocalDateString(new Date(Date.now() - 86400000));

    // Check if the most recent entry was today or yesterday
    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterday) {
      return 0;
    }

    let streak = 1;
    let currentCheck = new Date(uniqueDates[0] + 'T00:00:00');

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i] + 'T00:00:00');
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
    // Prepend or update new entry
    setEntries((prev) => {
      const updated = [newEntry, ...prev.filter((e) => e.id !== newEntry.id)];
      if (!user?.uid) {
        try {
          localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to persist guest entry to localStorage:', e);
        }
      }
      return updated;
    });
    // Reset editor state
    setEditorTranscript(undefined);
    setEditorFramework(undefined);
    setEditorMood(undefined);
    setEditingEntryId(undefined);
    setEditingEntryCreatedAt(undefined);
    // Switch to history tab / archive route
    navigate('/archive');
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (user?.uid) {
      try {
        await deleteJournalFromFirestore(user.uid, entryId);
        setEntries((prev) => prev.filter((e) => e.id !== entryId));
      } catch (err) {
        console.error('Failed to delete entry from Firestore:', err);
      }
    } else {
      // Guest mode: update state and localStorage
      setEntries((prev) => {
        const updated = prev.filter((e) => e.id !== entryId);
        try {
          localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to delete guest entry from localStorage:', e);
        }
        return updated;
      });
    }
  };

  const handleTogglePinEntry = async (entryId: string, currentPin: boolean) => {
    if (user?.uid) {
      try {
        await togglePinJournal(user.uid, entryId, currentPin);
        setEntries((prev) =>
          prev.map((e) => (e.id === entryId ? { ...e, pinned: !currentPin } : e))
        );
      } catch (err) {
        console.error('Failed to toggle pin in Firestore:', err);
      }
    } else {
      // Guest mode: update state and localStorage
      setEntries((prev) => {
        const updated = prev.map((e) => (e.id === entryId ? { ...e, pinned: !currentPin } : e));
        try {
          localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to toggle pin for guest in localStorage:', e);
        }
        return updated;
      });
    }
  };

  const handleResumeSession = (entry: JournalEntry) => {
    setEditorTranscript(entry.transcript);
    setEditorFramework(entry.framework);
    setEditorMood(entry.detectedMood || entry.initialMood);
    setEditingEntryId(entry.id);
    setEditingEntryCreatedAt(entry.createdAt);
    navigate('/app');
  };

  const handleStartNewEntry = () => {
    setEditorTranscript(undefined);
    setEditorFramework(undefined);
    setEditorMood(undefined);
    setEditingEntryId(undefined);
    setEditingEntryCreatedAt(undefined);
    navigate('/app');
  };

  const handleTabChange = (tab: 'editor' | 'history' | 'analytics') => {
    if (tab === 'editor') navigate('/app');
    else if (tab === 'history') navigate('/archive');
    else if (tab === 'analytics') navigate('/analytics');
  };

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fbfaf5] dark:bg-[#181814] flex items-center justify-center text-[#5c5c52] dark:text-[#a8a89b]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#7d8461]" />
          <p className="text-sm font-serif italic text-[#2c2c26] dark:text-[#f0efe6]">Loading your sanctuary...</p>
        </div>
      </div>
    );
  }

  // If user is not signed in and not a guest, redirect to login page
  if (!user && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  // Dashboard View (Authenticated or Guest)
  return (
    <div className="min-h-screen bg-[#fbfaf5] dark:bg-[#181814] text-[#2c2c26] dark:text-[#f0efe6] flex flex-col justify-between selection:bg-[#7d8461] selection:text-white w-full overflow-x-clip">
      <div className="flex-1 flex flex-col w-full min-w-0">
        <Navbar
          currentTab={currentTab}
          setCurrentTab={handleTabChange}
          streakCount={streakCount}
          onNewEntry={handleStartNewEntry}
        />

        {/* Daily Reflection Reminder Nudge Banner */}
        {!hasEntryToday && !reminderDismissed && (
          <div className="bg-[#7d8461]/10 dark:bg-[#7d8461]/15 border-b border-[#7d8461]/25 px-4 py-2.5 text-xs text-[#2c2c26] dark:text-[#f0efe6] animate-in fade-in duration-300 w-full">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-none bg-[#7d8461] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Feather className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-serif italic font-bold text-xs">
                    Daily Reflection Nudge:
                  </span>
                  <span className="text-[#5c5c52] dark:text-[#a8a89b] ml-1.5 hidden sm:inline">
                    You haven&apos;t logged a reflection today. Taking 3 minutes cultivates calm and self-clarity.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={handleStartNewEntry}
                  className="px-3 py-1 bg-[#7d8461] hover:bg-[#6c7351] text-white text-[11px] font-bold uppercase tracking-wider rounded-none shadow-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-3 h-3 text-[#ddb892]" />
                  <span>Reflect Now</span>
                </button>
                <button
                  onClick={handleDismissReminder}
                  className="p-1 hover:bg-[#7d8461]/20 rounded-none text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] transition cursor-pointer"
                  title="Dismiss for today"
                  aria-label="Dismiss daily reminder"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 bg-[#fbfaf5] dark:bg-[#181814] w-full min-w-0">
          {currentTab === 'editor' && (
            <JournalEditor
              key={`${editingEntryId || 'new'}_${editorFramework || 'default'}_${editorTranscript?.length || 0}`}
              initialTranscript={editorTranscript}
              initialFramework={editorFramework}
              initialMood={editorMood}
              editingEntryId={editingEntryId}
              editingEntryCreatedAt={editingEntryCreatedAt}
              onEntrySaved={handleEntrySaved}
              onStartNewChat={handleStartNewEntry}
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

      {/* Enterprise Global Footer */}
      <Footer />
    </div>
  );
}

function GlobalCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <CommandPalette
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  );
}

export default function App() {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <PageTitleManager />
          <GlobalCommandPalette />
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Dedicated Login Page */}
            <Route path="/login" element={<LoginPage />} />

            {/* Legal Pages */}
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />

            {/* Authenticated Dashboard Routes */}
            <Route path="/app" element={<JournalDashboard initialTab="editor" />} />
            <Route path="/archive" element={<JournalDashboard initialTab="history" />} />
            <Route path="/analytics" element={<JournalDashboard initialTab="analytics" />} />

            {/* 404 Not Found Catch-All Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          {/* Global Cookie Consent System with Google Analytics G-90FWP0F2D3 */}
          <CookieBanner onOpenPrivacyPolicy={() => setShowPrivacyModal(true)} />
          <PrivacyPolicyModal
            isOpen={showPrivacyModal}
            onClose={() => setShowPrivacyModal(false)}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
