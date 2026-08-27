import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Sparkles,
  Download,
  Copy,
  Check,
  Trash2,
  Smile,
  Lightbulb,
  CheckCircle2,
  FileText,
  MessageSquare,
  ArrowRight,
  Square,
  CheckSquare,
} from 'lucide-react';
import type { JournalEntry } from '../types/journal';
import { JOURNAL_FRAMEWORKS } from '../lib/constants';
import { exportJournalToPdf } from '../lib/pdf-export';
import { MarkdownRenderer } from './MarkdownRenderer';
import { formatJournalDate, formatJournalTime } from '../lib/date-utils';
import { ConfirmationModal } from './ConfirmationModal';
import { updateJournalActionItems } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

interface JournalDetailModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (entryId: string) => void;
  onTogglePin?: (entryId: string, currentPin: boolean) => void;
  onResumeSession?: (entry: JournalEntry) => void;
  onUpdateEntryActionItems?: (entryId: string, actionItems: string[]) => void;
}

export const JournalDetailModal: React.FC<JournalDetailModalProps> = ({
  entry,
  isOpen,
  onClose,
  onDelete,
  onResumeSession,
  onUpdateEntryActionItems,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'insights' | 'transcript'>('insights');
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Local action items state for immediate to-do toggle responsiveness
  const [localActionItems, setLocalActionItems] = useState<string[]>([]);

  useEffect(() => {
    if (entry?.actionItems) {
      setLocalActionItems(entry.actionItems);
    } else {
      setLocalActionItems([]);
    }
  }, [entry]);

  if (!isOpen || !entry) return null;

  const frameworkInfo =
    JOURNAL_FRAMEWORKS.find((f) => f.id === entry.framework) || JOURNAL_FRAMEWORKS[0];

  const formattedDate = formatJournalDate(entry.createdAt, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = formatJournalTime(entry.createdAt);

  const isItemChecked = (item: string) => {
    return item.startsWith('[x] ') || item.startsWith('[X] ') || item.startsWith('[✓] ');
  };

  const cleanItemText = (item: string) => {
    return item.replace(/^\[[xX✓ ]\]\s*/, '');
  };

  const handleToggleTodo = async (index: number) => {
    const updated = [...localActionItems];
    const current = updated[index];
    const checked = isItemChecked(current);
    const text = cleanItemText(current);

    // Toggle checkmark
    updated[index] = checked ? text : `[x] ${text}`;
    setLocalActionItems(updated);

    if (onUpdateEntryActionItems) {
      onUpdateEntryActionItems(entry.id, updated);
    }

    if (user?.uid) {
      try {
        await updateJournalActionItems(user.uid, entry.id, updated);
      } catch (err) {
        console.error('Failed to sync to-do toggle to Firestore:', err);
      }
    }
  };

  // Generate Plain Text representation
  const generatePlainText = () => {
    let text = `${entry.title.toUpperCase()}\n`;
    text += `Date: ${formattedDate} at ${formattedTime}\n`;
    text += `Framework: ${frameworkInfo.name}\n`;
    if (entry.detectedMood) text += `Mood: ${entry.detectedMood}\n`;
    if (entry.themes?.length) text += `Themes: ${entry.themes.map((t) => `#${t}`).join(' ')}\n`;
    text += `\n========================================\n\n`;
    text += `EXECUTIVE SUMMARY:\n${entry.executiveSummary}\n\n`;

    if (localActionItems.length) {
      text += `NEXT STEPS & TO-DO LIST:\n`;
      localActionItems.forEach((item) => {
        const checked = isItemChecked(item);
        text += `[${checked ? 'X' : ' '}] ${cleanItemText(item)}\n`;
      });
      text += `\n`;
    }

    if (entry.keyInsights?.length) {
      text += `KEY INSIGHTS & REALIZATIONS:\n`;
      entry.keyInsights.forEach((item) => {
        text += `• ${item}\n`;
      });
      text += `\n`;
    }

    if (entry.closingAffirmation) {
      text += `AFFIRMATION:\n"${entry.closingAffirmation}"\n\n`;
    }

    text += `========================================\nCONVERSATION TRANSCRIPT:\n\n`;
    entry.transcript?.forEach((msg) => {
      const speaker = msg.role === 'user' ? 'ME' : 'GEMINI';
      text += `[${speaker}]:\n${msg.content}\n\n`;
    });

    return text;
  };

  // Generate Markdown representation
  const generateMarkdown = () => {
    let md = `# ${entry.title}\n\n`;
    md += `**Date**: ${formattedDate} at ${formattedTime}\n`;
    md += `**Framework**: ${frameworkInfo.name}\n`;
    if (entry.detectedMood) md += `**Mood**: ${entry.detectedMood}\n`;
    if (entry.themes?.length) md += `**Themes**: ${entry.themes.map((t) => `#${t}`).join(' ')}\n`;
    md += `\n---\n\n`;
    md += `## Executive Summary\n${entry.executiveSummary}\n\n`;

    if (localActionItems.length) {
      md += `## Next Steps & Intentions\n`;
      localActionItems.forEach((item) => {
        const checked = isItemChecked(item);
        md += `- [${checked ? 'x' : ' '}] ${cleanItemText(item)}\n`;
      });
      md += `\n`;
    }

    if (entry.keyInsights?.length) {
      md += `## Key Insights\n`;
      entry.keyInsights.forEach((item) => {
        md += `- ${item}\n`;
      });
      md += `\n`;
    }

    if (entry.closingAffirmation) {
      md += `> "${entry.closingAffirmation}"\n\n`;
    }

    md += `\n---\n\n## Conversation Transcript\n\n`;
    entry.transcript.forEach((msg) => {
      md += `### ${msg.role === 'user' ? 'Me' : 'Partner'}\n${msg.content}\n\n`;
    });

    return md;
  };

  const handleCopyPlainText = () => {
    navigator.clipboard.writeText(generatePlainText());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entry.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${entry.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify({ ...entry, actionItems: localActionItems }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal_${entry.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    exportJournalToPdf({ ...entry, actionItems: localActionItems });
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#2c2c26]/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white dark:bg-[#23231c] border border-[#ecece0] dark:border-[#38382e] rounded-none max-w-4xl w-full p-4 sm:p-6 shadow-xl text-[#2c2c26] dark:text-[#f0efe6] relative my-4 flex flex-col max-h-[92vh] animate-in fade-in duration-150">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#5c5c52] dark:text-[#9e9e90] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] p-1.5 rounded-none hover:bg-[#f4f4ea] dark:hover:bg-[#2c2c24] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="border-b border-[#ecece0] dark:border-[#38382e] pb-4 pr-8">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs text-[#5c5c52] dark:text-[#a8a89b] flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a]" />
                <span>{formattedDate} • {formattedTime}</span>
              </span>
              <span className="text-[#d8d8cc] dark:text-[#424236] hidden sm:inline">•</span>
              <span className="px-2.5 py-0.5 rounded-none text-[9px] uppercase tracking-wider bg-[#7d8461]/10 text-[#4c5432] dark:text-[#9ca87a] border border-[#7d8461]/25 font-bold">
                {frameworkInfo.name}
              </span>
              {(entry.detectedMood || entry.initialMood) && (
                <span className="px-2.5 py-0.5 rounded-none text-[9px] uppercase tracking-wider bg-[#ddb892]/20 text-[#7f4f24] dark:text-[#f4a261] border border-[#ddb892]/40 flex items-center gap-1 font-bold">
                  <Smile className="w-3 h-3" />
                  <span>{entry.detectedMood || entry.initialMood}</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6] tracking-tight">
              {entry.title}
            </h1>

            {/* Tags */}
            {entry.themes && entry.themes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {entry.themes.map((theme, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-none bg-[#f4f4ea] dark:bg-[#2c2c24] text-[#5c5c52] dark:text-[#d8d8cc] border border-[#e8e8df] dark:border-[#38382e] font-medium"
                  >
                    #{theme}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tab Selector & Export Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 py-2.5 border-b border-[#ecece0] dark:border-[#38382e]">
            <div className="flex items-center bg-[#f4f4ea] dark:bg-[#1a1a16] p-0.5 rounded-none border border-[#e8e8df] dark:border-[#38382e]">
              <button
                onClick={() => setActiveTab('insights')}
                className={`flex items-center gap-1 px-3 py-1 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'insights'
                    ? 'bg-[#7d8461] text-white shadow-xs'
                    : 'text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6]'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Executive Synthesis</span>
              </button>
              <button
                onClick={() => setActiveTab('transcript')}
                className={`flex items-center gap-1 px-3 py-1 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'transcript'
                    ? 'bg-[#7d8461] text-white shadow-xs'
                    : 'text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6]'
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                <span>Transcript ({entry.transcript?.length || 0})</span>
              </button>
            </div>

            {/* Export tools */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {/* Copy Plain Text */}
              <button
                onClick={handleCopyPlainText}
                className="px-2.5 py-1 rounded-none bg-[#f4f4ea] dark:bg-[#2c2c24] hover:bg-[#ecece0] dark:hover:bg-[#38382e] text-[#2c2c26] dark:text-[#f0efe6] text-xs font-medium flex items-center gap-1 border border-[#e8e8df] dark:border-[#38382e] transition cursor-pointer shrink-0"
                title="Copy clean plain text"
              >
                {copiedText ? <Check className="w-3 h-3 text-[#7d8461]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
              </button>

              {/* Copy Markdown */}
              <button
                onClick={handleCopyMarkdown}
                className="px-2.5 py-1 rounded-none bg-[#f4f4ea] dark:bg-[#2c2c24] hover:bg-[#ecece0] dark:hover:bg-[#38382e] text-[#2c2c26] dark:text-[#f0efe6] text-xs font-medium flex items-center gap-1 border border-[#e8e8df] dark:border-[#38382e] transition cursor-pointer shrink-0"
                title="Copy entry as formatted Markdown"
              >
                {copiedMd ? <Check className="w-3 h-3 text-[#7d8461]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedMd ? 'Copied' : 'Copy MD'}</span>
              </button>

              {/* PDF Export */}
              <button
                onClick={handleExportPdf}
                className="px-2.5 py-1 rounded-none bg-[#7d8461]/15 hover:bg-[#7d8461]/25 text-[#4c5432] dark:text-[#9ca87a] text-xs font-semibold flex items-center gap-1 border border-[#7d8461]/30 transition cursor-pointer shrink-0"
                title="Export and download as formatted PDF"
              >
                <Download className="w-3 h-3 text-[#7d8461] dark:text-[#9ca87a]" />
                <span>PDF</span>
              </button>

              {/* Markdown file download */}
              <button
                onClick={handleDownloadMarkdown}
                className="px-2 py-1 rounded-none bg-[#f4f4ea] dark:bg-[#2c2c24] hover:bg-[#ecece0] dark:hover:bg-[#38382e] text-[#2c2c26] dark:text-[#f0efe6] text-xs font-medium flex items-center gap-1 border border-[#e8e8df] dark:border-[#38382e] transition cursor-pointer shrink-0"
                title="Download Markdown file"
              >
                <Download className="w-3 h-3" />
                <span>.md</span>
              </button>

              {/* JSON file download */}
              <button
                onClick={handleDownloadJson}
                className="px-2 py-1 rounded-none bg-[#f4f4ea] dark:bg-[#2c2c24] hover:bg-[#ecece0] dark:hover:bg-[#38382e] text-[#2c2c26] dark:text-[#f0efe6] text-xs font-medium flex items-center gap-1 border border-[#e8e8df] dark:border-[#38382e] transition cursor-pointer shrink-0"
                title="Download JSON file"
              >
                <Download className="w-3 h-3" />
                <span>.json</span>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-4">
            {activeTab === 'insights' ? (
              <div className="space-y-4">
                {/* Executive Summary Card */}
                <div className="p-4 sm:p-5 rounded-none bg-[#7d8461]/5 dark:bg-[#7d8461]/10 border border-[#7d8461]/20">
                  <div className="flex items-center gap-1.5 mb-1.5 text-[#7d8461] dark:text-[#9ca87a] font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Executive Summary</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#2c2c26] dark:text-[#f0efe6] leading-relaxed font-serif italic">
                    {entry.executiveSummary}
                  </p>
                </div>

                {/* Interactive Action Items & To-Do List */}
                {localActionItems && localActionItems.length > 0 && (
                  <div className="p-4 sm:p-5 rounded-none bg-[#fbfaf5] dark:bg-[#1f1f18] border border-[#ecece0] dark:border-[#38382e]">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 text-[#606c38] dark:text-[#9ca87a] font-bold text-xs uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Action Items & To-Do List</span>
                      </div>
                      <span className="text-[10px] text-[#8c8c80] font-mono">
                        {localActionItems.filter(isItemChecked).length}/{localActionItems.length} Done
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {localActionItems.map((action, idx) => {
                        const checked = isItemChecked(action);
                        const text = cleanItemText(action);
                        return (
                          <li
                            key={idx}
                            onClick={() => handleToggleTodo(idx)}
                            className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2c2c26] dark:text-[#f0efe6] leading-relaxed p-2 rounded-none hover:bg-[#f4f4ea] dark:hover:bg-[#282820] cursor-pointer transition select-none group"
                          >
                            <button
                              type="button"
                              className={`mt-0.5 shrink-0 transition-colors ${
                                checked ? 'text-[#7d8461] dark:text-[#9ca87a]' : 'text-[#8c8c80] group-hover:text-[#7d8461]'
                              }`}
                              aria-label={checked ? 'Mark to-do incomplete' : 'Mark to-do complete'}
                            >
                              {checked ? (
                                <CheckSquare className="w-4 h-4" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                            <span
                              className={`flex-1 transition-all ${
                                checked
                                  ? 'line-through text-[#8c8c80] dark:text-[#78786e]'
                                  : 'text-[#2c2c26] dark:text-[#f0efe6]'
                              }`}
                            >
                              {text}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Key Insights */}
                {entry.keyInsights && entry.keyInsights.length > 0 && (
                  <div className="p-4 sm:p-5 rounded-none bg-[#fbfaf5] dark:bg-[#1f1f18] border border-[#ecece0] dark:border-[#38382e]">
                    <div className="flex items-center gap-1.5 mb-2.5 text-[#7d8461] dark:text-[#9ca87a] font-bold text-xs uppercase tracking-wider">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Key Insights & Realizations</span>
                    </div>
                    <ul className="space-y-2">
                      {entry.keyInsights.map((insight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#2c2c26] dark:text-[#f0efe6] leading-relaxed">
                          <span className="text-[#7d8461] dark:text-[#9ca87a] font-bold mt-0.5">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Closing Affirmation */}
                {entry.closingAffirmation && (
                  <div className="p-4 rounded-none bg-[#ddb892]/15 dark:bg-[#ddb892]/20 border border-[#ddb892]/30 text-xs italic text-[#7f4f24] dark:text-[#f4a261]">
                    <span className="font-bold not-italic block mb-1 uppercase tracking-wider text-[9px]">Affirmation</span>
                    &ldquo;{entry.closingAffirmation}&rdquo;
                  </div>
                )}
              </div>
            ) : (
              /* Full Transcript Stream */
              <div className="space-y-3">
                {entry.transcript?.map((msg) => {
                  const isUser = msg.role === 'user';
                  const isCopied = copiedMsgId === msg.id;
                  const hasImages = Array.isArray(msg.images) && msg.images.length > 0;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-none shrink-0 flex items-center justify-center text-[9px] font-bold ${
                          isUser
                            ? 'bg-[#3a3a30] dark:bg-[#4a4a3e] text-[#fbfaf5]'
                            : 'bg-[#7d8461] text-white'
                        }`}
                      >
                        {isUser ? 'ME' : 'G'}
                      </div>
                      <div
                        className={`group relative max-w-[85%] p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs rounded-none ${
                          isUser
                            ? 'bg-[#3a3a30] dark:bg-[#2e2e26] text-[#fbfaf5]'
                            : 'bg-[#f4f4ea] dark:bg-[#1a1a16] border border-[#ecece0] dark:border-[#38382e] text-[#2c2c26] dark:text-[#f0efe6]'
                        }`}
                      >
                        {hasImages && (
                          <div className="mb-2.5 flex flex-wrap gap-2">
                            {msg.images!.map((img, idx) => (
                              <a
                                key={idx}
                                href={img.data}
                                target="_blank"
                                rel="noreferrer"
                                className="border border-[#ecece0]/40 overflow-hidden block bg-black/10 max-w-[120px] max-h-[120px]"
                                title={`${img.name} (Click to open full size)`}
                              >
                                <img
                                  src={img.data}
                                  alt={img.name}
                                  className="w-full h-20 object-cover hover:scale-105 transition-transform"
                                />
                              </a>
                            ))}
                          </div>
                        )}
                        <MarkdownRenderer content={msg.content} isUser={isUser} />
                        
                        <div
                          className={`mt-2 pt-1.5 border-t flex items-center justify-between text-[9px] font-mono ${
                            isUser
                              ? 'border-[#4f4f42] text-[#d8d8cc]'
                              : 'border-[#ecece0] dark:border-[#38382e] text-[#7d8461] dark:text-[#9ca87a]'
                          }`}
                        >
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-none transition cursor-pointer font-sans ${
                              isUser
                                ? 'hover:bg-[#4f4f42] text-[#e8e8df]'
                                : 'hover:bg-[#ecece0] dark:hover:bg-[#282820] text-[#5c5c52] dark:text-[#a8a89b]'
                            }`}
                            title="Copy message text"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-[#99c17b]" />
                                <span className="text-[10px] text-[#99c17b] font-bold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-[10px] opacity-75 group-hover:opacity-100">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-[#ecece0] dark:border-[#38382e] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 mt-auto">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-2 bg-[#c86d51]/10 dark:bg-[#c86d51]/20 hover:bg-[#c86d51]/20 dark:hover:bg-[#c86d51]/30 text-[#96472d] dark:text-[#e07a5f] border border-[#c86d51]/30 rounded-none text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
              title="Delete this reflection"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>Delete</span>
            </button>

            <div className="flex items-center gap-2 shrink-0">
              {onResumeSession && (
                <button
                  onClick={() => {
                    onResumeSession(entry);
                    onClose();
                  }}
                  className="px-3.5 sm:px-4 py-2 bg-[#7d8461] hover:bg-[#6c7351] text-white rounded-none text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer uppercase tracking-wider whitespace-nowrap"
                  title="Open this entry back in the reflection studio"
                >
                  <span>Continue / Edit</span>
                  <ArrowRight className="w-3 h-3 shrink-0" />
                </button>
              )}
              <button
                onClick={onClose}
                className="px-3.5 sm:px-4 py-2 bg-[#3a3a30] dark:bg-[#2c2c24] hover:bg-[#2c2c26] dark:hover:bg-[#38382e] text-[#fbfaf5] rounded-none text-xs font-bold transition cursor-pointer uppercase tracking-wider shrink-0"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDelete(entry.id);
          onClose();
        }}
        title="Delete Journal Entry?"
        message="This reflection and all its insights and transcript will be permanently removed from your personal journal archive. This action cannot be undone."
        confirmLabel="Delete Permanently"
        cancelLabel="Keep Entry"
        variant="danger"
        icon="trash"
      />
    </>
  );
};
