import React, { useState } from 'react';
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
} from 'lucide-react';
import type { JournalEntry } from '../types/journal';
import { JOURNAL_FRAMEWORKS } from '../lib/constants';

interface JournalDetailModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (entryId: string) => void;
  onTogglePin?: (entryId: string, currentPin: boolean) => void;
  onResumeSession?: (entry: JournalEntry) => void;
}

export const JournalDetailModal: React.FC<JournalDetailModalProps> = ({
  entry,
  isOpen,
  onClose,
  onDelete,
  onResumeSession,
}) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'transcript'>('insights');
  const [copiedMd, setCopiedMd] = useState(false);

  if (!isOpen || !entry) return null;

  const frameworkInfo =
    JOURNAL_FRAMEWORKS.find((f) => f.id === entry.framework) || JOURNAL_FRAMEWORKS[0];

  const formattedDate = new Date(entry.createdAt).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(entry.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Generate Markdown representation
  const generateMarkdown = () => {
    let md = `# ${entry.title}\n\n`;
    md += `**Date**: ${formattedDate} at ${formattedTime}\n`;
    md += `**Framework**: ${frameworkInfo.name}\n`;
    if (entry.detectedMood) md += `**Mood**: ${entry.detectedMood}\n`;
    if (entry.themes?.length) md += `**Themes**: ${entry.themes.map((t) => `#${t}`).join(' ')}\n`;
    md += `\n---\n\n`;
    md += `## Executive Summary\n${entry.executiveSummary}\n\n`;

    if (entry.keyInsights?.length) {
      md += `## Key Insights\n`;
      entry.keyInsights.forEach((item) => {
        md += `- ${item}\n`;
      });
      md += `\n`;
    }

    if (entry.actionItems?.length) {
      md += `## Next Steps & Intentions\n`;
      entry.actionItems.forEach((item) => {
        md += `- [ ] ${item}\n`;
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
    const jsonStr = JSON.stringify(entry, null, 2);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#2c2c26]/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#ecece0] rounded-none max-w-4xl w-full p-4 sm:p-6 shadow-xl text-[#2c2c26] relative my-4 flex flex-col max-h-[92vh] animate-in fade-in duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#5c5c52] hover:text-[#2c2c26] p-1.5 rounded-none hover:bg-[#f4f4ea] transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-[#ecece0] pb-4 pr-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-none text-[9px] uppercase tracking-wider bg-[#7d8461]/10 text-[#4c5432] border border-[#7d8461]/25 font-bold">
              {frameworkInfo.name}
            </span>
            {entry.detectedMood && (
              <span className="px-2.5 py-0.5 rounded-none text-[9px] uppercase tracking-wider bg-[#ddb892]/20 text-[#7f4f24] border border-[#ddb892]/40 flex items-center gap-1 font-bold">
                <Smile className="w-3 h-3" />
                <span>{entry.detectedMood}</span>
              </span>
            )}
            <span className="text-xs text-[#5c5c52] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#7d8461]" />
              <span>{formattedDate} • {formattedTime}</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-serif italic font-bold text-[#2c2c26] tracking-tight">
            {entry.title}
          </h1>

          {/* Tags */}
          {entry.themes && entry.themes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.themes.map((theme, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-none bg-[#f4f4ea] text-[#5c5c52] border border-[#e8e8df] font-medium"
                >
                  #{theme}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tab Selector & Export Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 py-2.5 border-b border-[#ecece0]">
          <div className="flex items-center bg-[#f4f4ea] p-0.5 rounded-none border border-[#e8e8df]">
            <button
              onClick={() => setActiveTab('insights')}
              className={`flex items-center gap-1 px-3 py-1 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'insights'
                  ? 'bg-[#7d8461] text-white shadow-xs'
                  : 'text-[#5c5c52] hover:text-[#2c2c26]'
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
                  : 'text-[#5c5c52] hover:text-[#2c2c26]'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Transcript ({entry.transcript?.length || 0})</span>
            </button>
          </div>

          {/* Export tools */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyMarkdown}
              className="px-2.5 py-1 rounded-none bg-[#f4f4ea] hover:bg-[#ecece0] text-[#2c2c26] text-xs font-medium flex items-center gap-1 border border-[#e8e8df] transition cursor-pointer"
              title="Copy entry as formatted Markdown"
            >
              {copiedMd ? <Check className="w-3 h-3 text-[#7d8461]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedMd ? 'Copied' : 'Copy MD'}</span>
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="px-2.5 py-1 rounded-none bg-[#f4f4ea] hover:bg-[#ecece0] text-[#2c2c26] text-xs font-medium flex items-center gap-1 border border-[#e8e8df] transition cursor-pointer"
              title="Download Markdown file"
            >
              <Download className="w-3 h-3" />
              <span>.md</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="px-2.5 py-1 rounded-none bg-[#f4f4ea] hover:bg-[#ecece0] text-[#2c2c26] text-xs font-medium flex items-center gap-1 border border-[#e8e8df] transition cursor-pointer"
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
              <div className="p-4 sm:p-5 rounded-none bg-[#7d8461]/5 border border-[#7d8461]/20">
                <div className="flex items-center gap-1.5 mb-1.5 text-[#7d8461] font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Executive Summary</span>
                </div>
                <p className="text-xs sm:text-sm text-[#2c2c26] leading-relaxed font-serif italic">
                  {entry.executiveSummary}
                </p>
              </div>

              {/* Key Insights */}
              {entry.keyInsights && entry.keyInsights.length > 0 && (
                <div className="p-4 sm:p-5 rounded-none bg-[#fbfaf5] border border-[#ecece0]">
                  <div className="flex items-center gap-1.5 mb-2.5 text-[#7d8461] font-bold text-xs uppercase tracking-wider">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Key Insights & Realizations</span>
                  </div>
                  <ul className="space-y-2">
                    {entry.keyInsights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#2c2c26] leading-relaxed">
                        <span className="text-[#7d8461] font-bold mt-0.5">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              {entry.actionItems && entry.actionItems.length > 0 && (
                <div className="p-4 sm:p-5 rounded-none bg-[#fbfaf5] border border-[#ecece0]">
                  <div className="flex items-center gap-1.5 mb-2.5 text-[#606c38] font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Next Steps & Intentions</span>
                  </div>
                  <ul className="space-y-2">
                    {entry.actionItems.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#2c2c26] leading-relaxed">
                        <span className="text-[#7d8461] font-bold mt-0.5">✓</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Closing Affirmation */}
              {entry.closingAffirmation && (
                <div className="p-4 rounded-none bg-[#ddb892]/15 border border-[#ddb892]/30 text-xs italic text-[#7f4f24]">
                  <span className="font-bold not-italic block mb-1 uppercase tracking-wider text-[9px]">Affirmation</span>
                  &ldquo;{entry.closingAffirmation}&rdquo;
                </div>
              )}
            </div>
          ) : (
            /* Full Transcript Stream - Square */
            <div className="space-y-3">
              {entry.transcript?.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-none shrink-0 flex items-center justify-center text-[9px] font-bold ${
                        isUser
                          ? 'bg-[#3a3a30] text-[#fbfaf5]'
                          : 'bg-[#7d8461] text-white'
                      }`}
                    >
                      {isUser ? 'ME' : 'G'}
                    </div>
                    <div
                      className={`max-w-[85%] p-3 text-xs sm:text-sm leading-relaxed shadow-xs rounded-none ${
                        isUser
                          ? 'bg-[#3a3a30] text-[#fbfaf5]'
                          : 'bg-[#f4f4ea] border border-[#ecece0] text-[#2c2c26]'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      <div
                        className={`mt-1.5 text-[9px] font-mono ${
                          isUser ? 'text-[#d8d8cc]' : 'text-[#7d8461]'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-3 border-t border-[#ecece0] flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Delete this journal entry permanently?')) {
                onDelete(entry.id);
                onClose();
              }
            }}
            className="px-3 py-1.5 bg-[#c86d51]/10 hover:bg-[#c86d51]/20 text-[#96472d] border border-[#c86d51]/30 rounded-none text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            {onResumeSession && (
              <button
                onClick={() => {
                  onResumeSession(entry);
                  onClose();
                }}
                className="px-4 py-2 bg-[#7d8461] hover:bg-[#6c7351] text-white rounded-none text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer uppercase tracking-wider"
              >
                <span>Continue</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#3a3a30] hover:bg-[#2c2c26] text-[#fbfaf5] rounded-none text-xs font-bold transition cursor-pointer uppercase tracking-wider"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
