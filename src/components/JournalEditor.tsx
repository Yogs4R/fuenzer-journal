import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  RefreshCw,
  Trash2,
  FileCheck,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Compass,
  HeartHandshake,
  Shield,
  Brain,
  Feather,
  Lightbulb,
} from 'lucide-react';
import type {
  ChatMessage,
  JournalFrameworkId,
  JournalSummary,
  JournalEntry,
} from '../types/journal';
import { JOURNAL_FRAMEWORKS, MOOD_OPTIONS } from '../lib/constants';
import { MoodIcon } from './MoodIcon';
import { sendChatMessage, summarizeJournalSession, fetchDynamicPrompts } from '../lib/gemini-client';
import { saveDraftSession, clearDraftSession } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { SummaryModal } from './SummaryModal';
import { MarkdownRenderer } from './MarkdownRenderer';

interface JournalEditorProps {
  onEntrySaved: (entry: JournalEntry) => void;
  initialTranscript?: ChatMessage[];
  initialFramework?: JournalFrameworkId;
  initialMood?: string;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  onEntrySaved,
  initialTranscript,
  initialFramework,
  initialMood,
}) => {
  const { user } = useAuth();

  const [framework, setFramework] = useState<JournalFrameworkId>(initialFramework || 'free_flow');
  const [currentMood, setCurrentMood] = useState<string>(initialMood || 'calm');
  const [messages, setMessages] = useState<ChatMessage[]>(initialTranscript || []);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingReply, setLoadingReply] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic Prompt suggestions
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);

  // Summary Modal State
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<JournalSummary | null>(null);

  // Font Size Accessibility State ('sm' | 'md' | 'lg')
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>(() => {
    return (localStorage.getItem('fuenzer_journal_font_size') as 'sm' | 'md' | 'lg') || 'md';
  });

  const handleFontSizeChange = (size: 'sm' | 'md' | 'lg') => {
    setFontSize(size);
    localStorage.setItem('fuenzer_journal_font_size', size);
  };

  // Dynamic text size classes based on font size setting
  const messageTextClass =
    fontSize === 'sm'
      ? 'text-xs leading-relaxed'
      : fontSize === 'lg'
      ? 'text-sm sm:text-base leading-relaxed font-normal'
      : 'text-xs sm:text-sm leading-relaxed';

  const textareaTextClass =
    fontSize === 'sm'
      ? 'text-xs'
      : fontSize === 'lg'
      ? 'text-sm sm:text-base'
      : 'text-xs sm:text-sm';

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedFrameworkObj = JOURNAL_FRAMEWORKS.find((f) => f.id === framework) || JOURNAL_FRAMEWORKS[0];

  // Initial starter message when switching frameworks or opening empty
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: `starter_${Date.now()}`,
          role: 'model',
          content: `Welcome to your **${selectedFrameworkObj.name}** session. ${selectedFrameworkObj.starterPrompt}`,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [framework]);

  // Load dynamic prompts on mount or framework change
  useEffect(() => {
    loadPrompts();
  }, [framework]);

  const loadPrompts = async () => {
    setLoadingPrompts(true);
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
    const prompts = await fetchDynamicPrompts(timeOfDay, framework);
    setSuggestedPrompts(prompts);
    setLoadingPrompts(false);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingReply]);

  // Autosave draft to Firestore and localStorage
  useEffect(() => {
    if (user?.uid && messages.length > 1) {
      const timeout = setTimeout(() => {
        saveDraftSession(user.uid, {
          framework,
          currentMood,
          messages,
        });
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [messages, framework, currentMood, user?.uid]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loadingReply) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setLoadingReply(true);

    try {
      const { reply } = await sendChatMessage(
        newMessages,
        framework,
        currentMood,
        'compassionate'
      );

      const modelMsg: ChatMessage = {
        id: `model_${Date.now()}`,
        role: 'model',
        content: reply,
        timestamp: Date.now(),
      };
      setMessages([...newMessages, modelMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err?.message || 'Failed to receive response from Gemini. Please try again.');
    } finally {
      setLoadingReply(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSummarizeSession = async () => {
    if (messages.length <= 1) {
      setErrorMessage('Please share a few thoughts before synthesizing your reflection summary.');
      return;
    }

    setSummarizing(true);
    setErrorMessage(null);

    try {
      const { summary } = await summarizeJournalSession(
        messages,
        framework,
        currentMood
      );
      setGeneratedSummary(summary);
      setSummaryModalOpen(true);
    } catch (err: any) {
      console.error('Summarize error:', err);
      setErrorMessage(err?.message || 'Failed to synthesize summary. Please retry.');
    } finally {
      setSummarizing(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to start a fresh reflection session?')) {
      setMessages([
        {
          id: `starter_${Date.now()}`,
          role: 'model',
          content: `Welcome to your **${selectedFrameworkObj.name}** session. ${selectedFrameworkObj.starterPrompt}`,
          timestamp: Date.now(),
        },
      ]);
      if (user?.uid) {
        clearDraftSession(user.uid);
      }
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalWords = messages.reduce((acc, msg) => {
    return acc + (msg.content.trim().split(/\s+/).filter(Boolean).length || 0);
  }, 0);

  const getFrameworkIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return Shield;
      case 'HeartHandshake': return HeartHandshake;
      case 'Brain': return Brain;
      case 'Compass': return Compass;
      case 'Feather': return Feather;
      default: return Sparkles;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-2.5 sm:px-6 py-4 sm:py-6 flex flex-col min-h-[calc(100vh-4rem)] text-[#2c2c26]">
      {/* Top Controls: Frameworks & Mood in Square Warm Box */}
      <div className="mb-3 space-y-2.5 bg-[#ffffff] border border-[#ecece0] p-3 sm:p-4 rounded-none shadow-xs">
        {/* Framework Selector Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#7d8461]">
              Journaling Framework
            </span>
            <span className="text-[10px] text-[#5c5c52] uppercase tracking-wider font-semibold">
              {selectedFrameworkObj.name}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2">
            {JOURNAL_FRAMEWORKS.map((fw) => {
              const Icon = getFrameworkIcon(fw.iconName);
              const isSelected = framework === fw.id;
              return (
                <button
                  key={fw.id}
                  onClick={() => {
                    if (fw.id !== framework) {
                      setFramework(fw.id);
                    }
                  }}
                  className={`p-2 sm:p-2.5 rounded-none text-left border transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#7d8461]/10 border-[#7d8461] shadow-xs'
                      : 'bg-[#fbfaf5] border-[#ecece0] text-[#5c5c52] hover:text-[#2c2c26] hover:bg-[#f4f4ea]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#7d8461]' : 'text-[#7d8461]/70'}`} />
                    <span className={`font-serif italic font-bold text-[11px] sm:text-xs truncate ${isSelected ? 'text-[#2c2c26]' : 'text-[#5c5c52]'}`}>
                      {fw.name.split(' ')[0]}
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-[#7d8461] font-medium line-clamp-1">{fw.tagline}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mood Selector Chips with SVG Icons & Square Corners */}
        <div className="pt-2 border-t border-[#ecece0] flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-[#5c5c52] whitespace-nowrap shrink-0">Feeling:</span>
          {MOOD_OPTIONS.map((mood) => {
            const isSelected = currentMood === mood.id;
            return (
              <button
                key={mood.id}
                onClick={() => setCurrentMood(mood.id)}
                className={`px-2.5 py-1 rounded-none text-[11px] font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#3a3a30] text-[#fbfaf5] shadow-xs font-semibold'
                    : 'bg-[#f4f4ea] border border-[#e8e8df] text-[#5c5c52] hover:bg-[#ecece0] hover:text-[#2c2c26]'
                }`}
              >
                <MoodIcon iconName={mood.iconName} className="w-3 h-3 shrink-0" />
                <span>{mood.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMessage && (
        <div className="mb-3 p-3 bg-[#c86d51]/10 border border-[#c86d51]/30 rounded-none text-[#96472d] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-[#96472d] hover:underline font-bold cursor-pointer uppercase"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Synthesis Framework Header Banner & Accessibility Controls - Square */}
      <div className="bg-[#7d8461]/5 border border-[#7d8461]/20 rounded-none p-3 sm:p-4 mb-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#7d8461] rounded-full animate-pulse"></div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#7d8461]">
              {selectedFrameworkObj.name}
            </span>
          </div>

          {/* Font Size Accessibility Controls */}
          <div className="flex items-center gap-1 bg-[#ffffff] border border-[#ecece0] p-0.5 rounded-none shadow-xs">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#5c5c52] px-1.5">
              Size:
            </span>
            <button
              onClick={() => handleFontSizeChange('sm')}
              className={`px-1.5 py-0.5 font-mono text-[10px] font-bold transition cursor-pointer ${
                fontSize === 'sm'
                  ? 'bg-[#7d8461] text-white shadow-xs'
                  : 'text-[#5c5c52] hover:text-[#2c2c26] hover:bg-[#f4f4ea]'
              }`}
              title="Compact font size"
            >
              A-
            </button>
            <button
              onClick={() => handleFontSizeChange('md')}
              className={`px-1.5 py-0.5 font-mono text-[10px] font-bold transition cursor-pointer ${
                fontSize === 'md'
                  ? 'bg-[#7d8461] text-white shadow-xs'
                  : 'text-[#5c5c52] hover:text-[#2c2c26] hover:bg-[#f4f4ea]'
              }`}
              title="Standard comfortable font size"
            >
              A
            </button>
            <button
              onClick={() => handleFontSizeChange('lg')}
              className={`px-1.5 py-0.5 font-mono text-[10px] font-bold transition cursor-pointer ${
                fontSize === 'lg'
                  ? 'bg-[#7d8461] text-white shadow-xs'
                  : 'text-[#5c5c52] hover:text-[#2c2c26] hover:bg-[#f4f4ea]'
              }`}
              title="Large / Accessible font size"
            >
              A+
            </button>
          </div>
        </div>
        <h2 className="text-sm sm:text-base font-serif italic font-bold text-[#2c2c26]">
          {selectedFrameworkObj.tagline}
        </h2>
        <p className="text-[11px] sm:text-xs text-[#5c5c52] leading-relaxed mt-0.5">
          {selectedFrameworkObj.description}
        </p>
      </div>

      {/* Main Conversation Stream - Flexible & Square */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pb-3 min-h-[220px]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isCopied = copiedId === msg.id;
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar / Icon - Square */}
              <div
                className={`w-6 h-6 rounded-none shrink-0 flex items-center justify-center text-[10px] font-bold shadow-xs ${
                  isUser
                    ? 'bg-[#3a3a30] text-[#fbfaf5]'
                    : 'bg-[#7d8461] text-white'
                }`}
              >
                {isUser ? (
                  user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'ME'
                ) : (
                  'G'
                )}
              </div>

              {/* Message Bubble - Square with Markdown support & Dynamic Font Size */}
              <div
                className={`group relative max-w-[90%] sm:max-w-[80%] p-3.5 sm:p-4 ${messageTextClass} shadow-xs rounded-none ${
                  isUser
                    ? 'bg-[#3a3a30] text-[#fbfaf5]'
                    : 'bg-white border border-[#ecece0] text-[#2c2c26]'
                }`}
              >
                {/* Markdown Rendered Content */}
                <MarkdownRenderer content={msg.content} isUser={isUser} />

                {/* Bubble Footer & Actions */}
                <div
                  className={`mt-2.5 pt-1.5 border-t flex items-center justify-between text-[9px] sm:text-[10px] ${
                    isUser ? 'border-[#4f4f42] text-[#d8d8cc]' : 'border-[#ecece0] text-[#7d8461]'
                  }`}
                >
                  <span className="font-mono opacity-80">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {/* Copy Button for both user and AI messages */}
                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.content)}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-none transition cursor-pointer font-medium ${
                      isUser
                        ? 'hover:bg-[#4f4f42] text-[#e8e8df]'
                        : 'hover:bg-[#f4f4ea] text-[#5c5c52] hover:text-[#2c2c26]'
                    }`}
                    title={isUser ? 'Copy your message' : 'Copy AI response'}
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

        {/* Gemini Typing Indicator - Square */}
        {loadingReply && (
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-none bg-[#7d8461] text-white flex items-center justify-center text-[10px] font-bold">
              G
            </div>
            <div className="bg-white border border-[#ecece0] rounded-none p-3 flex items-center gap-2 text-[#5c5c52] text-xs shadow-xs">
              <span className="flex h-1.5 w-1.5 rounded-none bg-[#7d8461] animate-pulse" />
              <span className="font-serif italic text-xs">Reflecting with you...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Thought Prompts Tray - Square */}
      {suggestedPrompts.length > 0 && (
        <div className="mb-2 py-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-[#7d8461] shrink-0 font-bold uppercase tracking-wider">
            <Lightbulb className="w-3 h-3" />
            <span className="hidden sm:inline">Inspire:</span>
          </div>

          {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 bg-[#f4f4ea] hover:bg-[#ecece0] border border-[#e8e8df] hover:border-[#7d8461]/40 rounded-none text-[11px] text-[#2c2c26] text-left shrink-0 max-w-[240px] sm:max-w-[320px] truncate transition cursor-pointer font-medium"
              title={prompt}
            >
              &ldquo;{prompt}&rdquo;
            </button>
          ))}

          <button
            onClick={loadPrompts}
            disabled={loadingPrompts}
            className="p-1 rounded-none bg-[#f4f4ea] border border-[#e8e8df] text-[#5c5c52] hover:text-[#2c2c26] hover:bg-[#ecece0] shrink-0 cursor-pointer transition"
            title="Refresh prompts"
          >
            <RefreshCw className={`w-3 h-3 ${loadingPrompts ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {/* Input Area and Session Action Bar - Square & Ergonomic Desktop Alignment */}
      <div className="bg-white border border-[#ecece0] rounded-none p-3 sm:p-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
          {/* Main Reflection Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Reflect further, explore what is on your mind, or deepen your realization..."
              className={`w-full bg-[#f4f4ea]/40 border border-[#ecece0] rounded-none p-2.5 sm:p-3 ${textareaTextClass} text-[#2c2c26] placeholder-[#5c5c52]/60 focus:outline-none focus:border-[#7d8461] resize-none leading-relaxed transition`}
            />
          </div>

          {/* Send Button - Neatly aligned & vertically centered on Desktop */}
          <div className="flex items-center sm:self-center shrink-0">
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || loadingReply}
              className="w-full sm:w-auto h-full sm:min-h-[58px] px-5 py-2.5 sm:py-0 bg-[#7d8461] hover:bg-[#6c7351] text-white rounded-none text-xs font-bold uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Send your reflection (Cmd+Enter / Ctrl+Enter)"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Bar: Stats, Clear, Conclude & Summarize */}
        <div className="mt-2.5 pt-2 border-t border-[#ecece0] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5c5c52]">
          <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
            <span className="font-medium">{messages.length} Turns</span>
            <span>•</span>
            <span className="font-medium">~{totalWords} Words</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-[10px] text-[#5c5c52]/70">
              Press <kbd className="px-1 py-0.2 bg-[#f4f4ea] rounded-none border border-[#ecece0] font-mono text-[9px]">Cmd+Enter</kbd> to send
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="p-1.5 text-[#5c5c52] hover:text-[#96472d] hover:bg-[#c86d51]/10 rounded-none transition cursor-pointer"
              title="Start fresh reflection session"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleSummarizeSession}
              disabled={summarizing || messages.length <= 1}
              className="px-4 py-2 bg-[#3a3a30] hover:bg-[#2c2c26] text-[#fbfaf5] rounded-none text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {summarizing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-[#7d8461]" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-3 h-3 text-[#ddb892]" />
                  <span>Conclude & Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Synthesis & Review Modal */}
      <SummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        summary={generatedSummary}
        transcript={messages}
        framework={framework}
        initialMood={currentMood}
        onSavedSuccessfully={(savedEntry) => {
          setSummaryModalOpen(false);
          onEntrySaved(savedEntry);
        }}
      />
    </div>
  );
};
