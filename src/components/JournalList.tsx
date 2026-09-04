import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Calendar,
  Sparkles,
  Smile,
  BookOpen,
  PenLine,
  Filter,
  ExternalLink,
  Download,
  FileText,
  FileSpreadsheet,
  FileCode,
  ChevronDown,
  Check,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import type { JournalEntry, JournalFrameworkId } from '../types/journal';
import { JOURNAL_FRAMEWORKS, MOOD_OPTIONS } from '../lib/constants';
import { MoodIcon } from './MoodIcon';
import { JournalDetailModal } from './JournalDetailModal';
import { exportJournalToPdf, exportArchiveToPdf } from '../lib/pdf-export';
import { formatJournalDate, getLocalDateString } from '../lib/date-utils';
import { useAuth } from '../context/AuthContext';
import { saveJournalToFirestore } from '../lib/firebase';

interface JournalListProps {
  entries: JournalEntry[];
  loading: boolean;
  onDeleteEntry: (id: string) => void;
  onTogglePinEntry?: (id: string, currentPin: boolean) => void;
  onStartNewEntry: () => void;
  onResumeSession?: (entry: JournalEntry) => void;
  onSaveEntry?: (entry: JournalEntry) => void;
}

export const JournalList: React.FC<JournalListProps> = ({
  entries,
  loading,
  onDeleteEntry,
  onTogglePinEntry,
  onStartNewEntry,
  onResumeSession,
  onSaveEntry,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'words'>('newest');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [hasActiveDraft, setHasActiveDraft] = useState(false);
  const [activeDraftData, setActiveDraftData] = useState<any>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const draft = localStorage.getItem('fuenzer_journal_active_draft_v2');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (Array.isArray(parsed?.messages) && parsed.messages.length > 1) {
          setHasActiveDraft(true);
          setActiveDraftData(parsed);
        }
      }
    } catch {}
  }, []);

  const handleQuickSaveDraft = async () => {
    if (!activeDraftData?.messages || activeDraftData.messages.length === 0) {
      onStartNewEntry();
      return;
    }
    setSavingDraft(true);
    try {
      const now = Date.now();
      const userMsgs = activeDraftData.messages.filter((m: any) => m.role === 'user');
      const firstUserMsg = userMsgs[0]?.content || 'Personal Reflection';
      const cleanTitle = firstUserMsg.slice(0, 45).replace(/[#*_\n]/g, ' ').trim() || 'Socratic Reflection';

      const totalWords = activeDraftData.messages.reduce(
        (acc: number, m: any) => acc + (m.content ? m.content.split(/\s+/).length : 0),
        0
      );

      const newEntry: JournalEntry = {
        id: `journal_${now}_${Math.random().toString(36).substring(2, 8)}`,
        userId: user?.uid || 'guest_user',
        title: cleanTitle,
        createdAt: now,
        updatedAt: now,
        framework: activeDraftData.framework || 'socratic',
        initialMood: activeDraftData.currentMood || 'calm',
        detectedMood: activeDraftData.currentMood || 'calm',
        themes: ['Reflection', 'Inquiry'],
        executiveSummary: userMsgs.map((m: any) => m.content).join(' ').slice(0, 320) + '...',
        keyInsights: [
          'In-progress reflection saved from active session.',
          userMsgs[userMsgs.length - 1]?.content
            ? `Reflection focus: "${userMsgs[userMsgs.length - 1].content.slice(0, 120)}"`
            : 'Socratic dialogue captured into archive.',
        ],
        actionItems: ['Review captured reflection insights', 'Continue mindful contemplation'],
        closingAffirmation: 'Self-awareness is the foundation of growth and clarity.',
        transcript: activeDraftData.messages,
        wordCount: totalWords,
        pinned: false,
      };

      if (user?.uid) {
        await saveJournalToFirestore(user.uid, newEntry);
      }
      localStorage.removeItem('fuenzer_journal_active_draft_v2');
      setHasActiveDraft(false);
      if (onSaveEntry) {
        onSaveEntry(newEntry);
      }
    } catch (err) {
      console.error('Failed to quick-save draft to Firestore:', err);
    } finally {
      setSavingDraft(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerDownload = (blob: Blob, filename: string, feedback: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
    setExportSuccess(feedback);
    setTimeout(() => setExportSuccess(null), 3000);
  };

  const handleExportPdf = () => {
    try {
      exportArchiveToPdf(filteredEntries, selectedFramework === 'all' ? 'All Reflections' : `Framework: ${selectedFramework}`);
      setIsExportOpen(false);
      setExportSuccess('Archive PDF exported');
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      console.error('PDF export failed', err);
    }
  };

  const handleExportJson = () => {
    const exportPayload = {
      exportDate: new Date().toISOString(),
      appVersion: '2.0.0',
      totalPreserved: filteredEntries.length,
      scope: selectedFramework === 'all' ? 'All Entries' : `Filtered (${selectedFramework})`,
      entries: filteredEntries.map((e) => ({
        id: e.id,
        title: e.title || 'Untitled Reflection',
        createdAt: e.createdAt,
        updatedAt: e.updatedAt || e.createdAt,
        formattedDate: formatJournalDate(e.createdAt),
        framework: e.framework,
        initialMood: e.initialMood,
        detectedMood: e.detectedMood,
        moodScore: e.moodScore,
        wordCount: e.wordCount || 0,
        executiveSummary: e.executiveSummary || '',
        keyInsights: e.keyInsights || [],
        actionItems: e.actionItems || [],
        cognitiveDistortions: e.cognitiveDistortions || [],
        themes: e.themes || [],
        transcript: e.transcript || [],
      })),
    };
    const jsonStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    triggerDownload(blob, `fuenzer_journal_archive_${getLocalDateString(new Date())}.json`, 'JSON archive exported');
  };

  const handleExportCsv = () => {
    const headers = [
      'Date',
      'Time',
      'Title',
      'Framework',
      'Mood',
      'Mood Score',
      'Word Count',
      'Themes',
      'Executive Summary',
      'Key Insights',
      'Action Items',
      'Cognitive Distortions',
    ];
    const rows = filteredEntries.map((e) => {
      const d = new Date(e.createdAt);
      return [
        `"${getLocalDateString(d)}"`,
        `"${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}"`,
        `"${(e.title || 'Untitled').replace(/"/g, '""')}"`,
        `"${e.framework}"`,
        `"${e.detectedMood || e.initialMood || 'Reflective'}"`,
        e.moodScore ? e.moodScore.toFixed(1) : '3.3',
        e.wordCount || 0,
        `"${(e.themes || []).join(', ')}"`,
        `"${(e.executiveSummary || '').replace(/"/g, '""')}"`,
        `"${(e.keyInsights || []).join(' | ').replace(/"/g, '""')}"`,
        `"${(e.actionItems || []).join(' | ').replace(/"/g, '""')}"`,
        `"${(e.cognitiveDistortions || []).join(' | ').replace(/"/g, '""')}"`,
      ];
    });
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `fuenzer_journal_archive_${getLocalDateString(new Date())}.csv`, 'CSV spreadsheet exported');
  };

  const handleExportMarkdown = () => {
    let md = `# Personal Journal Archive Digest\n`;
    md += `*Exported on ${formatJournalDate(Date.now(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} • ${filteredEntries.length} reflections preserved*\n\n`;

    filteredEntries.forEach((e, idx) => {
      md += `## ${idx + 1}. ${e.title || 'Untitled Reflection'}\n`;
      md += `*Date: ${formatJournalDate(e.createdAt)} | Framework: ${e.framework} | Mood: ${e.detectedMood || e.initialMood || 'Reflective'} | Words: ${e.wordCount || 0}*\n\n`;
      if (e.executiveSummary) {
        md += `> **Executive Summary:** ${e.executiveSummary}\n\n`;
      }
      if (e.keyInsights && e.keyInsights.length > 0) {
        md += `**Key Realizations:**\n`;
        e.keyInsights.forEach((ki) => {
          md += `- ${ki}\n`;
        });
        md += `\n`;
      }
      if (e.actionItems && e.actionItems.length > 0) {
        md += `**Action Items:**\n`;
        e.actionItems.forEach((ai) => {
          md += `- [ ] ${ai}\n`;
        });
        md += `\n`;
      }
      if (e.cognitiveDistortions && e.cognitiveDistortions.length > 0) {
        md += `**Cognitive Patterns Reframed:**\n`;
        e.cognitiveDistortions.forEach((cd) => {
          md += `- *${cd}*\n`;
        });
        md += `\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    triggerDownload(blob, `fuenzer_journal_archive_${getLocalDateString(new Date())}.md`, 'Markdown archive exported');
  };

  // Filter & Search Logic
  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        // Mood filter
        if (selectedMood !== 'all') {
          const matchInitial = entry.initialMood?.toLowerCase() === selectedMood.toLowerCase();
          const matchDetected = entry.detectedMood?.toLowerCase().includes(selectedMood.toLowerCase());
          if (!matchInitial && !matchDetected) return false;
        }

        // Framework filter
        if (selectedFramework !== 'all' && entry.framework !== selectedFramework) {
          return false;
        }

        // Text Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = entry.title.toLowerCase().includes(q);
          const matchSummary = entry.executiveSummary.toLowerCase().includes(q);
          const matchThemes = entry.themes?.some((t) => t.toLowerCase().includes(q));
          const matchInsights = entry.keyInsights?.some((i) => i.toLowerCase().includes(q));
          const matchTranscript = entry.transcript?.some((t) => t.content.toLowerCase().includes(q));
          return matchTitle || matchSummary || matchThemes || matchInsights || matchTranscript;
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned entries first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        if (sortBy === 'newest') return b.createdAt - a.createdAt;
        if (sortBy === 'oldest') return a.createdAt - b.createdAt;
        if (sortBy === 'words') return (b.wordCount || 0) - (a.wordCount || 0);
        return 0;
      });
  }, [entries, searchQuery, selectedMood, selectedFramework, sortBy]);

  const getFrameworkName = (fwId: JournalFrameworkId) => {
    return JOURNAL_FRAMEWORKS.find((f) => f.id === fwId)?.name || 'Reflection';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-[#2c2c26] dark:text-[#f0efe6]">
      {/* Header & New Entry CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#7d8461]/10 dark:bg-[#7d8461]/20 rounded-none flex items-center justify-center text-[#7d8461] dark:text-[#9ca87a]">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif italic font-bold tracking-tight text-[#2c2c26] dark:text-[#f0efe6]">
              Personal Journal Archive
            </h1>
          </div>
          <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] mt-1 font-light">
            {entries.length} reflections preserved safely in your personal journal archive.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <div className="flex items-center gap-2">
              {exportSuccess && (
                <span className="text-[11px] font-medium text-[#7d8461] dark:text-[#9ca87a] bg-[#7d8461]/10 dark:bg-[#7d8461]/20 border border-[#7d8461]/30 px-2.5 py-1 flex items-center gap-1 animate-in fade-in duration-200">
                  <Check className="w-3 h-3" />
                  <span>{exportSuccess}</span>
                </span>
              )}
              <button
                onClick={() => setIsExportOpen((prev) => !prev)}
                disabled={entries.length === 0}
                className="px-3.5 sm:px-4 py-2.5 bg-[#3a3a30] dark:bg-[#e8e8df] hover:bg-[#2c2c26] dark:hover:bg-white text-[#fbfaf5] dark:text-[#181814] rounded-none text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-wider shadow-xs shrink-0"
                title="Export preserved journal reflections"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isExportOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {isExportOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-[#23231c] border border-[#2c2c26]/20 dark:border-[#38382e] shadow-xl rounded-none z-30 divide-y divide-[#ecece0] dark:divide-[#38382e] animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2">
                  <p className="text-[10px] uppercase tracking-wider text-[#7d8461] dark:text-[#9ca87a] font-bold px-2 py-1">
                    Export Archive ({filteredEntries.length})
                  </p>

                  <button
                    onClick={handleExportPdf}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left text-xs text-[#2c2c26] dark:text-[#f0efe6] hover:bg-[#f4f4ea] dark:hover:bg-[#2c2c24] transition cursor-pointer"
                  >
                    <div className="w-6 h-6 bg-[#7d8461]/10 dark:bg-[#7d8461]/20 text-[#7d8461] dark:text-[#9ca87a] flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold block">Archive Digest (PDF)</span>
                      <span className="text-[10px] text-[#5c5c52] dark:text-[#a8a89b]">Formatted document compilation</span>
                    </div>
                  </button>

                  <button
                    onClick={handleExportCsv}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left text-xs text-[#2c2c26] dark:text-[#f0efe6] hover:bg-[#f4f4ea] dark:hover:bg-[#2c2c24] transition cursor-pointer"
                  >
                    <div className="w-6 h-6 bg-[#b08968]/15 dark:bg-[#b08968]/25 text-[#b08968] dark:text-[#ddb892] flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold block">Spreadsheet (CSV)</span>
                      <span className="text-[10px] text-[#5c5c52] dark:text-[#a8a89b]">Compatible with Excel / Sheets</span>
                    </div>
                  </button>

                  <button
                    onClick={handleExportJson}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left text-xs text-[#2c2c26] dark:text-[#f0efe6] hover:bg-[#f4f4ea] dark:hover:bg-[#2c2c24] transition cursor-pointer"
                  >
                    <div className="w-6 h-6 bg-[#606c38]/15 dark:bg-[#606c38]/25 text-[#606c38] dark:text-[#9ca87a] flex items-center justify-center shrink-0">
                      <FileCode className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold block">Full Backup (JSON)</span>
                      <span className="text-[10px] text-[#5c5c52] dark:text-[#a8a89b]">Full structured backup</span>
                    </div>
                  </button>

                  <button
                    onClick={handleExportMarkdown}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left text-xs text-[#2c2c26] dark:text-[#f0efe6] hover:bg-[#f4f4ea] dark:hover:bg-[#2c2c24] transition cursor-pointer"
                  >
                    <div className="w-6 h-6 bg-[#3a3a30]/10 dark:bg-[#3a3a30]/30 text-[#3a3a30] dark:text-[#d8d8cc] flex items-center justify-center shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold block">Markdown Digest (.MD)</span>
                      <span className="text-[10px] text-[#5c5c52] dark:text-[#a8a89b]">Obsidian / Notion readable</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onStartNewEntry}
            className="px-4 sm:px-5 py-2.5 bg-[#7d8461] hover:bg-[#6c7351] text-white rounded-none text-xs font-bold shadow-xs transition inline-flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider shrink-0"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>New Reflection</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar - Square */}
      <div className="bg-white dark:bg-[#23231c] border border-[#ecece0] dark:border-[#38382e] p-3.5 sm:p-4 rounded-none mb-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reflections, insights, titles, or themes..."
              className="w-full bg-[#f4f4ea]/50 dark:bg-[#1a1a16] border border-[#ecece0] dark:border-[#38382e] focus:border-[#7d8461] rounded-none pl-9 pr-3 py-2 text-xs text-[#2c2c26] dark:text-[#f0efe6] placeholder-[#5c5c52]/60 dark:placeholder-[#a8a89b]/60 focus:outline-none transition"
            />
          </div>

          {/* Framework & Sort Dropdowns */}
          <div className="flex items-center gap-2">
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="bg-[#f4f4ea]/50 dark:bg-[#1a1a16] border border-[#ecece0] dark:border-[#38382e] rounded-none px-3 py-2 text-xs text-[#2c2c26] dark:text-[#f0efe6] focus:outline-none focus:border-[#7d8461] cursor-pointer font-medium"
            >
              <option value="all">All Frameworks</option>
              {JOURNAL_FRAMEWORKS.map((fw) => (
                <option key={fw.id} value={fw.id}>
                  {fw.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#f4f4ea]/50 dark:bg-[#1a1a16] border border-[#ecece0] dark:border-[#38382e] rounded-none px-3 py-2 text-xs text-[#2c2c26] dark:text-[#f0efe6] focus:outline-none focus:border-[#7d8461] cursor-pointer font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="words">Most Words</option>
            </select>
          </div>
        </div>

        {/* Mood Filter Chips with SVG Icons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none text-xs">
          <span className="text-[#5c5c52] dark:text-[#a8a89b] shrink-0 flex items-center gap-1 mr-1 font-semibold text-[11px]">
            <Filter className="w-3 h-3 text-[#7d8461] dark:text-[#9ca87a]" />
            <span>Mood:</span>
          </span>
          <button
            onClick={() => setSelectedMood('all')}
            className={`px-2.5 py-1 rounded-none text-[11px] font-medium shrink-0 transition cursor-pointer ${
              selectedMood === 'all'
                ? 'bg-[#3a3a30] dark:bg-[#4a4a3e] text-[#fbfaf5]'
                : 'bg-[#f4f4ea] dark:bg-[#1a1a16] border border-[#e8e8df] dark:border-[#38382e] text-[#5c5c52] dark:text-[#a8a89b] hover:bg-[#ecece0] dark:hover:bg-[#282820]'
            }`}
          >
            All
          </button>
          {MOOD_OPTIONS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMood(selectedMood === m.id ? 'all' : m.id)}
              className={`px-2.5 py-1 rounded-none text-[11px] font-medium shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                selectedMood === m.id
                  ? 'bg-[#3a3a30] dark:bg-[#4a4a3e] text-[#fbfaf5]'
                  : 'bg-[#f4f4ea] dark:bg-[#1a1a16] border border-[#e8e8df] dark:border-[#38382e] text-[#5c5c52] dark:text-[#a8a89b] hover:bg-[#ecece0] dark:hover:bg-[#282820]'
              }`}
            >
              <MoodIcon iconName={m.iconName} className="w-3 h-3" />
              <span>{m.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center text-[#5c5c52] dark:text-[#a8a89b]">
          <div className="w-7 h-7 rounded-full border-2 border-[#7d8461] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading your private journal archive...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredEntries.length === 0 && (
        <div className="py-12 text-center bg-white dark:bg-[#23231c] border border-[#ecece0] dark:border-[#38382e] rounded-none p-8 max-w-lg mx-auto shadow-xs">
          <div className="w-10 h-10 rounded-none bg-[#7d8461]/10 dark:bg-[#7d8461]/20 text-[#7d8461] dark:text-[#9ca87a] flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6] mb-1">
            {searchQuery || selectedMood !== 'all' || selectedFramework !== 'all'
              ? 'No matching reflections found'
              : 'Your reflection archive is empty'}
          </h2>
          <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] mb-5 leading-relaxed max-w-md mx-auto">
            {searchQuery || selectedMood !== 'all' || selectedFramework !== 'all'
              ? 'Try adjusting your search query or mood filters to see other entries.'
              : hasActiveDraft
              ? 'You have an in-progress reflection draft! Click Resume to review and save it to your permanent Firestore archive.'
              : 'You haven’t saved any reflections to your account yet. Complete a reflection session to capture Socratic insights and view them here.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {hasActiveDraft && (
              <>
                <button
                  onClick={handleQuickSaveDraft}
                  disabled={savingDraft}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#3a3a30] dark:bg-[#e8e8df] hover:bg-[#2c2c26] dark:hover:bg-[#f0efe6] text-[#fbfaf5] dark:text-[#181814] rounded-none text-xs font-bold shadow-xs transition cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-50"
                  title="Save current draft directly to your permanent Firestore archive"
                >
                  {savingDraft ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7d8461]" />
                      <span>Saving to Archive...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#ddb892] dark:text-[#7d8461]" />
                      <span>Quick-Save Draft to Archive</span>
                    </>
                  )}
                </button>
                <button
                  onClick={onStartNewEntry}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#ddb892] hover:bg-[#c9a47e] text-[#2c2c26] rounded-none text-xs font-bold shadow-xs transition cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Resume in Editor
                </button>
              </>
            )}
            <button
              onClick={onStartNewEntry}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#7d8461] hover:bg-[#6c7351] text-white rounded-none text-xs font-bold shadow-xs transition cursor-pointer uppercase tracking-wider"
            >
              Start New Reflection
            </button>
          </div>
        </div>
      )}

      {/* Entries Grid - Square Cards */}
      {!loading && filteredEntries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map((entry) => {
            const formattedDate = formatJournalDate(entry.createdAt);

            return (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="group p-5 rounded-none bg-white dark:bg-[#23231c] border border-[#e8e8df] dark:border-[#38382e] hover:border-[#7d8461] dark:hover:border-[#9ca87a] transition-all flex flex-col justify-between shadow-xs cursor-pointer relative"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none bg-[#7d8461]/10 dark:bg-[#7d8461]/20 text-[#4c5432] dark:text-[#9ca87a] border border-[#7d8461]/20">
                      {getFrameworkName(entry.framework)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#5c5c52] dark:text-[#a8a89b] font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#7d8461] dark:text-[#9ca87a]" />
                      <span>{formattedDate}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6] text-base mb-1.5 group-hover:text-[#7d8461] dark:group-hover:text-[#9ca87a] transition line-clamp-2">
                    {entry.title}
                  </h3>

                  {/* Executive Summary Snippet */}
                  <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] line-clamp-3 leading-relaxed mb-3">
                    {entry.executiveSummary}
                  </p>

                  {/* Key Insight Bullet (if available) */}
                  {entry.keyInsights && entry.keyInsights[0] && (
                    <div className="p-2.5 rounded-none bg-[#f4f4ea] dark:bg-[#1a1a16] border border-[#ecece0] dark:border-[#38382e] text-[11px] text-[#2c2c26] dark:text-[#f0efe6] mb-3 flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a] shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed italic">{entry.keyInsights[0]}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-[#ecece0] dark:border-[#38382e] flex items-center justify-between text-[11px] text-[#5c5c52] dark:text-[#a8a89b]">
                  <div className="flex items-center gap-2">
                    {entry.detectedMood && (
                      <span className="flex items-center gap-1 text-[#7d8461] dark:text-[#9ca87a] font-medium text-[11px]">
                        <Smile className="w-3 h-3" />
                        <span className="truncate max-w-[90px]">{entry.detectedMood}</span>
                      </span>
                    )}
                    <span>•</span>
                    <span className="font-mono text-[10px]">~{entry.wordCount || 0} w</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportJournalToPdf(entry);
                      }}
                      className="p-1 text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#7d8461] dark:hover:text-[#9ca87a] hover:bg-[#f4f4ea] dark:hover:bg-[#1a1a16] rounded-none transition cursor-pointer"
                      title="Export as PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[#7d8461] dark:text-[#9ca87a] group-hover:translate-x-0.5 transition flex items-center gap-0.5 font-bold uppercase text-[10px] tracking-wider">
                      <span>Read</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Detail Reader Modal */}
      <JournalDetailModal
        entry={selectedEntry}
        isOpen={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        onDelete={(id) => {
          onDeleteEntry(id);
          setSelectedEntry(null);
        }}
        onTogglePin={onTogglePinEntry}
        onResumeSession={onResumeSession}
        onUpdateEntryActionItems={(id, items) => {
          if (selectedEntry && selectedEntry.id === id) {
            setSelectedEntry({ ...selectedEntry, actionItems: items });
          }
        }}
      />
    </div>
  );
};
