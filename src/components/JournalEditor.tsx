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
  Mic,
  MicOff,
  ImagePlus,
  X,
  Maximize2,
} from 'lucide-react';
import type {
  ChatMessage,
  ChatImageAttachment,
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

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB per image

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
  const [attachedImages, setAttachedImages] = useState<ChatImageAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingReply, setLoadingReply] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Speech-to-Text State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Image Preview Modal
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

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
      ? 'text-[13px] leading-relaxed'
      : fontSize === 'lg'
      ? 'text-[17px] sm:text-[18px] leading-relaxed font-normal'
      : 'text-[14px] sm:text-[15px] leading-relaxed';

  const textareaTextClass =
    fontSize === 'sm'
      ? 'text-[13px]'
      : fontSize === 'lg'
      ? 'text-[16px] sm:text-[17px]'
      : 'text-[14px] sm:text-[15px]';

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore error on unmount
        }
      }
    };
  }, []);

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

  // Speech-to-Text Handler
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        'Speech recognition is not supported in this browser. Please try Google Chrome or Safari.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcriptChunk = event.results[i][0].transcript;
            setInputMessage((prev) =>
              prev ? `${prev.trim()} ${transcriptChunk.trim()}` : transcriptChunk.trim()
            );
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage(
            'Microphone access was denied. Please allow microphone permissions in your browser.'
          );
        } else if (event.error !== 'no-speech') {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Speech recognition initiation error:', err);
      setErrorMessage('Could not activate speech recognition.');
      setIsListening(false);
    }
  };

  // Process incoming image files with limits (< 5MB & max 5 images)
  const processImageFiles = (files: File[]) => {
    if (files.length === 0) return;

    if (attachedImages.length + files.length > MAX_IMAGES) {
      setErrorMessage(`You can attach up to ${MAX_IMAGES} images per reflection.`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage(`"${file.name}" is not a valid image format.`);
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        setErrorMessage(`"${file.name}" is ${sizeMb} MB, which exceeds the 5 MB per image limit.`);
        return;
      }
      validFiles.push(file);
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setAttachedImages((prev) => {
          if (prev.length >= MAX_IMAGES) return prev;
          return [
            ...prev,
            {
              name: file.name,
              mimeType: file.type || 'image/jpeg',
              data: dataUrl,
              size: file.size,
            },
          ];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processImageFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachedImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    processImageFiles(files);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : inputMessage;
    const hasText = Boolean(textToSend.trim());
    const hasImages = attachedImages.length > 0;

    if ((!hasText && !hasImages) || loadingReply) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setErrorMessage(null);
    const currentImages = [...attachedImages];
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: Date.now(),
      images: currentImages.length > 0 ? currentImages : undefined,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setAttachedImages([]);
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
      setAttachedImages([]);
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
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col flex-1 min-w-0">
      {/* Top Header & Framework Navigation - Square */}
      <div className="bg-white border border-[#ecece0] rounded-none p-3 sm:p-4 mb-3 sm:mb-4 shadow-xs w-full min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-[#7d8461] font-bold block mb-0.5">
              Reflective Workspace
            </span>
            <h1 className="text-lg sm:text-xl font-serif italic font-bold text-[#2c2c26] truncate">
              Reflection Studio
            </h1>
          </div>

          {/* Quick Framework Selector Pills - Square */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none w-full md:w-auto min-w-0">
            {JOURNAL_FRAMEWORKS.map((fw) => {
              const IconComp = getFrameworkIcon(fw.iconName);
              const isActive = framework === fw.id;
              return (
                <button
                  key={fw.id}
                  onClick={() => setFramework(fw.id)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-none text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#7d8461] text-white shadow-xs'
                      : 'bg-[#f4f4ea] hover:bg-[#ecece0] text-[#5c5c52] hover:text-[#2c2c26] border border-[#e8e8df]'
                  }`}
                  title={fw.tagline}
                >
                  <IconComp className="w-3.5 h-3.5 shrink-0" />
                  <span>{fw.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mood Selector Chips with SVG Icons & Square Corners */}
        <div className="pt-2.5 border-t border-[#ecece0] flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none w-full min-w-0">
          <span className="text-[11px] font-semibold text-[#5c5c52] whitespace-nowrap shrink-0">Feeling:</span>
          {MOOD_OPTIONS.map((mood) => {
            const isSelected = currentMood === mood.id;
            return (
              <button
                key={mood.id}
                onClick={() => setCurrentMood(mood.id)}
                className={`px-2.5 py-1 rounded-none text-[11px] font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
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
        <div className="mb-3 sm:mb-4 p-3 bg-[#c86d51]/10 border border-[#c86d51]/30 rounded-none text-[#96472d] text-xs flex items-center justify-between w-full min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-[#96472d] hover:underline font-bold cursor-pointer uppercase shrink-0 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Synthesis Framework Header Banner & Accessibility Controls - Square */}
      <div className="bg-[#7d8461]/5 border border-[#7d8461]/20 rounded-none p-3 sm:p-4 mb-3 sm:mb-4 w-full min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-1.5 h-1.5 bg-[#7d8461] rounded-full animate-pulse shrink-0"></div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#7d8461] truncate">
              {selectedFrameworkObj.name}
            </span>
          </div>

          {/* Font Size Accessibility Controls */}
          <div className="flex items-center gap-1.5 bg-[#ffffff] border border-[#ecece0] px-2 py-1 rounded-none shadow-xs shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c5c52] flex items-center gap-1">
              Text:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleFontSizeChange('sm')}
                className={`px-2 py-0.5 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 border ${
                  fontSize === 'sm'
                    ? 'bg-[#7d8461] border-[#7d8461] text-white shadow-xs'
                    : 'bg-[#fbfaf5] border-[#ecece0] text-[#5c5c52] hover:text-[#2c2c26] hover:bg-[#f4f4ea]'
                }`}
                title="Compact size (13px)"
              >
                <span>A-</span>
                <span className="text-[9px] font-normal opacity-90">Sm</span>
              </button>
              <button
                type="button"
                onClick={() => handleFontSizeChange('md')}
                className={`px-2 py-0.5 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 border ${
                  fontSize === 'md'
                    ? 'bg-[#7d8461] border-[#7d8461] text-white shadow-xs'
                    : 'bg-[#fbfaf5] border-[#ecece0] text-[#5c5c52] hover:text-[#2c2c26] hover:bg-[#f4f4ea]'
                }`}
                title="Standard size (15px)"
              >
                <span>A</span>
                <span className="text-[9px] font-normal opacity-90">Md</span>
              </button>
              <button
                type="button"
                onClick={() => handleFontSizeChange('lg')}
                className={`px-2 py-0.5 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 border ${
                  fontSize === 'lg'
                    ? 'bg-[#7d8461] border-[#7d8461] text-white shadow-xs'
                    : 'bg-[#fbfaf5] border-[#ecece0] text-[#5c5c52] hover:text-[#2c2c26] hover:bg-[#f4f4ea]'
                }`}
                title="Large / Accessible size (18px)"
              >
                <span>A+</span>
                <span className="text-[9px] font-normal opacity-90">Lg</span>
              </button>
            </div>
            <span className="text-[9px] font-mono font-bold uppercase text-[#7d8461] bg-[#7d8461]/10 px-1 py-0.5 border border-[#7d8461]/20 hidden sm:inline">
              {fontSize === 'sm' ? '13px' : fontSize === 'lg' ? '18px' : '15px'}
            </span>
          </div>
        </div>
        <h2 className="text-sm sm:text-base font-serif italic font-bold text-[#2c2c26]">
          {selectedFrameworkObj.tagline}
        </h2>
        <p className="text-[11px] sm:text-xs text-[#5c5c52] leading-relaxed mt-0.5">
          {selectedFrameworkObj.description}
        </p>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pb-3 min-h-[220px] max-h-[55vh] w-full min-w-0">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isCopied = copiedId === msg.id;
          const hasImages = Array.isArray(msg.images) && msg.images.length > 0;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 sm:gap-2.5 w-full min-w-0 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar / Icon */}
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-none shrink-0 flex items-center justify-center text-[10px] sm:text-[11px] font-bold shadow-xs ${
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

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[88%] sm:max-w-[80%] p-3.5 sm:p-4 ${messageTextClass} shadow-xs rounded-none break-words min-w-0 ${
                  isUser
                    ? 'bg-[#3a3a30] text-[#fbfaf5]'
                    : 'bg-white border border-[#ecece0] text-[#2c2c26]'
                }`}
              >
                {/* Render Attached Images inside user message bubble */}
                {hasImages && (
                  <div className="mb-2.5 flex flex-wrap gap-2">
                    {msg.images!.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group/img cursor-pointer border border-[#ecece0]/40 overflow-hidden bg-black/10 max-w-[120px] sm:max-w-[140px] max-h-[120px] sm:max-h-[140px]"
                        onClick={() => setPreviewImageUrl(img.data)}
                        title={`View ${img.name} (${(img.size / 1024).toFixed(0)} KB)`}
                      >
                        <img
                          src={img.data}
                          alt={img.name}
                          className="w-full h-20 sm:h-24 object-cover hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] gap-1">
                          <Maximize2 className="w-3 h-3" />
                          <span>View</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Markdown Rendered Content */}
                {msg.content && (
                  <div className="break-words min-w-0 overflow-hidden">
                    <MarkdownRenderer content={msg.content} isUser={isUser} fontSize={fontSize} />
                  </div>
                )}

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

                  {/* Copy Button */}
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

        {/* Gemini Typing Indicator */}
        {loadingReply && (
          <div className="flex items-start gap-2.5 w-full min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-none bg-[#7d8461] text-white flex items-center justify-center text-[10px] sm:text-[11px] font-bold shrink-0">
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

      {/* Suggested Thought Prompts Tray */}
      {suggestedPrompts.length > 0 && (
        <div className="mb-2 py-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full min-w-0">
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-[#7d8461] shrink-0 font-bold uppercase tracking-wider">
            <Lightbulb className="w-3 h-3" />
            <span className="hidden sm:inline">Inspire:</span>
          </div>

          {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 bg-[#f4f4ea] hover:bg-[#ecece0] border border-[#e8e8df] hover:border-[#7d8461]/40 rounded-none text-[11px] text-[#2c2c26] text-left shrink-0 max-w-[200px] sm:max-w-[300px] truncate transition cursor-pointer font-medium"
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
            aria-label="Refresh reflection prompts"
          >
            <RefreshCw className={`w-3 h-3 ${loadingPrompts ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {/* Input Area and Session Action Bar */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-white border rounded-none p-2.5 sm:p-3.5 shadow-xs transition-colors w-full min-w-0 ${
          isDragging ? 'border-[#7d8461] bg-[#7d8461]/5' : 'border-[#ecece0]'
        }`}
      >
        {/* Attached Images Preview Strip */}
        {attachedImages.length > 0 && (
          <div className="mb-2 pb-2 border-b border-[#ecece0] flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7d8461]">
              Attached ({attachedImages.length}/{MAX_IMAGES}):
            </span>
            {attachedImages.map((img, idx) => (
              <div
                key={idx}
                className="relative group flex items-center gap-1.5 bg-[#f4f4ea] border border-[#e8e8df] px-2 py-1 text-xs"
              >
                <img src={img.data} alt={img.name} className="w-5 h-5 object-cover" />
                <span className="text-[10px] font-medium text-[#2c2c26] max-w-[90px] sm:max-w-[140px] truncate">
                  {img.name}
                </span>
                <span className="text-[9px] text-[#8c8c80]">
                  ({(img.size / 1024).toFixed(0)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachedImage(idx)}
                  className="text-[#8c8c80] hover:text-[#c86d51] p-0.5 transition cursor-pointer"
                  title="Remove image"
                  aria-label="Remove attached image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full min-w-0">
          {/* Main Reflection Textarea */}
          <div className="flex-1 relative min-w-0 w-full">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? 'Listening... speak your reflections naturally into the microphone.'
                  : 'Reflect freely, attach photos (up to 5 images, <5MB), or dictate...'
              }
              className={`w-full bg-[#f4f4ea]/40 border rounded-none p-2.5 sm:p-3 ${textareaTextClass} text-[#2c2c26] placeholder-[#5c5c52]/60 focus:outline-none focus:border-[#7d8461] resize-none leading-relaxed transition min-w-0 ${
                isListening ? 'border-[#c86d51] bg-[#c86d51]/5' : 'border-[#ecece0]'
              }`}
            />
          </div>

          {/* Action Toolbar: Only Icons for Voice & Image Upload, + Send Button */}
          <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Speech to Text Toggle Button (Icon Only) */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`h-10 sm:h-[58px] w-10 sm:w-12 border rounded-none text-xs font-bold transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-[#c86d51] border-[#c86d51] text-white animate-pulse shadow-xs'
                    : 'bg-[#f4f4ea] border-[#ecece0] text-[#5c5c52] hover:text-[#2c2c26] hover:bg-[#ecece0]'
                }`}
                title={isListening ? 'Stop listening (Voice dictation active)' : 'Dictate reflection (Speech-to-Text)'}
                aria-label={isListening ? 'Stop speech recognition' : 'Start speech recognition'}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4 text-white" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              {/* Image Upload Button (Icon Only) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={attachedImages.length >= MAX_IMAGES}
                className={`relative h-10 sm:h-[58px] w-10 sm:w-12 border rounded-none text-xs font-bold transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                  attachedImages.length > 0
                    ? 'bg-[#7d8461]/15 border-[#7d8461]/40 text-[#4c5432]'
                    : 'bg-[#f4f4ea] border-[#ecece0] text-[#5c5c52] hover:text-[#2c2c26] hover:bg-[#ecece0] disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
                title={`Attach photos/sketches (Limit ${MAX_IMAGES} images & <5MB each)`}
                aria-label="Upload image"
              >
                <ImagePlus className="w-4 h-4" />
                {attachedImages.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#7d8461] text-white text-[9px] font-mono font-bold w-4 h-4 flex items-center justify-center border border-white">
                    {attachedImages.length}
                  </span>
                )}
              </button>
            </div>

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={(!inputMessage.trim() && attachedImages.length === 0) || loadingReply}
              className="flex-1 sm:flex-initial h-10 sm:h-[58px] px-4 sm:px-6 bg-[#7d8461] hover:bg-[#6c7351] text-white rounded-none text-xs font-bold uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              title="Send your reflection (Cmd+Enter / Ctrl+Enter)"
              aria-label="Send reflection message"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Bar: Stats, Clear, Conclude & Summarize */}
        <div className="mt-2.5 pt-2 border-t border-[#ecece0] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5c5c52] w-full min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2.5 text-[11px] min-w-0 flex-wrap">
            <span className="font-medium">{messages.length} Turns</span>
            <span>•</span>
            <span className="font-medium">~{totalWords} Words</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline text-[10px] text-[#5c5c52]/70">
              Attach up to 5 images (&lt;5MB) • Dictate with Mic
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleClearChat}
              className="p-1.5 text-[#5c5c52] hover:text-[#96472d] hover:bg-[#c86d51]/10 rounded-none transition cursor-pointer"
              title="Start fresh reflection session"
              aria-label="Clear chat session"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleSummarizeSession}
              disabled={summarizing || messages.length <= 1}
              className="px-3 sm:px-4 py-1.5 bg-[#3a3a30] hover:bg-[#2c2c26] text-[#fbfaf5] rounded-none text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
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

      {/* Image Preview Lightbox Overlay Modal */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white p-2 border border-[#ecece0] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute -top-3 -right-3 w-7 h-7 bg-[#2c2c26] text-white rounded-full flex items-center justify-center hover:bg-black transition cursor-pointer shadow-md"
              title="Close preview"
              aria-label="Close image preview"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewImageUrl}
              alt="Preview"
              className="max-w-full max-h-[82vh] object-contain"
            />
          </div>
        </div>
      )}

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
