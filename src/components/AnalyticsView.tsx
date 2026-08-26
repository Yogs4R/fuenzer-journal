import React, { useMemo, useState } from 'react';
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
  Activity,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import type { JournalEntry } from '../types/journal';
import { JOURNAL_FRAMEWORKS, MOOD_OPTIONS } from '../lib/constants';
import { getLocalDateString, formatJournalDate } from '../lib/date-utils';

interface AnalyticsViewProps {
  entries: JournalEntry[];
  streakCount: number;
}

const MOOD_SCORE_MAP: Record<string, { score: number; label: string }> = {
  grateful: { score: 5, label: 'Grateful' },
  calm: { score: 4.5, label: 'Calm' },
  energized: { score: 4.5, label: 'Energized' },
  hopeful: { score: 4, label: 'Hopeful' },
  focused: { score: 4, label: 'Focused' },
  reflective: { score: 3.5, label: 'Reflective' },
  tired: { score: 2.5, label: 'Tired' },
  anxious: { score: 2, label: 'Anxious' },
  frustrated: { score: 1.5, label: 'Frustrated' },
  sad: { score: 1.5, label: 'Sad' },
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ entries, streakCount }) => {
  const [timeRange, setTimeRange] = useState<'14' | '30'>('30');

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

  // Generate 30-day timeline chart data
  const moodChartData = useMemo(() => {
    const numDays = timeRange === '14' ? 14 : 30;
    const data = [];
    const now = new Date();

    // Map entries by local date string YYYY-MM-DD
    const entryByDate: Record<string, JournalEntry[]> = {};
    entries.forEach((entry) => {
      const dateKey = getLocalDateString(new Date(entry.createdAt));
      if (!entryByDate[dateKey]) {
        entryByDate[dateKey] = [];
      }
      entryByDate[dateKey].push(entry);
    });

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateKey = getLocalDateString(d);
      const dayEntries = entryByDate[dateKey];

      const displayDate = d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

      if (dayEntries && dayEntries.length > 0) {
        // Average or last mood score of the day
        const latestEntry = dayEntries[0];
        const moodKey = (latestEntry.detectedMood || latestEntry.initialMood || 'reflective').toLowerCase();
        const moodInfo = MOOD_SCORE_MAP[moodKey] || { score: 3.5, label: moodKey };

        data.push({
          date: displayDate,
          fullDate: dateKey,
          score: moodInfo.score,
          moodLabel: moodInfo.label,
          hasEntry: true,
          title: latestEntry.title,
          entriesCount: dayEntries.length,
          wordCount: latestEntry.wordCount || 0,
        });
      } else {
        data.push({
          date: displayDate,
          fullDate: dateKey,
          score: null,
          moodLabel: 'No Entry',
          hasEntry: false,
          title: '',
          entriesCount: 0,
          wordCount: 0,
        });
      }
    }

    return data;
  }, [entries, timeRange]);

  const handleExportAllJson = () => {
    const jsonStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuenzer_journal_export_${getLocalDateString(new Date())}.json`;
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

      {/* Mood Trends Over Time (Recharts Line Graph) */}
      <div className="p-5 sm:p-6 rounded-none bg-white border border-[#e8e8df] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#7d8461]" />
            <div>
              <h2 className="text-base font-serif italic font-bold text-[#2c2c26]">
                Emotional State & Mood Trajectory
              </h2>
              <p className="text-[11px] text-[#5c5c52]">
                Visualizing emotional equanimity and reflection trends over time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#f4f4ea] border border-[#e8e8df] p-0.5 rounded-none self-start sm:self-auto text-xs">
            <button
              onClick={() => setTimeRange('14')}
              className={`px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                timeRange === '14'
                  ? 'bg-[#7d8461] text-white shadow-xs'
                  : 'text-[#5c5c52] hover:text-[#2c2c26]'
              }`}
            >
              Last 14 Days
            </button>
            <button
              onClick={() => setTimeRange('30')}
              className={`px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                timeRange === '30'
                  ? 'bg-[#7d8461] text-white shadow-xs'
                  : 'text-[#5c5c52] hover:text-[#2c2c26]'
              }`}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        {entries.length > 0 ? (
          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={moodChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ecece0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#5c5c52' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e8e8df' }}
                  interval={timeRange === '30' ? 3 : 1}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1.5, 2.5, 3.5, 4.5, 5]}
                  tickFormatter={(val) => {
                    if (val >= 4.5) return 'Calm/High';
                    if (val >= 3.5) return 'Balanced';
                    if (val >= 2.5) return 'Tired';
                    return 'Anxious';
                  }}
                  tick={{ fontSize: 10, fill: '#5c5c52' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e8e8df' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      if (!item.hasEntry) {
                        return (
                          <div className="bg-white border border-[#ecece0] p-2.5 shadow-md rounded-none text-xs">
                            <p className="font-mono text-[10px] text-[#7d8461] font-bold">{item.date}</p>
                            <p className="text-[#5c5c52] text-[11px] italic mt-0.5">No reflection logged</p>
                          </div>
                        );
                      }
                      return (
                        <div className="bg-[#ffffff] border border-[#7d8461]/40 p-3 shadow-lg rounded-none text-xs max-w-xs">
                          <div className="flex items-center justify-between gap-3 mb-1 border-b border-[#ecece0] pb-1">
                            <span className="font-mono text-[10px] text-[#7d8461] font-bold">{item.date}</span>
                            <span className="px-1.5 py-0.2 bg-[#7d8461]/10 text-[#7d8461] font-bold text-[10px] uppercase">
                              {item.moodLabel}
                            </span>
                          </div>
                          <p className="font-serif italic font-bold text-xs text-[#2c2c26] truncate">
                            {item.title || 'Journal Entry'}
                          </p>
                          <p className="text-[10px] text-[#5c5c52] mt-1">
                            {item.wordCount} words distilled
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={3.5} stroke="#ddb892" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#7d8461"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#7d8461', strokeWidth: 1.5, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#3a3a30', stroke: '#7d8461', strokeWidth: 2 }}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-[#fbfaf5] border border-dashed border-[#e8e8df]">
            <Calendar className="w-6 h-6 text-[#7d8461] mb-2" />
            <p className="font-serif italic text-sm text-[#2c2c26]">No mood history recorded yet</p>
            <p className="text-xs text-[#5c5c52] mt-0.5">
              Complete your reflections to populate your 30-day emotional trajectory chart.
            </p>
          </div>
        )}
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

