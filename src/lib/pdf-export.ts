import { jsPDF } from 'jspdf';
import type { JournalEntry } from '../types/journal';
import { JOURNAL_FRAMEWORKS } from './constants';

export function exportJournalToPdf(entry: JournalEntry): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const checkPageBreak = (heightNeeded: number) => {
    if (cursorY + heightNeeded > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
      // Draw minimal header on subsequent pages
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 130);
      doc.text(`Personal Gemini Journal — ${entry.title}`, margin, 12);
      doc.setDrawColor(230, 230, 220);
      doc.setLineWidth(0.2);
      doc.line(margin, 14, pageWidth - margin, 14);
      cursorY = 20;
    }
  };

  const frameworkInfo =
    JOURNAL_FRAMEWORKS.find((f) => f.id === entry.framework) || JOURNAL_FRAMEWORKS[0];

  const formattedDate = new Date(entry.createdAt).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(entry.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Top header branding
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(10);
  doc.setTextColor(125, 132, 97); // #7d8461 sage
  doc.text('PERSONAL GEMINI JOURNAL', margin, cursorY);
  cursorY += 6;

  // Title
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(20);
  doc.setTextColor(44, 44, 38); // #2c2c26
  const titleLines = doc.splitTextToSize(entry.title || 'Untitled Reflection', contentWidth);
  doc.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 8 + 2;

  // Metadata Row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 90);
  const metaText = `${formattedDate} at ${formattedTime}  |  Framework: ${frameworkInfo.name}${
    entry.detectedMood ? `  |  Mood: ${entry.detectedMood}` : ''
  }`;
  doc.text(metaText, margin, cursorY);
  cursorY += 5;

  if (entry.themes && entry.themes.length > 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(125, 132, 97);
    doc.text(`Tags: ${entry.themes.map((t) => `#${t}`).join(' ')}`, margin, cursorY);
    cursorY += 6;
  }

  // Divider Line
  doc.setDrawColor(220, 220, 210);
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  // Executive Summary Section
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(125, 132, 97);
  doc.text('EXECUTIVE SYNTHESIS', margin, cursorY);
  cursorY += 5;

  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(44, 44, 38);
  const summaryLines = doc.splitTextToSize(entry.executiveSummary || 'No summary recorded.', contentWidth);
  checkPageBreak(summaryLines.length * 5.5 + 4);
  doc.text(summaryLines, margin, cursorY);
  cursorY += summaryLines.length * 5.5 + 6;

  // Key Insights Section
  if (entry.keyInsights && entry.keyInsights.length > 0) {
    checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(125, 132, 97);
    doc.text('KEY INSIGHTS & REALIZATIONS', margin, cursorY);
    cursorY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(44, 44, 38);
    entry.keyInsights.forEach((insight) => {
      const insightLines = doc.splitTextToSize(`•  ${insight}`, contentWidth - 4);
      checkPageBreak(insightLines.length * 5 + 2);
      doc.text(insightLines, margin + 2, cursorY);
      cursorY += insightLines.length * 5 + 2;
    });
    cursorY += 4;
  }

  // Action Items Section
  if (entry.actionItems && entry.actionItems.length > 0) {
    checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(96, 108, 56);
    doc.text('NEXT STEPS & INTENTIONS', margin, cursorY);
    cursorY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(44, 44, 38);
    entry.actionItems.forEach((action) => {
      const actionLines = doc.splitTextToSize(`[✓]  ${action}`, contentWidth - 4);
      checkPageBreak(actionLines.length * 5 + 2);
      doc.text(actionLines, margin + 2, cursorY);
      cursorY += actionLines.length * 5 + 2;
    });
    cursorY += 4;
  }

  // Closing Affirmation
  if (entry.closingAffirmation) {
    checkPageBreak(20);
    doc.setFont('times', 'italic');
    doc.setFontSize(10.5);
    doc.setTextColor(140, 80, 40);
    const affLines = doc.splitTextToSize(`"${entry.closingAffirmation}"`, contentWidth);
    doc.text(affLines, margin, cursorY);
    cursorY += affLines.length * 5.5 + 6;
  }

  // Transcript Section
  if (entry.transcript && entry.transcript.length > 0) {
    checkPageBreak(25);
    doc.setDrawColor(220, 220, 210);
    doc.setLineWidth(0.3);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(125, 132, 97);
    doc.text('CONVERSATION TRANSCRIPT', margin, cursorY);
    cursorY += 6;

    entry.transcript.forEach((msg) => {
      const isUser = msg.role === 'user';
      const speaker = isUser ? 'You' : 'Gemini Reflection Partner';
      const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      checkPageBreak(18);

      // Speaker line
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(isUser ? 50 : 125, isUser ? 50 : 132, isUser ? 50 : 97);
      doc.text(`${speaker} (${timeStr})`, margin, cursorY);
      cursorY += 4.5;

      // Clean message content (remove markdown bold markers for PDF clean text)
      const cleanContent = msg.content
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(44, 44, 38);
      const msgLines = doc.splitTextToSize(cleanContent, contentWidth - 4);
      checkPageBreak(msgLines.length * 4.5 + 4);
      doc.text(msgLines, margin + 2, cursorY);
      cursorY += msgLines.length * 4.5 + 4;
    });
  }

  // Footer on final page
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 150);
    doc.text(
      `Page ${i} of ${pageCount}  •  Personal Gemini Journal`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  const safeFilename = `${(entry.title || 'journal_entry')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 40)}_${entry.id.slice(-6)}.pdf`;

  doc.save(safeFilename);
}

export function exportAnalyticsToPdf(
  entries: JournalEntry[],
  stats: {
    totalEntries: number;
    totalWords: number;
    totalInsights: number;
    avgWords: number;
    avgInsights: string;
    topMoods: { mood: string; count: number }[];
    topThemes: { theme: string; count: number }[];
    frameworkCounts: Record<string, number>;
    timeOfDayData: { period: string; count: number; icon: string }[];
  },
  streakCount: number,
  timeRange: string
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const checkPageBreak = (heightNeeded: number) => {
    if (cursorY + heightNeeded > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
      // Header on subsequent pages
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 130);
      doc.text('Personal Gemini Journal — Growth & Insights Report', margin, 12);
      doc.setDrawColor(230, 230, 220);
      doc.setLineWidth(0.2);
      doc.line(margin, 14, pageWidth - margin, 14);
      cursorY = 20;
    }
  };

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Top header branding
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(10);
  doc.setTextColor(125, 132, 97); // #7d8461 sage
  doc.text('PERSONAL GEMINI JOURNAL', margin, cursorY);
  cursorY += 6;

  // Title
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(18);
  doc.setTextColor(44, 44, 38);
  doc.text('Reflection Insights & Growth Report', margin, cursorY);
  cursorY += 7;

  // Meta row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 90);
  doc.text(`Generated on ${formattedDate}  |  Scope: ${timeRange.toUpperCase()} (${stats.totalEntries} total reflections)`, margin, cursorY);
  cursorY += 5;

  // Divider Line
  doc.setDrawColor(220, 220, 210);
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  // KEY METRICS SUMMARY
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(125, 132, 97);
  doc.text('EXECUTIVE METRICS', margin, cursorY);
  cursorY += 5;

  const colW = contentWidth / 4;
  const metrics = [
    { label: 'TOTAL ENTRIES', val: `${stats.totalEntries}` },
    { label: 'DAILY STREAK', val: `${streakCount} Days` },
    { label: 'TOTAL WORDS', val: `${stats.totalWords.toLocaleString()}` },
    { label: 'AVG WORDS / SESSION', val: `~${stats.avgWords}` },
  ];

  metrics.forEach((m, idx) => {
    const x = margin + idx * colW;
    doc.setFillColor(251, 250, 245);
    doc.setDrawColor(232, 232, 223);
    doc.rect(x, cursorY, colW - 2, 14, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 110);
    doc.text(m.label, x + 2.5, cursorY + 4.5);

    doc.setFont('times', 'bolditalic');
    doc.setFontSize(11);
    doc.setTextColor(44, 44, 38);
    doc.text(m.val, x + 2.5, cursorY + 11);
  });
  cursorY += 19;

  // EMOTIONAL STATES BREAKDOWN
  if (stats.topMoods && stats.topMoods.length > 0) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(125, 132, 97);
    doc.text('DOMINANT EMOTIONAL STATES', margin, cursorY);
    cursorY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(44, 44, 38);
    stats.topMoods.forEach((m) => {
      const percentage = stats.totalEntries > 0 ? Math.round((m.count / stats.totalEntries) * 100) : 0;
      doc.text(`•  ${m.mood}: ${m.count} sessions (${percentage}%)`, margin + 2, cursorY);
      cursorY += 4.5;
    });
    cursorY += 4;
  }

  // TOP THEMES
  if (stats.topThemes && stats.topThemes.length > 0) {
    checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(125, 132, 97);
    doc.text('CORE THEMES & PHILOSOPHICAL FOCUS', margin, cursorY);
    cursorY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(44, 44, 38);
    const themesStr = stats.topThemes.map((t) => `#${t.theme} (${t.count})`).join('   ');
    const themeLines = doc.splitTextToSize(themesStr, contentWidth);
    doc.text(themeLines, margin + 2, cursorY);
    cursorY += themeLines.length * 4.5 + 4;
  }

  // FRAMEWORKS BREAKDOWN
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(125, 132, 97);
  doc.text('FRAMEWORK DISTRIBUTION', margin, cursorY);
  cursorY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(44, 44, 38);
  JOURNAL_FRAMEWORKS.forEach((fw) => {
    const count = stats.frameworkCounts[fw.id] || 0;
    if (count > 0) {
      doc.text(`•  ${fw.name}: ${count} entries`, margin + 2, cursorY);
      cursorY += 4.5;
    }
  });
  cursorY += 4;

  // CHRONOLOGICAL RECENT ENTRIES LIST
  if (entries.length > 0) {
    checkPageBreak(25);
    doc.setDrawColor(220, 220, 210);
    doc.setLineWidth(0.3);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(125, 132, 97);
    doc.text('RECENT REFLECTION LOGS', margin, cursorY);
    cursorY += 5;

    const recent = entries.slice(0, 15);
    recent.forEach((e, idx) => {
      checkPageBreak(12);
      const dateStr = new Date(e.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const fwName = JOURNAL_FRAMEWORKS.find((f) => f.id === e.framework)?.name || e.framework;
      const moodStr = e.detectedMood || e.initialMood || 'Reflective';

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(44, 44, 38);
      doc.text(`${idx + 1}. ${e.title || 'Untitled'}`, margin + 2, cursorY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 90);
      doc.text(`${dateStr} | ${fwName} | Mood: ${moodStr} | ${e.wordCount || 0} words`, margin + 4, cursorY + 3.8);
      cursorY += 8;
    });
  }

  // Footer on all pages
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 150);
    doc.text(
      `Page ${i} of ${pageCount}  •  Fuenzer Journal Insights & Growth Report`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  const dateSlug = new Date().toISOString().split('T')[0];
  doc.save(`fuenzer_journal_insights_${dateSlug}.pdf`);
}

/**
 * Export full multi-entry Journal Archive to a formatted PDF book/compilation
 */
export function exportArchiveToPdf(entries: JournalEntry[], filterDescription = 'All Reflections'): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const checkPageBreak = (heightNeeded: number) => {
    if (cursorY + heightNeeded > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 130);
      doc.text('Fuenzer Journal — Personal Archive Compilation', margin, 12);
      doc.setDrawColor(230, 230, 220);
      doc.setLineWidth(0.2);
      doc.line(margin, 14, pageWidth - margin, 14);
      cursorY = 20;
    }
  };

  // Cover / Header
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(10);
  doc.setTextColor(125, 132, 97);
  doc.text('PERSONAL SANCTUARY ARCHIVE', margin, cursorY);
  cursorY += 6;

  doc.setFont('times', 'bolditalic');
  doc.setFontSize(22);
  doc.setTextColor(44, 44, 38);
  doc.text('Personal Journal Archive Digest', margin, cursorY);
  cursorY += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 90);
  const nowStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  doc.text(`Preserved on ${nowStr}  •  Scope: ${filterDescription} (${entries.length} reflections)`, margin, cursorY);
  cursorY += 8;

  doc.setDrawColor(220, 220, 210);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  if (entries.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 110);
    doc.text('No journal entries found matching current filter scope.', margin, cursorY);
  } else {
    entries.forEach((e, idx) => {
      checkPageBreak(35);

      const fwName = JOURNAL_FRAMEWORKS.find((f) => f.id === e.framework)?.name || e.framework;
      const moodStr = e.detectedMood || e.initialMood || 'Reflective';
      const dateStr = new Date(e.createdAt).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      // Entry title
      doc.setFont('times', 'bolditalic');
      doc.setFontSize(13);
      doc.setTextColor(44, 44, 38);
      const titleLines = doc.splitTextToSize(`${idx + 1}. ${e.title || 'Untitled Reflection'}`, contentWidth);
      doc.text(titleLines, margin, cursorY);
      cursorY += titleLines.length * 5.5 + 1;

      // Meta
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(125, 132, 97);
      doc.text(`${dateStr}  |  Framework: ${fwName}  |  Mood: ${moodStr}  |  ${e.wordCount || 0} words`, margin + 2, cursorY);
      cursorY += 5;

      // Summary
      if (e.executiveSummary) {
        checkPageBreak(15);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 54);
        const sumLines = doc.splitTextToSize(e.executiveSummary, contentWidth - 4);
        doc.text(sumLines, margin + 2, cursorY);
        cursorY += sumLines.length * 4.2 + 3;
      }

      // Key Realizations
      if (e.keyInsights && e.keyInsights.length > 0) {
        checkPageBreak(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(125, 132, 97);
        doc.text('Key Realizations:', margin + 2, cursorY);
        cursorY += 3.8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 45);
        e.keyInsights.forEach((ki) => {
          checkPageBreak(8);
          const kiLines = doc.splitTextToSize(`• ${ki}`, contentWidth - 6);
          doc.text(kiLines, margin + 4, cursorY);
          cursorY += kiLines.length * 3.8 + 1;
        });
        cursorY += 2;
      }

      // Action Items
      if (e.actionItems && e.actionItems.length > 0) {
        checkPageBreak(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(125, 132, 97);
        doc.text('Next Action Steps:', margin + 2, cursorY);
        cursorY += 3.8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 45);
        e.actionItems.forEach((ai) => {
          checkPageBreak(8);
          const aiLines = doc.splitTextToSize(`[ ] ${ai}`, contentWidth - 6);
          doc.text(aiLines, margin + 4, cursorY);
          cursorY += aiLines.length * 3.8 + 1;
        });
        cursorY += 2;
      }

      // Divider between entries
      cursorY += 4;
      doc.setDrawColor(235, 235, 225);
      doc.setLineWidth(0.2);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 6;
    });
  }

  // Footer on all pages
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 150);
    doc.text(
      `Page ${i} of ${pageCount}  •  Fuenzer Journal Archive Digest`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  const dateSlug = new Date().toISOString().split('T')[0];
  doc.save(`fuenzer_journal_archive_${dateSlug}.pdf`);
}

