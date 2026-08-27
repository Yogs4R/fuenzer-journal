import React, { useMemo, useState, useRef, useEffect } from 'react';
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
  CalendarDays,
  Clock,
  Zap,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FileText,
  FileSpreadsheet,
  FileCode,
  Check,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { JournalEntry } from '../types/journal';
import { JOURNAL_FRAMEWORKS, MOOD_OPTIONS } from '../lib/constants';
import { getLocalDateString, formatJournalDate } from '../lib/date-utils';
import { exportAnalyticsToPdf } from '../lib/pdf-export';

interface AnalyticsViewProps {
  entries: JournalEntry[];
  streakCount: number;
}

type TimeRangeOption = '24h' | '7d' | '14d' | '30d';

// Comprehensive mood scoring and label resolution across user chips & AI-detected emotions
export function resolveMoodInfo(rawMood: string | undefined | null): { score: number; label: string } {
  if (!rawMood || typeof rawMood !== 'string') {
    return { score: 3.3, label: 'Reflective' };
  }

  const clean = rawMood.trim();
  const lower = clean.toLowerCase();

  // 1. Direct matches
  if (lower === 'depression' || lower === 'depressed' || lower === 'grief' || lower === 'melancholy' || lower === 'hopeless' || lower === 'heartbroken') {
    return { score: 1.2, label: clean };
  }
  if (lower === 'sad' || lower === 'sorrow' || lower === 'down') {
    return { score: 1.4, label: clean };
  }
  if (lower === 'frustrated' || lower === 'frustration' || lower === 'angry' || lower === 'anger' || lower === 'irritated' || lower === 'resentful' || lower === 'annoyed') {
    return { score: 1.6, label: clean };
  }
  if (lower === 'anxious' || lower === 'anxiety' || lower === 'anxious or hesitant' || lower === 'nervous' || lower === 'worried' || lower === 'panic' || lower === 'fearful') {
    return { score: 2.0, label: clean };
  }
  if (lower === 'overwhelmed' || lower === 'overwhelmed & busy' || lower === 'stressed' || lower === 'stress' || lower === 'busy') {
    return { score: 2.3, label: clean };
  }
  if (lower === 'tired' || lower === 'tired & drained' || lower === 'exhausted' || lower === 'drained' || lower === 'burnout' || lower === 'fatigued' || lower === 'weary') {
    return { score: 2.6, label: clean };
  }
  if (lower === 'vulnerable' || lower === 'hesitant' || lower === 'uncertain' || lower === 'conflicted' || lower === 'confused') {
    return { score: 2.9, label: clean };
  }
  if (lower === 'reflective' || lower === 'pensive' || lower === 'pensive & reflective' || lower === 'contemplative' || lower === 'thoughtful' || lower === 'introspective') {
    return { score: 3.3, label: clean };
  }
  if (lower === 'focused' || lower === 'determined' || lower === 'curious' || lower === 'productive' || lower === 'balanced') {
    return { score: 3.7, label: clean };
  }
  if (lower === 'calm' || lower === 'calm & grounded' || lower === 'peaceful' || lower === 'serene' || lower === 'relaxed' || lower === 'content' || lower === 'grounded') {
    return { score: 4.2, label: clean };
  }
  if (lower === 'inspired' || lower === 'inspired & focused' || lower === 'energized' || lower === 'energized & motivated' || lower === 'motivated' || lower === 'hopeful' || lower === 'optimistic' || lower === 'creative') {
    return { score: 4.6, label: clean };
  }
  if (lower === 'grateful' || lower === 'grateful & warm' || lower === 'joyful' || lower === 'happy' || lower === 'euphoric' || lower === 'loving' || lower === 'thriving') {
    return { score: 5.0, label: clean };
  }

  // 2. Substring matching for AI-generated dynamic mood variations
  if (lower.includes('depress') || lower.includes('grief') || lower.includes('melanchol') || lower.includes('hopeless')) {
    return { score: 1.2, label: clean };
  }
  if (lower.includes('sad') || lower.includes('sorrow')) {
    return { score: 1.4, label: clean };
  }
  if (lower.includes('frustrat') || lower.includes('ang') || lower.includes('irritat') || lower.includes('resent')) {
    return { score: 1.6, label: clean };
  }
  if (lower.includes('anx') || lower.includes('panic') || lower.includes('fear') || lower.includes('nervous')) {
    return { score: 2.0, label: clean };
  }
  if (lower.includes('overwhelm') || lower.includes('stress') || lower.includes('hectic')) {
    return { score: 2.3, label: clean };
  }
  if (lower.includes('tir') || lower.includes('exhaust') || lower.includes('drain') || lower.includes('burnout') || lower.includes('fatigue')) {
    return { score: 2.6, label: clean };
  }
  if (lower.includes('vulnerab') || lower.includes('hesit') || lower.includes('doubt') || lower.includes('confus')) {
    return { score: 2.9, label: clean };
  }
  if (lower.includes('reflect') || lower.includes('pens') || lower.includes('contemplat') || lower.includes('thought')) {
    return { score: 3.3, label: clean };
  }
  if (lower.includes('focus') || lower.includes('determ') || lower.includes('curio') || lower.includes('balanc')) {
    return { score: 3.7, label: clean };
  }
  if (lower.includes('calm') || lower.includes('peace') || lower.includes('seren') || lower.includes('ground') || lower.includes('relax')) {
    return { score: 4.2, label: clean };
  }
  if (lower.includes('inspir') || lower.includes('energ') || lower.includes('motivat') || lower.includes('hope') || lower.includes('optimis')) {
    return { score: 4.6, label: clean };
  }
  if (lower.includes('grat') || lower.includes('joy') || lower.includes('happ') || lower.includes('love') || lower.includes('warm')) {
    return { score: 5.0, label: clean };
  }

  return { score: 3.3, label: clean };
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ entries, streakCount }) => {
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('7d');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Heatmap interactive state & Real-life monthly calendar view
  const now = new Date();
  const [calendarYear, setCalendarYear] = useState<number>(now.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(now.getMonth()); // 0 = Jan, 11 = Dec
  const [selectedHeatmapMood, setSelectedHeatmapMood] = useState<string>('all');
  const [activeHeatmapTooltip, setActiveHeatmapTooltip] = useState<{
    dateKey: string;
    formattedDate: string;
    entries: JournalEntry[];
    count: number;
    words: number;
    dominantMood?: string;
    moodScore?: number;
    frameworks: string[];
  } | null>(null);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCalendarMonth((prevMonth) => {
      if (prevMonth === 0) {
        setCalendarYear((prevYear) => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
    setActiveHeatmapTooltip(null);
  };

  const handleNextMonth = () => {
    setCalendarMonth((prevMonth) => {
      if (prevMonth === 11) {
        setCalendarYear((prevYear) => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
    setActiveHeatmapTooltip(null);
  };

  const handleResetToCurrentMonth = () => {
    const current = new Date();
    setCalendarYear(current.getFullYear());
    setCalendarMonth(current.getMonth());
    setActiveHeatmapTooltip(null);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

    // Time of Day distribution
    const timeOfDayCounts = {
      Morning: 0,   // 5am - 12pm
      Afternoon: 0, // 12pm - 5pm
      Evening: 0,   // 5pm - 9pm
      Night: 0,     // 9pm - 5am
    };

    entries.forEach((e) => {
      const date = new Date(e.createdAt);
      const hours = date.getHours();
      if (hours >= 5 && hours < 12) timeOfDayCounts.Morning++;
      else if (hours >= 12 && hours < 17) timeOfDayCounts.Afternoon++;
      else if (hours >= 17 && hours < 21) timeOfDayCounts.Evening++;
      else timeOfDayCounts.Night++;
    });

    const timeOfDayData = [
      { period: 'Morning (5am-12pm)', count: timeOfDayCounts.Morning, icon: '🌅' },
      { period: 'Afternoon (12pm-5pm)', count: timeOfDayCounts.Afternoon, icon: '☀️' },
      { period: 'Evening (5pm-9pm)', count: timeOfDayCounts.Evening, icon: '🌆' },
      { period: 'Night (9pm-5am)', count: timeOfDayCounts.Night, icon: '🌙' },
    ];

    return {
      totalEntries,
      totalWords,
      totalInsights,
      avgWords,
      avgInsights,
      topMoods,
      topThemes,
      frameworkCounts,
      timeOfDayData,
    };
  }, [entries]);

  // Generate Timeline chart data (24h, 7d, 14d, 30d)
  const moodChartData = useMemo(() => {
    const now = new Date();

    if (timeRange === '24h') {
      // 8 intervals of 3 hours for the last 24 hours
      const data = [];
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recentEntries = entries.filter((e) => new Date(e.createdAt) >= oneDayAgo);

      for (let i = 7; i >= 0; i--) {
        const slotTime = new Date(now.getTime() - i * 3 * 60 * 60 * 1000);
        const slotHour = slotTime.getHours();
        const displayLabel = `${String(slotHour).padStart(2, '0')}:00`;
        const slotStart = new Date(slotTime.getTime() - 1.5 * 60 * 60 * 1000);
        const slotEnd = new Date(slotTime.getTime() + 1.5 * 60 * 60 * 1000);

        const matched = recentEntries.filter((e) => {
          const entryDate = new Date(e.createdAt);
          return entryDate >= slotStart && entryDate < slotEnd;
        });

        if (matched.length > 0) {
          const latest = matched[0];
          const rawMood = latest.detectedMood || latest.initialMood;
          const moodInfo = resolveMoodInfo(rawMood);
          data.push({
            date: displayLabel,
            fullDate: slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            score: moodInfo.score,
            moodLabel: moodInfo.label,
            hasEntry: true,
            title: latest.title,
            words: latest.wordCount || 0,
          });
        } else {
          data.push({
            date: displayLabel,
            fullDate: slotTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            score: null,
            moodLabel: 'No Entry',
            hasEntry: false,
            title: '',
            words: 0,
          });
        }
      }
      return data;
    }

    const numDays = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const data = [];

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

      const displayDate = numDays === 7
        ? d.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' })
        : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      if (dayEntries && dayEntries.length > 0) {
        const latestEntry = dayEntries[0];
        const rawMood = latestEntry.detectedMood || latestEntry.initialMood;
        const moodInfo = resolveMoodInfo(rawMood);

        const dayTotalWords = dayEntries.reduce((acc, curr) => acc + (curr.wordCount || 0), 0);

        data.push({
          date: displayDate,
          fullDate: dateKey,
          score: moodInfo.score,
          moodLabel: moodInfo.label,
          hasEntry: true,
          title: latestEntry.title,
          entriesCount: dayEntries.length,
          words: dayTotalWords,
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
          words: 0,
        });
      }
    }

    return data;
  }, [entries, timeRange]);

  // Calendar Heatmap data calculation based on real-life calendar month and year (28, 29, 30, or 31 days)
  const heatmapData = useMemo(() => {
    // Determine the number of days in the selected calendar month (taking leap years into account)
    // Date(year, month + 1, 0).getDate() gives exact days: 28/29 for Feb, 30 for Apr/Jun/Sep/Nov, 31 for Jan/Mar/May/Jul/Aug/Oct/Dec
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const monthDisplayName = new Date(calendarYear, calendarMonth, 1).toLocaleDateString('en-US', {
      month: 'long',
    });

    const days = [];

    // Prepend empty / padding slots for days of week before the 1st of the month to align correctly under Sun-Sat columns
    for (let p = 0; p < firstDayOfWeek; p++) {
      days.push({
        isPadding: true,
        date: null,
        dateKey: `padding-start-${p}`,
        dayOfMonth: null,
        dayOfWeek: '',
        dayOfWeekIndex: p,
        formattedDate: '',
        monthName: '',
        entries: [] as JournalEntry[],
        count: 0,
        words: 0,
        dominantMood: undefined,
        dominantMoodScore: undefined,
        frameworks: [] as string[],
      });
    }

    // Populate actual days of the month (1 to daysInMonth)
    for (let dNum = 1; dNum <= daysInMonth; dNum++) {
      const d = new Date(calendarYear, calendarMonth, dNum);
      const dateKey = getLocalDateString(d);

      const dayEntries = entries.filter((e) => {
        const eDate = new Date(e.createdAt);
        return getLocalDateString(eDate) === dateKey;
      });

      const count = dayEntries.length;
      const words = dayEntries.reduce((acc, e) => acc + (e.wordCount || 0), 0);

      let dominantMood: string | undefined;
      let dominantMoodScore: number | undefined;
      if (count > 0) {
        const latest = dayEntries[0];
        const raw = latest.detectedMood || latest.initialMood;
        const resolved = resolveMoodInfo(raw);
        dominantMood = resolved.label;
        dominantMoodScore = resolved.score;
      }

      const frameworks = Array.from(new Set(dayEntries.map((e) => e.framework)));

      days.push({
        isPadding: false,
        date: d,
        dateKey,
        dayOfMonth: dNum,
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayOfWeekIndex: d.getDay(),
        formattedDate: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        entries: dayEntries,
        count,
        words,
        dominantMood,
        dominantMoodScore,
        frameworks,
      });
    }

    const realDays = days.filter((d) => !d.isPadding);
    const activeDays = realDays.filter((d) => d.count > 0);
    const activeDaysCount = activeDays.length;
    const consistencyRate = Math.round((activeDaysCount / daysInMonth) * 100);
    const totalMonthWords = realDays.reduce((acc, d) => acc + d.words, 0);

    // Calculate mood distribution across the active heatmap days in this month
    const moodBreakdown: Record<string, number> = {};
    activeDays.forEach((d) => {
      if (d.dominantMood) {
        moodBreakdown[d.dominantMood] = (moodBreakdown[d.dominantMood] || 0) + 1;
      }
    });

    const uniqueMoods = Object.keys(moodBreakdown);

    return {
      days,
      realDays,
      daysInMonth,
      firstDayOfWeek,
      monthDisplayName,
      calendarYear,
      calendarMonth,
      activeDaysCount,
      totalDays: daysInMonth,
      consistencyRate,
      totalMonthWords,
      uniqueMoods,
      moodBreakdown,
    };
  }, [entries, calendarYear, calendarMonth]);

  const triggerDownload = (blob: Blob, filename: string, successLabel: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
    setExportSuccess(successLabel);
    setTimeout(() => setExportSuccess(null), 3000);
  };

  const handleExportPdf = () => {
    try {
      exportAnalyticsToPdf(entries, stats, streakCount, timeRange);
      setIsExportOpen(false);
      setExportSuccess('Analytics PDF generated');
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    }
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    triggerDownload(blob, `fuenzer_journal_export_${getLocalDateString(new Date())}.json`, 'JSON file exported');
  };

  const handleExportCsv = () => {
    const headers = ['Date', 'Title', 'Framework', 'Mood', 'Word Count', 'Themes', 'Executive Summary'];
    const rows = entries.map((e) => [
      `"${getLocalDateString(new Date(e.createdAt))}"`,
      `"${(e.title || 'Untitled').replace(/"/g, '""')}"`,
      `"${e.framework}"`,
      `"${e.detectedMood || e.initialMood || 'Reflective'}"`,
      e.wordCount || 0,
      `"${(e.themes || []).join(', ')}"`,
      `"${(e.executiveSummary || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `fuenzer_journal_export_${getLocalDateString(new Date())}.csv`, 'CSV spreadsheet exported');
  };

  const handleExportMarkdown = () => {
    let md = `# Fuenzer Journal — Insights & Reflection Digest\n`;
    md += `*Generated on ${formatJournalDate(Date.now(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}*\n\n`;
    md += `## Executive Metrics\n`;
    md += `- **Total Reflections**: ${stats.totalEntries}\n`;
    md += `- **Daily Streak**: ${streakCount} Days\n`;
    md += `- **Total Words Reflected**: ${stats.totalWords.toLocaleString()}\n`;
    md += `- **Avg Words / Session**: ~${stats.avgWords}\n`;
    md += `- **Key Insights Extracted**: ${stats.totalInsights}\n\n`;

    md += `## Dominant Emotional States\n`;
    stats.topMoods.forEach((m) => {
      md += `- **${m.mood}**: ${m.count} sessions\n`;
    });
    md += `\n`;

    md += `## Journaling Frameworks\n`;
    JOURNAL_FRAMEWORKS.forEach((fw) => {
      const count = stats.frameworkCounts[fw.id] || 0;
      if (count > 0) md += `- **${fw.name}**: ${count} entries\n`;
    });
    md += `\n`;

    md += `## Reflection History\n\n`;
    entries.forEach((e, idx) => {
      md += `### ${idx + 1}. ${e.title || 'Untitled Reflection'}\n`;
      md += `*${formatJournalDate(e.createdAt)} | Framework: ${e.framework} | Mood: ${e.detectedMood || e.initialMood || 'Reflective'}*\n\n`;
      if (e.executiveSummary) {
        md += `> ${e.executiveSummary}\n\n`;
      }
      if (e.keyInsights && e.keyInsights.length > 0) {
        md += `**Key Realizations:**\n`;
        e.keyInsights.forEach((ki) => {
          md += `- ${ki}\n`;
        });
        md += `\n`;
      }
      if (e.actionItems && e.actionItems.length > 0) {
        md += `**Intentions & Next Steps:**\n`;
        e.actionItems.forEach((ai) => {
          md += `- [ ] ${ai}\n`;
        });
        md += `\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    triggerDownload(blob, `fuenzer_journal_digest_${getLocalDateString(new Date())}.md`, 'Markdown digest exported');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 text-[#2c2c26] dark:text-[#f0efe6]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#7d8461]/10 dark:bg-[#7d8461]/20 rounded-none flex items-center justify-center text-[#7d8461] dark:text-[#9ca87a]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif italic font-bold tracking-tight text-[#2c2c26] dark:text-[#f0efe6]">
              Reflection Insights & Growth Analytics
            </h1>
          </div>
          <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] mt-1 font-light">
            Patterns, recurring breakthroughs, and emotional growth cultivated over time.
          </p>
        </div>

        {/* Export Dropdown & Feedback Toast (Aligned right on both mobile and desktop) */}
        <div className="relative self-end sm:self-auto" ref={exportMenuRef}>
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
              className="px-4 py-2 bg-[#3a3a30] dark:bg-[#e8e8df] hover:bg-[#2c2c26] dark:hover:bg-white text-[#fbfaf5] dark:text-[#181814] rounded-none text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-wider shadow-xs shrink-0"
              title="Export analytics and reflection logs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isExportOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Dropdown Menu Popup - Right-aligned to stay neatly within viewport bounds */}
          {isExportOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-[#23231c] border border-[#2c2c26]/20 dark:border-[#38382e] shadow-xl rounded-none z-30 divide-y divide-[#ecece0] dark:divide-[#38382e] animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2">
                <p className="text-[10px] uppercase tracking-wider text-[#7d8461] dark:text-[#9ca87a] font-bold px-2 py-1">
                  Choose Export Format
                </p>

                {/* PDF Option */}
                <button
                  onClick={handleExportPdf}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left text-xs text-[#2c2c26] dark:text-[#f0efe6] hover:bg-[#f4f4ea] dark:hover:bg-[#2c2c24] transition cursor-pointer"
                >
                  <div className="w-6 h-6 bg-[#7d8461]/10 dark:bg-[#7d8461]/20 text-[#7d8461] dark:text-[#9ca87a] flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold block">Analytics Report (PDF)</span>
                    <span className="text-[10px] text-[#5c5c52] dark:text-[#a8a89b]">Print-ready insights document</span>
                  </div>
                </button>

                {/* CSV Option */}
                <button
                  onClick={handleExportCsv}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left text-xs text-[#2c2c26] dark:text-[#f0efe6] hover:bg-[#f4f4ea] dark:hover:bg-[#2c2c24] transition cursor-pointer"
                >
                  <div className="w-6 h-6 bg-[#b08968]/15 dark:bg-[#b08968]/25 text-[#b08968] dark:text-[#ddb892] flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold block">Reflections Log (CSV)</span>
                    <span className="text-[10px] text-[#5c5c52] dark:text-[#a8a89b]">Spreadsheet compatible format</span>
                  </div>
                </button>

                {/* JSON Option */}
                <button
                  onClick={handleExportJson}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left text-xs text-[#2c2c26] dark:text-[#f0efe6] hover:bg-[#f4f4ea] dark:hover:bg-[#2c2c24] transition cursor-pointer"
                >
                  <div className="w-6 h-6 bg-[#606c38]/15 dark:bg-[#606c38]/25 text-[#606c38] dark:text-[#9ca87a] flex items-center justify-center shrink-0">
                    <FileCode className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold block">Full Backup (JSON)</span>
                    <span className="text-[10px] text-[#5c5c52] dark:text-[#a8a89b]">Complete raw structured data</span>
                  </div>
                </button>

                {/* Markdown Option */}
                <button
                  onClick={handleExportMarkdown}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left text-xs text-[#2c2c26] dark:text-[#f0efe6] hover:bg-[#f4f4ea] dark:hover:bg-[#2c2c24] transition cursor-pointer"
                >
                  <div className="w-6 h-6 bg-[#3a3a30]/10 dark:bg-[#3a3a30]/30 text-[#3a3a30] dark:text-[#d8d8cc] flex items-center justify-center shrink-0">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold block">Insights Digest (.MD)</span>
                    <span className="text-[10px] text-[#5c5c52] dark:text-[#a8a89b]">Clean text with markdown headers</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards Grid - Square */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-none bg-white dark:bg-[#23231c] border border-[#e8e8df] dark:border-[#38382e] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#5c5c52] dark:text-[#a8a89b] font-bold">Total Reflections</span>
            <BookOpen className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a]" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6]">{stats.totalEntries}</p>
          <p className="text-[9px] uppercase tracking-wider text-[#7d8461] dark:text-[#9ca87a] font-semibold mt-1">Saved Reflections</p>
        </div>

        <div className="p-4 sm:p-5 rounded-none bg-white dark:bg-[#23231c] border border-[#e8e8df] dark:border-[#38382e] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#5c5c52] dark:text-[#a8a89b] font-bold">Daily Streak</span>
            <Flame className="w-3.5 h-3.5 text-[#d48b0c] dark:text-[#f4a261]" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif italic font-bold text-[#8a6b18] dark:text-[#f4a261]">{streakCount} Days</p>
          <p className="text-[9px] uppercase tracking-wider text-[#5c5c52] dark:text-[#a8a89b] font-medium mt-1">Consistent reflection</p>
        </div>

        <div className="p-4 sm:p-5 rounded-none bg-white dark:bg-[#23231c] border border-[#e8e8df] dark:border-[#38382e] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#5c5c52] dark:text-[#a8a89b] font-bold">Words Reflected</span>
            <PenTool className="w-3.5 h-3.5 text-[#9c6644] dark:text-[#ddb892]" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif italic font-bold text-[#7f4f24] dark:text-[#ddb892]">{stats.totalWords.toLocaleString()}</p>
          <p className="text-[9px] uppercase tracking-wider text-[#5c5c52] dark:text-[#a8a89b] font-medium mt-1">~{stats.avgWords} words/entry</p>
        </div>

        <div className="p-4 sm:p-5 rounded-none bg-white dark:bg-[#23231c] border border-[#e8e8df] dark:border-[#38382e] shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#5c5c52] dark:text-[#a8a89b] font-bold">Insights Distilled</span>
            <Sparkles className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a]" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif italic font-bold text-[#4c5432] dark:text-[#9ca87a]">{stats.totalInsights}</p>
          <p className="text-[9px] uppercase tracking-wider text-[#5c5c52] dark:text-[#a8a89b] font-medium mt-1">~{stats.avgInsights} / session</p>
        </div>
      </div>

      {/* CALENDAR HEATMAP VISUALIZATION (Real-Life Month Calendar with Prev/Next Navigation & Accurate Days) */}
      <div className="p-5 sm:p-6 rounded-none bg-white dark:bg-[#23231c] border border-[#e8e8df] dark:border-[#38382e] shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#7d8461]/10 dark:bg-[#7d8461]/20 rounded-none flex items-center justify-center text-[#7d8461] dark:text-[#9ca87a]">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6]">
                  {heatmapData.monthDisplayName} {heatmapData.calendarYear}
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#f4f4ea] dark:bg-[#1a1a16] border border-[#e8e8df] dark:border-[#38382e] text-[#5c5c52] dark:text-[#a8a89b]">
                  {heatmapData.daysInMonth} Days
                </span>
              </div>
              <p className="text-[11px] text-[#5c5c52] dark:text-[#a8a89b] mt-0.5">
                Real-world monthly calendar showing reflection cadence and emotional trajectory.
              </p>
            </div>
          </div>

          {/* Month Navigation & Consistency Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Prev / Current / Next Month Controls */}
            <div className="flex items-center bg-[#f4f4ea] dark:bg-[#1a1a16] border border-[#e8e8df] dark:border-[#38382e] p-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] hover:bg-[#ecece0] dark:hover:bg-[#2c2c24] transition cursor-pointer"
                title="Previous Month"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleResetToCurrentMonth}
                className="px-2 py-1 text-[11px] font-semibold text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] hover:bg-[#ecece0] dark:hover:bg-[#2c2c24] transition cursor-pointer flex items-center gap-1"
                title="Jump to current month"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Today</span>
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] hover:bg-[#ecece0] dark:hover:bg-[#2c2c24] transition cursor-pointer"
                title="Next Month"
                aria-label="Next Month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Monthly Consistency Badges */}
            <div className="px-3 py-1 bg-[#f4f4ea] dark:bg-[#1a1a16] border border-[#e8e8df] dark:border-[#38382e] flex items-center gap-1.5 font-medium text-xs">
              <span className="text-[#5c5c52] dark:text-[#a8a89b]">Active:</span>
              <span className="font-bold text-[#7d8461] dark:text-[#9ca87a] font-mono">
                {heatmapData.activeDaysCount}/{heatmapData.totalDays} Days ({heatmapData.consistencyRate}%)
              </span>
            </div>

            <div className="px-3 py-1 bg-[#f4f4ea] dark:bg-[#1a1a16] border border-[#e8e8df] dark:border-[#38382e] flex items-center gap-1.5 font-medium text-xs">
              <span className="text-[#5c5c52] dark:text-[#a8a89b]">Month Words:</span>
              <span className="font-bold text-[#2c2c26] dark:text-[#f0efe6] font-mono">
                {heatmapData.totalMonthWords.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Mood Highlight Filter Chips */}
        {heatmapData.uniqueMoods.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#5c5c52] dark:text-[#a8a89b] mr-1">
              Highlight Mood:
            </span>
            <button
              onClick={() => setSelectedHeatmapMood('all')}
              className={`px-2.5 py-0.5 text-[11px] font-semibold border transition cursor-pointer ${
                selectedHeatmapMood === 'all'
                  ? 'bg-[#7d8461] text-white border-[#7d8461]'
                  : 'bg-[#f4f4ea] dark:bg-[#1a1a16] text-[#5c5c52] dark:text-[#a8a89b] border-[#e8e8df] dark:border-[#38382e] hover:border-[#7d8461]'
              }`}
            >
              All ({heatmapData.activeDaysCount})
            </button>
            {heatmapData.uniqueMoods.map((mood) => {
              const count = heatmapData.moodBreakdown[mood] || 0;
              const isSelected = selectedHeatmapMood.toLowerCase() === mood.toLowerCase();
              return (
                <button
                  key={mood}
                  onClick={() => setSelectedHeatmapMood(isSelected ? 'all' : mood)}
                  className={`px-2.5 py-0.5 text-[11px] font-semibold border transition cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#7d8461] text-white border-[#7d8461]'
                      : 'bg-[#f4f4ea] dark:bg-[#1a1a16] text-[#5c5c52] dark:text-[#a8a89b] border-[#e8e8df] dark:border-[#38382e] hover:border-[#7d8461]'
                  }`}
                >
                  <span>{mood}</span>
                  <span className="font-mono text-[9px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 7-Column Calendar Heatmap Grid */}
        <div className="overflow-x-auto pb-1">
          <div className="min-w-[480px]">
            {/* Day of Week Column Headers */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-[10px] font-bold uppercase tracking-wider text-[#8c8c80] dark:text-[#a8a89b]">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid of Days with Leading Empty Slots */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {heatmapData.days.map((day, idx) => {
                if (day.isPadding) {
                  return (
                    <div
                      key={day.dateKey || idx}
                      className="h-14 sm:h-16 p-1.5 border border-dashed border-[#ecece0]/60 dark:border-[#35352c]/40 bg-[#fbfaf5]/30 dark:bg-[#181814]/30 opacity-40 select-none"
                    />
                  );
                }

                const hasEntries = day.count > 0;
                const isMoodMatch =
                  selectedHeatmapMood === 'all' ||
                  (day.dominantMood && day.dominantMood.toLowerCase() === selectedHeatmapMood.toLowerCase());
                const isDimmed = selectedHeatmapMood !== 'all' && !isMoodMatch;
                const isSelected = activeHeatmapTooltip?.dateKey === day.dateKey;

                // Color coding based on frequency intensity
                let bgClass = 'bg-[#fbfaf5] dark:bg-[#1a1a16] border-[#ecece0] dark:border-[#35352c] text-[#8c8c80]';
                if (hasEntries) {
                  if (day.count === 1) {
                    bgClass = 'bg-[#e2e9d2] dark:bg-[#2e3a1f] border-[#a3b18a] dark:border-[#4d5f34] text-[#2c2c26] dark:text-[#f0efe6] font-semibold';
                  } else if (day.count === 2) {
                    bgClass = 'bg-[#9ca87a] dark:bg-[#526037] border-[#7d8461] dark:border-[#7d8461] text-white font-bold';
                  } else {
                    bgClass = 'bg-[#606c38] dark:bg-[#7d8461] border-[#4c5432] dark:border-[#9ca87a] text-white font-bold';
                  }
                }

                // Mood dot color indicator
                let moodDotColor = 'bg-[#7d8461]';
                if (day.dominantMoodScore && day.dominantMoodScore >= 4.6) {
                  moodDotColor = 'bg-[#e0a96d]'; // Grateful/Joyful (Gold)
                } else if (day.dominantMoodScore && day.dominantMoodScore >= 4.0) {
                  moodDotColor = 'bg-[#9ca87a]'; // Calm/Peaceful (Sage)
                } else if (day.dominantMoodScore && day.dominantMoodScore >= 3.0) {
                  moodDotColor = 'bg-[#7d8461]'; // Reflective (Olive)
                } else if (day.dominantMoodScore && day.dominantMoodScore < 3.0) {
                  moodDotColor = 'bg-[#c86d51]'; // Heavy/Anxious (Terracotta)
                }

                return (
                  <button
                    key={day.dateKey || idx}
                    type="button"
                    onClick={() => {
                      if (activeHeatmapTooltip?.dateKey === day.dateKey) {
                        setActiveHeatmapTooltip(null);
                      } else {
                        setActiveHeatmapTooltip({
                          dateKey: day.dateKey,
                          formattedDate: day.formattedDate,
                          entries: day.entries,
                          count: day.count,
                          words: day.words,
                          dominantMood: day.dominantMood,
                          moodScore: day.dominantMoodScore,
                          frameworks: day.frameworks,
                        });
                      }
                    }}
                    onMouseEnter={() => {
                      if (hasEntries) {
                        setActiveHeatmapTooltip({
                          dateKey: day.dateKey,
                          formattedDate: day.formattedDate,
                          entries: day.entries,
                          count: day.count,
                          words: day.words,
                          dominantMood: day.dominantMood,
                          moodScore: day.dominantMoodScore,
                          frameworks: day.frameworks,
                        });
                      }
                    }}
                    className={`relative h-14 sm:h-16 p-1.5 border rounded-none text-left flex flex-col justify-between transition-all duration-150 cursor-pointer ${bgClass} ${
                      isDimmed ? 'opacity-25 scale-95' : 'hover:scale-[1.02] hover:shadow-md'
                    } ${isSelected ? 'ring-2 ring-[#7d8461] dark:ring-[#a3b18a] shadow-md z-10' : ''}`}
                    title={`${day.formattedDate}: ${day.count} reflections (${day.words} words)`}
                  >
                    {/* Top Row: Day Number */}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-mono leading-none font-medium">
                        {day.dayOfMonth}
                      </span>
                      {hasEntries && (
                        <span className="text-[9px] px-1 py-0.2 bg-black/10 dark:bg-white/10 rounded-none font-mono">
                          {day.count}x
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Mood badge or word volume */}
                    {hasEntries ? (
                      <div className="flex items-center justify-between gap-1 w-full mt-auto">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${moodDotColor}`} />
                          <span className="text-[9px] truncate max-w-[45px] sm:max-w-[60px] opacity-90">
                            {day.dominantMood || 'Logged'}
                          </span>
                        </div>
                        <span className="text-[8px] font-mono opacity-80 shrink-0 hidden sm:inline">
                          {day.words}w
                        </span>
                      </div>
                    ) : (
                      <div className="w-full text-center">
                        <span className="text-[8px] text-transparent select-none">•</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected / Hovered Day Detail Inspector Banner */}
        {activeHeatmapTooltip && (
          <div className="p-3.5 sm:p-4 bg-[#fbfaf5] dark:bg-[#1a1a16] border border-[#7d8461]/40 rounded-none shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-serif italic font-bold text-xs sm:text-sm text-[#2c2c26] dark:text-[#f0efe6]">
                  {activeHeatmapTooltip.formattedDate}
                </span>
                {activeHeatmapTooltip.count > 0 ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#7d8461]/15 text-[#4c5432] dark:text-[#9ca87a] uppercase tracking-wider">
                    {activeHeatmapTooltip.count} Reflection{activeHeatmapTooltip.count > 1 ? 's' : ''} ({activeHeatmapTooltip.words} words)
                  </span>
                ) : (
                  <span className="text-[10px] text-[#8c8c80] italic">No reflections logged</span>
                )}
                {activeHeatmapTooltip.dominantMood && (
                  <span className="text-[10px] font-medium text-[#7d8461] dark:text-[#9ca87a] bg-[#7d8461]/10 px-2 py-0.5">
                    Mood: {activeHeatmapTooltip.dominantMood}
                  </span>
                )}
              </div>

              {activeHeatmapTooltip.entries.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1 text-xs">
                  {activeHeatmapTooltip.entries.map((entry, eIdx) => (
                    <div key={eIdx} className="flex items-center gap-1.5 text-[11px] text-[#5c5c52] dark:text-[#a8a89b]">
                      <span className="text-[#7d8461] dark:text-[#9ca87a] font-bold">•</span>
                      <span className="font-semibold text-[#2c2c26] dark:text-[#f0efe6] truncate max-w-[200px]">
                        {entry.title || 'Untitled Reflection'}
                      </span>
                      <span className="text-[10px] font-mono text-[#8c8c80]">({entry.wordCount || 0}w)</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[#8c8c80] italic">
                  Take a moment today to reflect and light up this calendar square.
                </p>
              )}
            </div>

            <button
              onClick={() => setActiveHeatmapTooltip(null)}
              className="text-[11px] font-semibold text-[#7d8461] dark:text-[#9ca87a] hover:underline self-end sm:self-center cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Legend & Mood Key Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#ecece0] dark:border-[#2e2e28] text-[11px] text-[#5c5c52] dark:text-[#a8a89b]">
          {/* Activity Intensity Scale */}
          <div className="flex items-center gap-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Activity:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">Less</span>
              <span className="w-3.5 h-3.5 bg-[#fbfaf5] dark:bg-[#1a1a16] border border-[#ecece0] dark:border-[#35352c]" title="0 entries" />
              <span className="w-3.5 h-3.5 bg-[#e2e9d2] dark:bg-[#2e3a1f] border border-[#a3b18a]" title="1 entry" />
              <span className="w-3.5 h-3.5 bg-[#9ca87a] dark:bg-[#526037] border border-[#7d8461]" title="2 entries" />
              <span className="w-3.5 h-3.5 bg-[#606c38] dark:bg-[#7d8461] border-[#4c5432]" title="3+ entries" />
              <span className="text-[10px]">More</span>
            </div>
          </div>

          {/* Mood Dot Color Key */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Mood Indicators:</span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#e0a96d]" />
              <span className="text-[10px]">Grateful</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#9ca87a]" />
              <span className="text-[10px]">Calm</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#7d8461]" />
              <span className="text-[10px]">Reflective</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#c86d51]" />
              <span className="text-[10px]">Heavy</span>
            </div>
          </div>
        </div>
      </div>

      {/* DIAGRAM 1: Mood Trends Over Time (Recharts Line Graph with Time Range & Clean Left Y-Axis) */}
      <div className="p-5 sm:p-6 rounded-none bg-white dark:bg-[#23231c] border border-[#e8e8df] dark:border-[#38382e] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#7d8461] dark:text-[#9ca87a]" />
            <div>
              <h2 className="text-base font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6]">
                Emotional State & Mood Trajectory
              </h2>
              <p className="text-[11px] text-[#5c5c52] dark:text-[#a8a89b]">
                Visualizing emotional equanimity, tiredness levels, and reflective breakthroughs.
              </p>
            </div>
          </div>

          {/* Time Range Filter: 24h, 7d (Last Week), 14d, 30d */}
          <div className="flex items-center gap-1 bg-[#f4f4ea] dark:bg-[#1a1a16] border border-[#e8e8df] dark:border-[#38382e] p-0.5 rounded-none self-start sm:self-auto text-xs">
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                timeRange === '24h'
                  ? 'bg-[#7d8461] text-white shadow-xs'
                  : 'text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6]'
              }`}
            >
              24 Hours
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                timeRange === '7d'
                  ? 'bg-[#7d8461] text-white shadow-xs'
                  : 'text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6]'
              }`}
            >
              Last Week
            </button>
            <button
              onClick={() => setTimeRange('14d')}
              className={`px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                timeRange === '14d'
                  ? 'bg-[#7d8461] text-white shadow-xs'
                  : 'text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6]'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                timeRange === '30d'
                  ? 'bg-[#7d8461] text-white shadow-xs'
                  : 'text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6]'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {entries.length > 0 ? (
          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={moodChartData}
                margin={{ top: 10, right: 15, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ecece0" vertical={false} className="dark:opacity-20" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#8c8c80' }}
                  tickLine={false}
                  axisLine={{ stroke: '#8c8c80', opacity: 0.3 }}
                  interval={timeRange === '30d' ? 3 : 0}
                />
                <YAxis
                  domain={[1.0, 5.0]}
                  ticks={[1.2, 2.0, 3.3, 4.2, 5.0]}
                  width={72}
                  tickFormatter={(val) => {
                    if (val >= 4.8) return 'Grateful';
                    if (val >= 4.0) return 'Calm';
                    if (val >= 3.0) return 'Reflective';
                    if (val >= 1.8) return 'Anxious/Tired';
                    return 'Heavy';
                  }}
                  tick={{ fontSize: 10, fill: '#8c8c80', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: '#8c8c80', opacity: 0.3 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      if (!item.hasEntry) {
                        return (
                          <div className="bg-white dark:bg-[#23231c] border border-[#ecece0] dark:border-[#38382e] p-2.5 shadow-md rounded-none text-xs text-[#2c2c26] dark:text-[#f0efe6]">
                            <p className="font-mono text-[10px] text-[#7d8461] dark:text-[#9ca87a] font-bold">{item.date}</p>
                            <p className="text-[#5c5c52] dark:text-[#a8a89b] text-[11px] italic mt-0.5">No reflection logged</p>
                          </div>
                        );
                      }
                      return (
                        <div className="bg-white dark:bg-[#23231c] border border-[#7d8461]/40 p-3 shadow-lg rounded-none text-xs max-w-xs text-[#2c2c26] dark:text-[#f0efe6]">
                          <div className="flex items-center justify-between gap-3 mb-1 border-b border-[#ecece0] dark:border-[#38382e] pb-1">
                            <span className="font-mono text-[10px] text-[#7d8461] dark:text-[#9ca87a] font-bold">{item.date}</span>
                            <span className="px-1.5 py-0.2 bg-[#7d8461]/10 text-[#7d8461] dark:text-[#9ca87a] font-bold text-[10px] uppercase">
                              {item.moodLabel}
                            </span>
                          </div>
                          <p className="font-serif italic font-bold text-xs text-[#2c2c26] dark:text-[#f0efe6] truncate">
                            {item.title || 'Journal Entry'}
                          </p>
                          <p className="text-[10px] text-[#5c5c52] dark:text-[#a8a89b] mt-1">
                            {item.words} words written
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={3.2} stroke="#ddb892" strokeDasharray="3 3" opacity={0.6} />
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
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-[#fbfaf5] dark:bg-[#1a1a16] border border-dashed border-[#e8e8df] dark:border-[#38382e]">
            <Calendar className="w-6 h-6 text-[#7d8461] dark:text-[#9ca87a] mb-2" />
            <p className="font-serif italic text-sm text-[#2c2c26] dark:text-[#f0efe6]">No mood history recorded yet</p>
            <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] mt-0.5">
              Complete your reflections to populate your emotional trajectory chart.
            </p>
          </div>
        )}
      </div>

      {/* DIAGRAM 2: Word Volume & Reflection Output Over Time */}
      <div className="p-5 sm:p-6 rounded-none bg-white dark:bg-[#23231c] border border-[#e8e8df] dark:border-[#38382e] shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <PenTool className="w-4 h-4 text-[#7d8461] dark:text-[#9ca87a]" />
          <div>
            <h2 className="text-base font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6]">
              Reflection Output & Word Velocity
            </h2>
            <p className="text-[11px] text-[#5c5c52] dark:text-[#a8a89b]">
              Track your daily writing volume ({timeRange === '24h' ? '24 Hours' : timeRange === '7d' ? 'Last Week' : `${timeRange.replace('d', '')} Days`}).
            </p>
          </div>
        </div>

        {entries.length > 0 ? (
          <div className="w-full h-52 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={moodChartData}
                margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ecece0" vertical={false} className="dark:opacity-20" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#8c8c80' }}
                  tickLine={false}
                  axisLine={{ stroke: '#8c8c80', opacity: 0.3 }}
                  interval={timeRange === '30d' ? 3 : 0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#8c8c80' }}
                  tickLine={false}
                  axisLine={{ stroke: '#8c8c80', opacity: 0.3 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-[#23231c] border border-[#ecece0] dark:border-[#38382e] p-2.5 shadow-md rounded-none text-xs text-[#2c2c26] dark:text-[#f0efe6]">
                          <p className="font-mono text-[10px] text-[#7d8461] dark:text-[#9ca87a] font-bold">{item.date}</p>
                          <p className="text-xs font-serif font-bold text-[#2c2c26] dark:text-[#f0efe6] mt-0.5">
                            {item.words} words written
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="words" fill="#7d8461" radius={[0, 0, 0, 0]} barSize={20}>
                  {moodChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.words > 0 ? '#7d8461' : '#38382e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] py-6 text-center">
            Write your first entry to see your reflection output metrics.
          </p>
        )}
      </div>

      {/* Analytics Breakdown Grid - Square */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Dominant Emotional States */}
        <div className="p-5 sm:p-6 rounded-none bg-white dark:bg-[#23231c] border border-[#e8e8df] dark:border-[#38382e] shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Smile className="w-4 h-4 text-[#7d8461] dark:text-[#9ca87a]" />
            <h2 className="text-base font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6]">Dominant Emotional States</h2>
          </div>

          {stats.topMoods.length > 0 ? (
            <div className="space-y-3.5">
              {stats.topMoods.map((item, idx) => {
                const percentage = stats.totalEntries > 0 ? Math.round((item.count / stats.totalEntries) * 100) : 0;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs mb-1 font-medium">
                      <span className="text-[#2c2c26] dark:text-[#f0efe6]">{item.mood}</span>
                      <span className="text-[#5c5c52] dark:text-[#a8a89b] font-mono text-[11px]">{item.count} sessions ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-[#f4f4ea] dark:bg-[#1a1a16] rounded-none overflow-hidden border border-[#e8e8df] dark:border-[#38382e]">
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
            <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] py-6 text-center">
              Complete your first journal reflections to see emotional patterns.
            </p>
          )}
        </div>

        {/* DIAGRAM 3: Time of Day Reflection Habits */}
        <div className="p-5 sm:p-6 rounded-none bg-white dark:bg-[#23231c] border border-[#e8e8df] dark:border-[#38382e] shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[#7d8461] dark:text-[#9ca87a]" />
            <h2 className="text-base font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6]">Time of Day Reflection Rhythms</h2>
          </div>

          {stats.totalEntries > 0 ? (
            <div className="space-y-3">
              {stats.timeOfDayData.map((item, idx) => {
                const percentage = stats.totalEntries > 0 ? Math.round((item.count / stats.totalEntries) * 100) : 0;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs mb-1 font-medium">
                      <span className="text-[#2c2c26] dark:text-[#f0efe6] flex items-center gap-1.5">
                        <span>{item.icon}</span>
                        <span>{item.period}</span>
                      </span>
                      <span className="text-[#5c5c52] dark:text-[#a8a89b] font-mono text-[11px]">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#f4f4ea] dark:bg-[#1a1a16] rounded-none overflow-hidden border border-[#e8e8df] dark:border-[#38382e]">
                      <div
                        className="h-full bg-[#b08968] rounded-none transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] py-6 text-center">
              Reflection time patterns will emerge as you journal throughout the day.
            </p>
          )}
        </div>
      </div>

      {/* Core Themes & Focus */}
      <div className="p-5 sm:p-6 rounded-none bg-white dark:bg-[#23231c] border border-[#e8e8df] dark:border-[#38382e] shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-4 h-4 text-[#7d8461] dark:text-[#9ca87a]" />
          <h2 className="text-base font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6]">Core Themes & Philosophical Focus</h2>
        </div>

        {stats.topThemes.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {stats.topThemes.map((item, idx) => (
              <div
                key={idx}
                className="px-3 py-1 rounded-none bg-[#f4f4ea] dark:bg-[#1a1a16] border border-[#e8e8df] dark:border-[#38382e] text-xs text-[#2c2c26] dark:text-[#f0efe6] flex items-center gap-1.5 hover:border-[#7d8461] transition font-medium"
              >
                <span className="text-[#7d8461] dark:text-[#9ca87a] font-bold">#{item.theme}</span>
                <span className="px-1 py-0.2 rounded-none bg-white dark:bg-[#23231c] text-[10px] text-[#5c5c52] dark:text-[#a8a89b] font-mono border border-[#e8e8df] dark:border-[#38382e]">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] py-6 text-center">
            Themes extracted by AI will appear here as you log reflections.
          </p>
        )}
      </div>

      {/* Framework Utilization - Square */}
      <div className="p-5 sm:p-6 rounded-none bg-white dark:bg-[#23231c] border border-[#e8e8df] dark:border-[#38382e] shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[#7d8461] dark:text-[#9ca87a]" />
          <h2 className="text-base font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6]">Journaling Framework Preferences</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {JOURNAL_FRAMEWORKS.map((fw) => {
            const count = stats.frameworkCounts[fw.id] || 0;
            return (
              <div
                key={fw.id}
                className="p-3.5 rounded-none bg-[#fbfaf5] dark:bg-[#1a1a16] border border-[#ecece0] dark:border-[#38382e] flex items-center justify-between"
              >
                <div>
                  <p className="font-serif italic font-bold text-xs text-[#2c2c26] dark:text-[#f0efe6]">{fw.name}</p>
                  <p className="text-[10px] text-[#7d8461] dark:text-[#9ca87a] font-medium truncate max-w-[140px]">{fw.tagline}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-[#2c2c26] dark:text-[#f0efe6] font-mono">{count}</span>
                  <span className="text-[9px] text-[#5c5c52] dark:text-[#a8a89b] block uppercase tracking-wider">entries</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

