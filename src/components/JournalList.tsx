import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import type { JournalEntry, JournalFrameworkId } from '../types/journal';
import { JOURNAL_FRAMEWORKS, MOOD_OPTIONS } from '../lib/constants';
import { MoodIcon } from './MoodIcon';
import { JournalDetailModal } from './JournalDetailModal';
import { exportJournalToPdf } from '../lib/pdf-export';
import { formatJournalDate } from '../lib/date-utils';

interface JournalListProps {
  entries: JournalEntry[];
  loading: boolean;
  onDeleteEntry: (id: string) => void;
  onTogglePinEntry?: (id: string, currentPin: boolean) => void;
  onStartNewEntry: () => void;
  onResumeSession?: (entry: JournalEntry) => void;
}

export const JournalList: React.FC<JournalListProps> = ({
  entries,
  loading,
  onDeleteEntry,
  onTogglePinEntry,
  onStartNewEntry,
  onResumeSession,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'words'>('newest');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

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
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 text-[#2c2c26]">
      {/* Header & New Entry CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#7d8461]/10 rounded-none flex items-center justify-center text-[#7d8461]">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif italic font-bold tracking-tight text-[#2c2c26]">
              Personal Journal Archive
            </h1>
          </div>
          <p className="text-xs text-[#5c5c52] mt-1 font-light">
            {entries.length} reflections preserved safely in your personal journal archive.
          </p>
        </div>

        <button
          onClick={onStartNewEntry}
          className="px-5 py-2.5 bg-[#7d8461] hover:bg-[#6c7351] text-white rounded-none text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto uppercase tracking-wider"
        >
          <PenLine className="w-3.5 h-3.5" />
          <span>New Reflection</span>
        </button>
      </div>

      {/* Search & Filter Bar - Square */}
      <div className="bg-white border border-[#ecece0] p-3.5 sm:p-4 rounded-none mb-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#7d8461] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reflections, insights, titles, or themes..."
              className="w-full bg-[#f4f4ea]/50 border border-[#ecece0] focus:border-[#7d8461] rounded-none pl-9 pr-3 py-2 text-xs text-[#2c2c26] placeholder-[#5c5c52]/60 focus:outline-none transition"
            />
          </div>

          {/* Framework & Sort Dropdowns */}
          <div className="flex items-center gap-2">
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="bg-[#f4f4ea]/50 border border-[#ecece0] rounded-none px-3 py-2 text-xs text-[#2c2c26] focus:outline-none focus:border-[#7d8461] cursor-pointer font-medium"
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
              className="bg-[#f4f4ea]/50 border border-[#ecece0] rounded-none px-3 py-2 text-xs text-[#2c2c26] focus:outline-none focus:border-[#7d8461] cursor-pointer font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="words">Most Words</option>
            </select>
          </div>
        </div>

        {/* Mood Filter Chips with SVG Icons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none text-xs">
          <span className="text-[#5c5c52] shrink-0 flex items-center gap-1 mr-1 font-semibold text-[11px]">
            <Filter className="w-3 h-3 text-[#7d8461]" />
            <span>Mood:</span>
          </span>
          <button
            onClick={() => setSelectedMood('all')}
            className={`px-2.5 py-1 rounded-none text-[11px] font-medium shrink-0 transition cursor-pointer ${
              selectedMood === 'all'
                ? 'bg-[#3a3a30] text-[#fbfaf5]'
                : 'bg-[#f4f4ea] border border-[#e8e8df] text-[#5c5c52] hover:bg-[#ecece0]'
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
                  ? 'bg-[#3a3a30] text-[#fbfaf5]'
                  : 'bg-[#f4f4ea] border border-[#e8e8df] text-[#5c5c52] hover:bg-[#ecece0]'
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
        <div className="py-16 text-center text-[#5c5c52]">
          <div className="w-7 h-7 rounded-full border-2 border-[#7d8461] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading your private journal archive...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredEntries.length === 0 && (
        <div className="py-12 text-center bg-white border border-[#ecece0] rounded-none p-8 max-w-lg mx-auto shadow-xs">
          <div className="w-10 h-10 rounded-none bg-[#7d8461]/10 text-[#7d8461] flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-serif italic font-bold text-[#2c2c26] mb-1">No reflections found</h2>
          <p className="text-xs text-[#5c5c52] mb-5 leading-relaxed">
            {searchQuery || selectedMood !== 'all' || selectedFramework !== 'all'
              ? 'Try adjusting your search query or mood filters.'
              : 'Begin your reflection session to start capturing insights.'}
          </p>
          <button
            onClick={onStartNewEntry}
            className="px-5 py-2.5 bg-[#7d8461] hover:bg-[#6c7351] text-white rounded-none text-xs font-bold shadow-xs transition cursor-pointer uppercase tracking-wider"
          >
            Start Reflection
          </button>
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
                className="group p-5 rounded-none bg-white border border-[#e8e8df] hover:border-[#7d8461] transition-all flex flex-col justify-between shadow-xs cursor-pointer relative"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none bg-[#7d8461]/10 text-[#4c5432] border border-[#7d8461]/20">
                      {getFrameworkName(entry.framework)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#5c5c52] font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#7d8461]" />
                      <span>{formattedDate}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif italic font-bold text-[#2c2c26] text-base mb-1.5 group-hover:text-[#7d8461] transition line-clamp-2">
                    {entry.title}
                  </h3>

                  {/* Executive Summary Snippet */}
                  <p className="text-xs text-[#5c5c52] line-clamp-3 leading-relaxed mb-3">
                    {entry.executiveSummary}
                  </p>

                  {/* Key Insight Bullet (if available) */}
                  {entry.keyInsights && entry.keyInsights[0] && (
                    <div className="p-2.5 rounded-none bg-[#f4f4ea] border border-[#ecece0] text-[11px] text-[#2c2c26] mb-3 flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#7d8461] shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed italic">{entry.keyInsights[0]}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-[#ecece0] flex items-center justify-between text-[11px] text-[#5c5c52]">
                  <div className="flex items-center gap-2">
                    {entry.detectedMood && (
                      <span className="flex items-center gap-1 text-[#7d8461] font-medium text-[11px]">
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
                      className="p-1 text-[#5c5c52] hover:text-[#7d8461] hover:bg-[#f4f4ea] rounded-none transition cursor-pointer"
                      title="Export as PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[#7d8461] group-hover:translate-x-0.5 transition flex items-center gap-0.5 font-bold uppercase text-[10px] tracking-wider">
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
      />
    </div>
  );
};
