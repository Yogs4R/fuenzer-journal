import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Calendar,
  Sparkles,
  X,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Clock,
  LogIn,
  ListTodo,
  WifiOff,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  syncActionItemsToGoogleTasks,
  scheduleReflectionCalendarBlock,
  CalendarEventPayload,
} from '../lib/google-workspace';

interface WorkspaceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'tasks' | 'calendar';
  entryTitle: string;
  actionItems?: string[];
  executiveSummary?: string;
  closingAffirmation?: string;
}

export const WorkspaceSyncModal: React.FC<WorkspaceSyncModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'tasks',
  entryTitle,
  actionItems = [],
  executiveSummary = '',
  closingAffirmation = '',
}) => {
  const { user, isGuest, signInWithGoogle, getWorkspaceToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar'>(defaultTab);

  // Online status
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Tasks State
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [dueDateOption, setDueDateOption] = useState<'today' | 'tomorrow' | 'none' | 'custom'>('tomorrow');
  const [customDueDate, setCustomDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [isSyncingTasks, setIsSyncingTasks] = useState(false);
  const [taskSyncResult, setTaskSyncResult] = useState<{
    success: boolean;
    count: number;
    errors: string[];
  } | null>(null);

  // Calendar State
  const [calTitle, setCalTitle] = useState<string>(`🌿 Mindful Reflection: ${entryTitle || 'Daily Decompression'}`);
  const [calDate, setCalDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [calTime, setCalTime] = useState<string>('20:00'); // 8:00 PM default evening reflection
  const [calDuration, setCalDuration] = useState<number>(30); // 30 minutes
  const [calDescription, setCalDescription] = useState<string>(() => {
    let desc = `Mindful reflection and decompression block scheduled from Fuenzer Journal.\n\nContext: ${entryTitle}`;
    if (executiveSummary) {
      desc += `\n\nKey Takeaways:\n${executiveSummary}`;
    }
    if (closingAffirmation) {
      desc += `\n\nAffirmation: "${closingAffirmation}"`;
    }
    return desc;
  });
  const [isSchedulingCal, setIsSchedulingCal] = useState(false);
  const [calScheduleResult, setCalScheduleResult] = useState<{
    success: boolean;
    eventLink: string;
    startTime: string;
    endTime: string;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync selected action items whenever modal opens or action items change
  useEffect(() => {
    if (actionItems && actionItems.length > 0) {
      setSelectedItems(actionItems.filter(Boolean));
    } else {
      setSelectedItems([]);
    }
    setTaskSyncResult(null);
    setCalScheduleResult(null);
    setErrorMessage(null);
  }, [actionItems, isOpen]);

  if (!isOpen) return null;

  const toggleItemSelection = (item: string) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter((i) => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === actionItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...actionItems]);
    }
  };

  // Google Tasks Sync Handler
  const handleSyncToGoogleTasks = async () => {
    if (selectedItems.length === 0) return;
    setErrorMessage(null);
    setIsSyncingTasks(true);

    try {
      const accessToken = await getWorkspaceToken();
      let dueIso: string | undefined = undefined;

      if (dueDateOption === 'today') {
        const d = new Date();
        d.setHours(23, 59, 59, 999);
        dueIso = d.toISOString();
      } else if (dueDateOption === 'tomorrow') {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(23, 59, 59, 999);
        dueIso = d.toISOString();
      } else if (dueDateOption === 'custom' && customDueDate) {
        dueIso = new Date(`${customDueDate}T23:59:59.999Z`).toISOString();
      }

      const res = await syncActionItemsToGoogleTasks(
        accessToken,
        entryTitle || 'Reflection Entry',
        selectedItems,
        dueIso
      );

      setTaskSyncResult({
        success: res.success,
        count: res.syncedCount,
        errors: res.errors,
      });
    } catch (err: any) {
      console.error('Google Tasks sync error:', err);
      setErrorMessage(err?.message || 'Failed to synchronize with Google Tasks. Please try again.');
    } finally {
      setIsSyncingTasks(false);
    }
  };

  // Google Calendar Schedule Handler
  const handleScheduleCalendarBlock = async () => {
    setErrorMessage(null);
    setIsSchedulingCal(true);

    try {
      const accessToken = await getWorkspaceToken();
      const startDateTime = new Date(`${calDate}T${calTime}:00`).toISOString();

      const payload: CalendarEventPayload = {
        title: calTitle.trim() || '🌿 Mindful Reflection Time',
        description: calDescription.trim(),
        startDateTime,
        durationMinutes: calDuration,
      };

      const result = await scheduleReflectionCalendarBlock(accessToken, payload);

      setCalScheduleResult({
        success: true,
        eventLink: result.htmlLink,
        startTime: result.startTime,
        endTime: result.endTime,
      });
    } catch (err: any) {
      console.error('Google Calendar scheduling error:', err);
      setErrorMessage(err?.message || 'Failed to schedule reflection event on Google Calendar.');
    } finally {
      setIsSchedulingCal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2c2c26]/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#23231c] border border-[#ecece0] dark:border-[#38382e] rounded-none max-w-2xl w-full p-4 sm:p-6 shadow-xl text-[#2c2c26] dark:text-[#f0efe6] relative my-4 animate-in fade-in duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#5c5c52] dark:text-[#9e9e90] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] p-1.5 rounded-none hover:bg-[#f4f4ea] dark:hover:bg-[#2c2c24] transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#ecece0] dark:border-[#38382e]">
          <div className="w-9 h-9 bg-[#7d8461] text-white rounded-none flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6]">
                Google Workspace Integration
              </h2>
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-[#7d8461]/10 text-[#4c5432] dark:text-[#9ca87a] border border-[#7d8461]/25 rounded-none font-bold">
                Cloud Sync
              </span>
            </div>
            <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] mt-0.5">
              Synchronize extracted tasks into Google Tasks and schedule mindful reflection blocks on Google Calendar.
            </p>
          </div>
        </div>

        {/* Offline Warning */}
        {!isOnline && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>
              <strong>You are currently offline.</strong> Action items and reflection drafts remain safely stored on your device. Google Workspace synchronization will be available once your connection is restored.
            </span>
          </div>
        )}

        {/* Guest Mode Notice */}
        {(!user || isGuest) && (
          <div className="mb-5 p-4 bg-[#f4f4ea]/60 dark:bg-[#1a1a16] border border-[#ecece0] dark:border-[#38382e] rounded-none">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-none bg-[#7d8461]/10 text-[#7d8461] dark:text-[#9ca87a] flex items-center justify-center shrink-0 mt-0.5">
                <LogIn className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2c2c26] dark:text-[#f0efe6]">
                  Google Account Required for Sync
                </h4>
                <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] mt-1 leading-relaxed">
                  Google Tasks and Calendar synchronization requires signing in with your Google account. Your journal reflections remain strictly private and isolated.
                </p>
                <button
                  onClick={signInWithGoogle}
                  className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#7d8461] hover:bg-[#6b7252] text-white text-xs font-bold rounded-none transition cursor-pointer shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign in with Google
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#ecece0] dark:border-[#38382e] mb-4">
          <button
            onClick={() => {
              setActiveTab('tasks');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-[#7d8461] text-[#7d8461] dark:text-[#9ca87a] bg-[#f4f4ea]/30 dark:bg-[#2c2c24]/30'
                : 'border-transparent text-[#5c5c52] dark:text-[#9e9e90] hover:text-[#2c2c26] dark:hover:text-[#f0efe6]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Google Tasks Sync</span>
            {actionItems.length > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-[#ecece0] dark:bg-[#38382e] rounded-none font-mono">
                {actionItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('calendar');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'calendar'
                ? 'border-[#7d8461] text-[#7d8461] dark:text-[#9ca87a] bg-[#f4f4ea]/30 dark:bg-[#2c2c24]/30'
                : 'border-transparent text-[#5c5c52] dark:text-[#9e9e90] hover:text-[#2c2c26] dark:hover:text-[#f0efe6]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Calendar Reflection</span>
          </button>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-[#c86d51]/10 dark:bg-[#c86d51]/20 border border-[#c86d51]/30 rounded-none text-[#96472d] dark:text-[#e07a5f] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: GOOGLE TASKS */}
        {activeTab === 'tasks' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {taskSyncResult ? (
              <div className="p-4 bg-[#7d8461]/10 dark:bg-[#7d8461]/20 border border-[#7d8461]/30 rounded-none text-center space-y-3">
                <div className="w-10 h-10 mx-auto rounded-none bg-[#7d8461] text-white flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6]">
                  {taskSyncResult.count} Action Items Synced to Google Tasks!
                </h3>
                <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] max-w-md mx-auto">
                  A dedicated <strong>"🌿 Fuenzer Journal"</strong> task list has been updated in your Google Tasks.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <a
                    href="https://tasks.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#7d8461] hover:bg-[#6b7252] text-white text-xs font-bold rounded-none transition"
                  >
                    <span>Open Google Tasks</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => setTaskSyncResult(null)}
                    className="px-3 py-1.5 bg-transparent border border-[#ecece0] dark:border-[#38382e] text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] text-xs font-bold rounded-none transition cursor-pointer"
                  >
                    Sync More
                  </button>
                </div>
              </div>
            ) : actionItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#5c5c52] dark:text-[#a8a89b] bg-[#f4f4ea]/40 dark:bg-[#1a1a16] border border-[#ecece0] dark:border-[#38382e]">
                <ListTodo className="w-6 h-6 mx-auto mb-2 text-[#7d8461]" />
                <p className="font-bold">No extracted action items in this reflection session yet.</p>
                <p className="mt-1">When the Socratic thought partner distills your entries, extracted to-dos will appear here.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#7d8461] dark:text-[#9ca87a] uppercase tracking-wider">
                    Select Items to Sync ({selectedItems.length}/{actionItems.length})
                  </span>
                  <button
                    onClick={handleSelectAll}
                    className="text-[11px] text-[#7d8461] dark:text-[#9ca87a] hover:underline font-medium cursor-pointer"
                  >
                    {selectedItems.length === actionItems.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="space-y-1.5 border border-[#ecece0] dark:border-[#38382e] p-2 bg-[#f4f4ea]/20 dark:bg-[#1a1a16] max-h-48 overflow-y-auto">
                  {actionItems.map((item, idx) => {
                    const isSelected = selectedItems.includes(item);
                    const cleanText = item.replace(/^\[[xX✓ ]\]\s*/, '');
                    return (
                      <label
                        key={idx}
                        onClick={() => toggleItemSelection(item)}
                        className={`flex items-start gap-2.5 p-2 rounded-none cursor-pointer text-xs transition select-none ${
                          isSelected
                            ? 'bg-white dark:bg-[#282820] text-[#2c2c26] dark:text-[#f0efe6] border border-[#7d8461]/30'
                            : 'text-[#5c5c52] dark:text-[#9e9e90] hover:bg-[#f4f4ea]/50 dark:hover:bg-[#22221c]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-0.5 text-[#7d8461] accent-[#7d8461] cursor-pointer"
                        />
                        <span className="flex-1 leading-snug">{cleanText}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Due Date Options */}
                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-[#7d8461] dark:text-[#9ca87a] uppercase tracking-wider mb-1.5">
                    Set Google Tasks Due Date
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'today', label: 'Today' },
                      { id: 'tomorrow', label: 'Tomorrow' },
                      { id: 'none', label: 'No Due Date' },
                      { id: 'custom', label: 'Custom Date' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDueDateOption(opt.id as any)}
                        className={`px-2.5 py-1.5 text-xs font-medium border rounded-none text-center transition cursor-pointer ${
                          dueDateOption === opt.id
                            ? 'border-[#7d8461] bg-[#7d8461]/10 text-[#4c5432] dark:text-[#9ca87a] font-bold'
                            : 'border-[#ecece0] dark:border-[#38382e] text-[#5c5c52] dark:text-[#9e9e90] hover:bg-[#f4f4ea] dark:hover:bg-[#2c2c24]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {dueDateOption === 'custom' && (
                    <div className="mt-2">
                      <input
                        type="date"
                        value={customDueDate}
                        onChange={(e) => setCustomDueDate(e.target.value)}
                        className="w-full bg-[#f4f4ea]/40 dark:bg-[#1a1a16] border border-[#ecece0] dark:border-[#38382e] px-3 py-1.5 text-xs text-[#2c2c26] dark:text-[#f0efe6] rounded-none focus:outline-none focus:border-[#7d8461]"
                      />
                    </div>
                  )}
                </div>

                {/* Explicit Action Button with User Confirmation */}
                <div className="pt-3 border-t border-[#ecece0] dark:border-[#38382e] flex items-center justify-between">
                  <p className="text-[11px] text-[#5c5c52] dark:text-[#a8a89b]">
                    Destination: <strong>Google Tasks</strong> &gt; <em>🌿 Fuenzer Journal</em>
                  </p>
                  <button
                    onClick={handleSyncToGoogleTasks}
                    disabled={isSyncingTasks || selectedItems.length === 0 || (!user && !isGuest) || !isOnline}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#7d8461] hover:bg-[#6b7252] disabled:opacity-50 text-white text-xs font-bold rounded-none transition cursor-pointer shadow-xs"
                  >
                    {isSyncingTasks ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Syncing to Google Tasks...</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Confirm Sync ({selectedItems.length}) to Tasks</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: GOOGLE CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {calScheduleResult ? (
              <div className="p-4 bg-[#7d8461]/10 dark:bg-[#7d8461]/20 border border-[#7d8461]/30 rounded-none text-center space-y-3">
                <div className="w-10 h-10 mx-auto rounded-none bg-[#7d8461] text-white flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6]">
                  Mindful Reflection Block Scheduled!
                </h3>
                <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] max-w-md mx-auto">
                  Reserved on your primary Google Calendar: <strong>{calDate}</strong> from <strong>{calScheduleResult.startTime}</strong> to <strong>{calScheduleResult.endTime}</strong>.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <a
                    href={calScheduleResult.eventLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#7d8461] hover:bg-[#6b7252] text-white text-xs font-bold rounded-none transition"
                  >
                    <span>View Event in Calendar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => setCalScheduleResult(null)}
                    className="px-3 py-1.5 bg-transparent border border-[#ecece0] dark:border-[#38382e] text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] text-xs font-bold rounded-none transition cursor-pointer"
                  >
                    Schedule Another
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Event Summary Title */}
                <div>
                  <label className="block text-[10px] font-bold text-[#7d8461] dark:text-[#9ca87a] uppercase tracking-wider mb-1">
                    Calendar Event Title
                  </label>
                  <input
                    type="text"
                    value={calTitle}
                    onChange={(e) => setCalTitle(e.target.value)}
                    className="w-full bg-[#f4f4ea]/40 dark:bg-[#1a1a16] border border-[#ecece0] dark:border-[#38382e] px-3 py-2 text-xs font-bold text-[#2c2c26] dark:text-[#f0efe6] rounded-none focus:outline-none focus:border-[#7d8461]"
                    placeholder="e.g. 🌿 Mindful Reflection: Daily Decompression"
                  />
                </div>

                {/* Date & Time Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#7d8461] dark:text-[#9ca87a] uppercase tracking-wider mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={calDate}
                      onChange={(e) => setCalDate(e.target.value)}
                      className="w-full bg-[#f4f4ea]/40 dark:bg-[#1a1a16] border border-[#ecece0] dark:border-[#38382e] px-2.5 py-1.5 text-xs text-[#2c2c26] dark:text-[#f0efe6] rounded-none focus:outline-none focus:border-[#7d8461]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#7d8461] dark:text-[#9ca87a] uppercase tracking-wider mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={calTime}
                      onChange={(e) => setCalTime(e.target.value)}
                      className="w-full bg-[#f4f4ea]/40 dark:bg-[#1a1a16] border border-[#ecece0] dark:border-[#38382e] px-2.5 py-1.5 text-xs text-[#2c2c26] dark:text-[#f0efe6] rounded-none focus:outline-none focus:border-[#7d8461]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#7d8461] dark:text-[#9ca87a] uppercase tracking-wider mb-1">
                      Duration
                    </label>
                    <select
                      value={calDuration}
                      onChange={(e) => setCalDuration(Number(e.target.value))}
                      className="w-full bg-[#f4f4ea]/40 dark:bg-[#1a1a16] border border-[#ecece0] dark:border-[#38382e] px-2.5 py-1.5 text-xs text-[#2c2c26] dark:text-[#f0efe6] rounded-none focus:outline-none focus:border-[#7d8461]"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes (1 Hour)</option>
                    </select>
                  </div>
                </div>

                {/* Event Description */}
                <div>
                  <label className="block text-[10px] font-bold text-[#7d8461] dark:text-[#9ca87a] uppercase tracking-wider mb-1">
                    Event Description / Reflection Prompts
                  </label>
                  <textarea
                    rows={3}
                    value={calDescription}
                    onChange={(e) => setCalDescription(e.target.value)}
                    className="w-full bg-[#f4f4ea]/40 dark:bg-[#1a1a16] border border-[#ecece0] dark:border-[#38382e] px-3 py-2 text-xs text-[#2c2c26] dark:text-[#f0efe6] rounded-none focus:outline-none focus:border-[#7d8461] leading-relaxed resize-none font-mono"
                  />
                </div>

                {/* Explicit Action Button with User Confirmation */}
                <div className="pt-3 border-t border-[#ecece0] dark:border-[#38382e] flex items-center justify-between">
                  <p className="text-[11px] text-[#5c5c52] dark:text-[#a8a89b]">
                    Includes popup reminders (10m &amp; 60m prior).
                  </p>
                  <button
                    onClick={handleScheduleCalendarBlock}
                    disabled={isSchedulingCal || (!user && !isGuest) || !isOnline}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#7d8461] hover:bg-[#6b7252] disabled:opacity-50 text-white text-xs font-bold rounded-none transition cursor-pointer shadow-xs"
                  >
                    {isSchedulingCal ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Scheduling Event...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Confirm &amp; Schedule on Calendar</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
