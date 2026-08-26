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
