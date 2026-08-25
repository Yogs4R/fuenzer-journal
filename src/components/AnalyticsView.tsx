import React, { useMemo } from 'react';
import {
  BarChart3,
  Flame,
  BookOpen,
  PenTool,
  Smile,
  Sparkles,
  TrendingUp,
  Download,
  Tag,
} from 'lucide-react';
import type { JournalEntry } from '../types/journal';
import { JOURNAL_FRAMEWORKS } from '../lib/constants';

interface AnalyticsViewProps {
  entries: JournalEntry[];
  streakCount: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ entries, streakCount }) => {
  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const totalWords = entries.reduce((acc, e) => acc + (e.wordCount || 0), 0);
    const totalInsights = entries.reduce((acc, e) => acc + (e.keyInsights?.length || 0), 0);
    const avgWords = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;
    const avgInsights = totalEntries > 0 ? (totalInsights / totalEntries).toFixed(1) : '0';

    // Mood distribution
    const moodCounts: Record<string, number> = {};
    entries.forEach((e) => {
      const mood = e.detectedMood || e.initialMood || 'Reflective';
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });

    const topMoods = Object.entries(moodCounts)
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Theme counts
    const themeCounts: Record<string, number> = {};
    entries.forEach((e) => {
      e.themes?.forEach((t) => {
        const clean = t.trim();
        if (clean) {
          themeCounts[clean] = (themeCounts[clean] || 0) + 1;
        }
      });
    });

    const topThemes = Object.entries(themeCounts)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Framework counts
    const frameworkCounts: Record<string, number> = {};
    entries.forEach((e) => {
      frameworkCounts[e.framework] = (frameworkCounts[e.framework] || 0) + 1;
    });

    return {
      totalEntries,
      totalWords,
      totalInsights,
      avgWords,
      avgInsights,
      topMoods,
      topThemes,
      frameworkCounts,
    };
  }, [entries]);

  const handleExportAllJson = () => {
    const jsonStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal_gemini_journal_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 text-[#2c2c26]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#7d8461]/10 rounded-none flex items-center justify-center text-[#7d8461]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif italic font-bold tracking-tight text-[#2c2c26]">
              Reflection Insights & Growth Analytics
            </h1>
          </div>
          <p className="text-xs text-[#5c5c52] mt-1 font-light">
            Patterns, recurring breakthroughs, and emotional growth cultivated over time.
          </p>
        </div>

        <button
          onClick={handleExportAllJson}
          disabled={entries.length === 0}
          className="px-4 py-2 bg-[#3a3a30] hover:bg-[#2c2c26] text-[#fbfaf5] rounded-none text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-wider shadow-xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export All Data (JSON)</span>
        </button>
      </div>

      {/* Metric Cards Grid - Square */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-none bg-white border border-[#e8e8df] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#5c5c52] font-bold">Total Reflections</span>
            <BookOpen className="w-3.5 h-3.5 text-[#7d8461]" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif italic font-bold text-[#2c2c26]">{stats.totalEntries}</p>
          <p className="text-[9px] uppercase tracking-wider text-[#7d8461] font-semibold mt-1">Saved Reflections</p>
        </div>

        <div className="p-4 sm:p-5 rounded-none bg-white border border-[#e8e8df] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#5c5c52] font-bold">Daily Streak</span>
            <Flame className="w-3.5 h-3.5 text-[#d48b0c]" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif italic font-bold text-[#8a6b18]">{streakCount} Days</p>
          <p className="text-[9px] uppercase tracking-wider text-[#5c5c52] font-medium mt-1">Consistent reflection</p>
        </div>

        <div className="p-4 sm:p-5 rounded-none bg-white border border-[#e8e8df] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#5c5c52] font-bold">Words Reflected</span>
            <PenTool className="w-3.5 h-3.5 text-[#9c6644]" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif italic font-bold text-[#7f4f24]">{stats.totalWords.toLocaleString()}</p>
          <p className="text-[9px] uppercase tracking-wider text-[#5c5c52] font-medium mt-1">~{stats.avgWords} words/entry</p>
        </div>

        <div className="p-4 sm:p-5 rounded-none bg-white border border-[#e8e8df] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#5c5c52] font-bold">Insights Distilled</span>
            <Sparkles className="w-3.5 h-3.5 text-[#7d8461]" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif italic font-bold text-[#4c5432]">{stats.totalInsights}</p>
          <p className="text-[9px] uppercase tracking-wider text-[#5c5c52] font-medium mt-1">~{stats.avgInsights} / session</p>
        </div>
      </div>

      {/* Analytics Breakdown Grid - Square */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Dominant Emotional States */}
        <div className="p-5 sm:p-6 rounded-none bg-white border border-[#e8e8df] shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Smile className="w-4 h-4 text-[#7d8461]" />
            <h2 className="text-base font-serif italic font-bold text-[#2c2c26]">Dominant Emotional States</h2>
          </div>

          {stats.topMoods.length > 0 ? (
            <div className="space-y-3.5">
              {stats.topMoods.map((item, idx) => {
                const percentage = stats.totalEntries > 0 ? Math.round((item.count / stats.totalEntries) * 100) : 0;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs mb-1 font-medium">
                      <span className="text-[#2c2c26]">{item.mood}</span>
                      <span className="text-[#5c5c52] font-mono text-[11px]">{item.count} sessions ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-[#f4f4ea] rounded-none overflow-hidden border border-[#e8e8df]">
                      <div
                        className="h-full bg-[#7d8461] rounded-none transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-[#5c5c52] py-6 text-center">
              Complete your first journal reflections to see emotional patterns.
            </p>
          )}
        </div>

        {/* Top Recurring Themes */}
        <div className="p-5 sm:p-6 rounded-none bg-white border border-[#e8e8df] shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-[#7d8461]" />
            <h2 className="text-base font-serif italic font-bold text-[#2c2c26]">Core Themes & Focus</h2>
          </div>

          {stats.topThemes.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {stats.topThemes.map((item, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1 rounded-none bg-[#f4f4ea] border border-[#e8e8df] text-xs text-[#2c2c26] flex items-center gap-1.5 hover:border-[#7d8461] transition font-medium"
                >
                  <span className="text-[#7d8461] font-bold">#{item.theme}</span>
                  <span className="px-1 py-0.2 rounded-none bg-white text-[10px] text-[#5c5c52] font-mono border border-[#e8e8df]">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#5c5c52] py-6 text-center">
              Themes extracted by AI will appear here as you log reflections.
            </p>
          )}
        </div>
      </div>

      {/* Framework Utilization - Square */}
      <div className="p-5 sm:p-6 rounded-none bg-white border border-[#e8e8df] shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[#7d8461]" />
          <h2 className="text-base font-serif italic font-bold text-[#2c2c26]">Journaling Framework Preferences</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {JOURNAL_FRAMEWORKS.map((fw) => {
            const count = stats.frameworkCounts[fw.id] || 0;
            return (
              <div
                key={fw.id}
                className="p-3.5 rounded-none bg-[#fbfaf5] border border-[#ecece0] flex items-center justify-between"
              >
                <div>
                  <p className="font-serif italic font-bold text-xs text-[#2c2c26]">{fw.name}</p>
                  <p className="text-[10px] text-[#7d8461] font-medium truncate max-w-[140px]">{fw.tagline}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-[#2c2c26] font-mono">{count}</span>
                  <span className="text-[9px] text-[#5c5c52] block uppercase tracking-wider">entries</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
