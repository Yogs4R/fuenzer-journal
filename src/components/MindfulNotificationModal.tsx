import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Bell,
  BellOff,
  Smartphone,
  CheckCircle2,
  X,
  Sparkles,
  Wifi,
  WifiOff,
  Clock,
  Send,
  AlertCircle,
  Download,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Calendar,
  CheckSquare,
  PenLine,
} from 'lucide-react';
import {
  getNotificationPermission,
  requestNotificationPermission,
  getStoredNotificationSettings,
  saveNotificationSettings,
  getStoredWorkspaceSettings,
  saveWorkspaceSettings,
  sendMindfulNotification,
  getPromptForCurrentTime,
  NotificationSettings,
  NotificationResult,
  WorkspaceIntegrationSettings,
} from '../lib/notifications';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { WorkspaceSyncModal } from './WorkspaceSyncModal';

interface MindfulNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MindfulNotificationModal: React.FC<MindfulNotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<NotificationSettings>(getStoredNotificationSettings);
  const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceIntegrationSettings>(
    getStoredWorkspaceSettings
  );
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [testResult, setTestResult] = useState<NotificationResult | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();
  const [installSuccess, setInstallSuccess] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [guidePlatform, setGuidePlatform] = useState<'desktop' | 'ios' | 'android'>('desktop');
  const [workspaceSyncOpen, setWorkspaceSyncOpen] = useState(false);
  const [workspaceDefaultTab, setWorkspaceDefaultTab] = useState<'tasks' | 'calendar'>('tasks');

  useEffect(() => {
    if (isOpen) {
      setSettings(getStoredNotificationSettings());
      setWorkspaceSettings(getStoredWorkspaceSettings());
      setPermission(getNotificationPermission());
      setTestResult(null);
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  const handleToggleNotifications = async () => {
    if (!settings.enabled) {
      const currentPerm = getNotificationPermission();
      if (currentPerm !== 'granted') {
        const result = await requestNotificationPermission();
        setPermission(result);
        if (result !== 'granted') {
          return;
        }
      }
      const updated: NotificationSettings = { ...settings, enabled: true };
      setSettings(updated);
      saveNotificationSettings(updated);
    } else {
      const updated: NotificationSettings = { ...settings, enabled: false };
      setSettings(updated);
      saveNotificationSettings(updated);
    }
  };

  const handleToggleTasks = () => {
    const updated: WorkspaceIntegrationSettings = {
      ...workspaceSettings,
      tasksEnabled: !workspaceSettings.tasksEnabled,
    };
    setWorkspaceSettings(updated);
    saveWorkspaceSettings(updated);
  };

  const handleToggleCalendar = () => {
    const updated: WorkspaceIntegrationSettings = {
      ...workspaceSettings,
      calendarEnabled: !workspaceSettings.calendarEnabled,
    };
    setWorkspaceSettings(updated);
    saveWorkspaceSettings(updated);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    const updated: NotificationSettings = { ...settings, reminderTime: newTime };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleQuickPreset = (presetTime: string, type: 'morning' | 'evening') => {
    const updated: NotificationSettings = {
      ...settings,
      reminderTime: presetTime,
      reminderType: type,
    };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleSendTest = async () => {
    const prompt = getPromptForCurrentTime();
    const result = await sendMindfulNotification(prompt.title, prompt.body);
    setTestResult(result);
    setPermission(result.permission);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await promptInstall();
      if (res === 'accepted') {
        setInstallSuccess(true);
        return;
      }
    }
    setShowInstallGuide(true);
  };

  const handleStartWritingWithPrompt = () => {
    onClose();
    navigate('/app');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#ffffff] dark:bg-[#1f1f1a] border border-[#ecece0] dark:border-[#35352c] shadow-2xl p-4 sm:p-6 relative text-[#2c2c26] dark:text-[#f0efe6] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title & Close Button */}
        <div className="flex items-start justify-between gap-2.5 mb-4 sm:mb-5 border-b border-[#ecece0] dark:border-[#2e2e26] pb-3 sm:pb-4 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#7d8461]/15 dark:bg-[#8e966f]/20 flex items-center justify-center text-[#7d8461] dark:text-[#9ca87a] shrink-0">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-serif italic font-bold leading-tight truncate">
                Settings &amp; Integrations
              </h2>
              <p className="text-[11px] sm:text-xs text-[#5c5c52] dark:text-[#a8a89b] leading-tight truncate">
                Google Workspace, mindful reminders &amp; offline PWA
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-1 -mt-1 text-[#8c8c7a] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] transition cursor-pointer shrink-0 bg-[#f4f4ea] dark:bg-[#25251f] hover:bg-[#ecece0] dark:hover:bg-[#303028] border border-[#e8e8df] dark:border-[#35352c] min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Close Settings"
            aria-label="Close Settings"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="space-y-4 sm:space-y-5 text-xs overflow-y-auto pr-0.5 flex-1">
          {/* Google Workspace Integrations Section */}
          <div className="p-3 sm:p-4 bg-[#fbfaf5] dark:bg-[#25251f] border border-[#ecece0] dark:border-[#35352c] space-y-3">
            <div className="flex items-center justify-between border-b border-[#ecece0] dark:border-[#35352c] pb-2">
              <span className="text-[11px] sm:text-xs font-bold font-serif uppercase tracking-wider text-[#4c5432] dark:text-[#9ca87a]">
                Google Workspace Integrations
              </span>
              <span className="text-[10px] text-[#7d8461] dark:text-[#9ca87a] font-mono font-medium">
                OAuth 2.0
              </span>
            </div>

            {/* Google Tasks Sync Toggle */}
            <div className="p-2.5 sm:p-3 bg-white dark:bg-[#1a1a16] border border-[#e2e2d5] dark:border-[#35352c] space-y-2">
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2 sm:gap-2.5 min-w-0 flex-1">
                  <div className="p-1.5 bg-[#7d8461]/15 text-[#555c3c] dark:text-[#9ca87a] mt-0.5 shrink-0">
                    <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-[#2c2c26] dark:text-[#f0efe6]">
                        Google Tasks
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 uppercase ${
                          workspaceSettings.tasksEnabled
                            ? 'bg-[#7d8461]/15 text-[#555c3c] dark:text-[#9ca87a]'
                            : 'bg-[#d8d8cc]/30 text-[#8c8c7a]'
                        }`}
                      >
                        {workspaceSettings.tasksEnabled ? 'Active' : 'Off'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5c5c52] dark:text-[#a8a89b] mt-0.5 leading-relaxed">
                      Export actionable next steps from reflections directly to your Google Tasks lists.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleTasks}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none self-start mt-0.5 ${
                    workspaceSettings.tasksEnabled
                      ? 'bg-[#7d8461] dark:bg-[#8e966f]'
                      : 'bg-[#d8d8cc] dark:bg-[#424236]'
                  }`}
                  role="switch"
                  aria-checked={workspaceSettings.tasksEnabled}
                  title={workspaceSettings.tasksEnabled ? 'Disable Google Tasks' : 'Enable Google Tasks'}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      workspaceSettings.tasksEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {workspaceSettings.tasksEnabled && (
                <div className="pt-2 border-t border-[#ecece0] dark:border-[#2e2e26] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[10px] text-[#7d8461] dark:text-[#9ca87a]">
                    ✓ Google Tasks sync ready
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setWorkspaceDefaultTab('tasks');
                      setWorkspaceSyncOpen(true);
                    }}
                    className="w-full sm:w-auto px-2.5 py-1.5 bg-[#f4f4ea] dark:bg-[#282820] hover:bg-[#ecece0] dark:hover:bg-[#32322a] border border-[#7d8461]/40 text-[#2c2c26] dark:text-[#f0efe6] text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <CheckSquare className="w-3 h-3 text-[#7d8461] dark:text-[#9ca87a]" />
                    <span>Open Tasks Sync Tool</span>
                  </button>
                </div>
              )}
            </div>

            {/* Google Calendar Schedule Toggle */}
            <div className="p-2.5 sm:p-3 bg-white dark:bg-[#1a1a16] border border-[#e2e2d5] dark:border-[#35352c] space-y-2">
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2 sm:gap-2.5 min-w-0 flex-1">
                  <div className="p-1.5 bg-[#7d8461]/15 text-[#555c3c] dark:text-[#9ca87a] mt-0.5 shrink-0">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-[#2c2c26] dark:text-[#f0efe6]">
                        Google Calendar
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 uppercase ${
                          workspaceSettings.calendarEnabled
                            ? 'bg-[#7d8461]/15 text-[#555c3c] dark:text-[#9ca87a]'
                            : 'bg-[#d8d8cc]/30 text-[#8c8c7a]'
                        }`}
                      >
                        {workspaceSettings.calendarEnabled ? 'Active' : 'Off'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5c5c52] dark:text-[#a8a89b] mt-0.5 leading-relaxed">
                      Schedule protected 15–30 min deep focus journaling blocks on your calendar.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleCalendar}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none self-start mt-0.5 ${
                    workspaceSettings.calendarEnabled
                      ? 'bg-[#7d8461] dark:bg-[#8e966f]'
                      : 'bg-[#d8d8cc] dark:bg-[#424236]'
                  }`}
                  role="switch"
                  aria-checked={workspaceSettings.calendarEnabled}
                  title={
                    workspaceSettings.calendarEnabled
                      ? 'Disable Google Calendar'
                      : 'Enable Google Calendar'
                  }
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      workspaceSettings.calendarEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {workspaceSettings.calendarEnabled && (
                <div className="pt-2 border-t border-[#ecece0] dark:border-[#2e2e26] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[10px] text-[#7d8461] dark:text-[#9ca87a]">
                    ✓ Calendar scheduling ready
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setWorkspaceDefaultTab('calendar');
                      setWorkspaceSyncOpen(true);
                    }}
                    className="w-full sm:w-auto px-2.5 py-1.5 bg-[#f4f4ea] dark:bg-[#282820] hover:bg-[#ecece0] dark:hover:bg-[#32322a] border border-[#7d8461]/40 text-[#2c2c26] dark:text-[#f0efe6] text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <Calendar className="w-3 h-3 text-[#7d8461] dark:text-[#9ca87a]" />
                    <span>Schedule Focus Block</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Daily Mindful Notifications Toggle */}
          <div className="p-3 sm:p-4 bg-[#fbfaf5] dark:bg-[#25251f] border border-[#ecece0] dark:border-[#35352c] space-y-3">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {settings.enabled ? (
                  <Bell className="w-4 h-4 text-[#7d8461] dark:text-[#9ca87a] shrink-0" />
                ) : (
                  <BellOff className="w-4 h-4 text-[#8c8c7a] shrink-0" />
                )}
                <span className="font-semibold text-xs sm:text-sm text-[#2c2c26] dark:text-[#f0efe6]">
                  Daily Mindful Reminder
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggleNotifications}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.enabled ? 'bg-[#7d8461] dark:bg-[#8e966f]' : 'bg-[#d8d8cc] dark:bg-[#424236]'
                }`}
                role="switch"
                aria-checked={settings.enabled}
                title={settings.enabled ? 'Disable Reminders' : 'Enable Reminders'}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {permission === 'denied' && (
              <div className="p-2.5 bg-[#fbf2ef] dark:bg-[#342420] border border-[#f0cfc5] dark:border-[#52332a] text-[#a14022] dark:text-[#f29e84] text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Browser notifications are blocked in your site settings. Click the lock icon in your address bar to allow notifications.
                </p>
              </div>
            )}

            {/* Reminder Time Picker & Presets */}
            {settings.enabled && (
              <div className="space-y-2.5 pt-2 border-t border-[#ecece0] dark:border-[#35352c] animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="flex items-center gap-1.5 text-[#5c5c52] dark:text-[#a8a89b] font-medium text-[11px] sm:text-xs">
                    <Clock className="w-3.5 h-3.5 text-[#7d8461]" />
                    <span>Reminder Time:</span>
                  </label>
                  <input
                    type="time"
                    value={settings.reminderTime}
                    onChange={handleTimeChange}
                    className="px-2.5 py-1 bg-white dark:bg-[#1a1a16] border border-[#d8d8cc] dark:border-[#424236] text-xs font-mono font-bold focus:outline-none focus:border-[#7d8461] w-full sm:w-auto"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-[#8c8c7a] w-full sm:w-auto">Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('08:30', 'morning')}
                    className={`flex-1 sm:flex-none px-2.5 py-1 border text-[11px] font-medium transition cursor-pointer text-center ${
                      settings.reminderTime === '08:30'
                        ? 'bg-[#7d8461] text-white border-[#7d8461]'
                        : 'bg-white dark:bg-[#1a1a16] border-[#d8d8cc] dark:border-[#424236] text-[#5c5c52] dark:text-[#a8a89b]'
                    }`}
                  >
                    🌅 Morning (08:30)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('20:00', 'evening')}
                    className={`flex-1 sm:flex-none px-2.5 py-1 border text-[11px] font-medium transition cursor-pointer text-center ${
                      settings.reminderTime === '20:00'
                        ? 'bg-[#7d8461] text-white border-[#7d8461]'
                        : 'bg-white dark:bg-[#1a1a16] border-[#d8d8cc] dark:border-[#424236] text-[#5c5c52] dark:text-[#a8a89b]'
                    }`}
                  >
                    🌙 Evening (20:00)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Test Mindful Prompt Section */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleSendTest}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-[#7d8461] hover:bg-[#6c7351] dark:bg-[#8e966f] dark:hover:bg-[#7d8461] text-white font-semibold text-xs transition cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Mindful Prompt</span>
              </button>

              <span className="text-[10px] sm:text-[11px] text-[#8c8c7a] text-center sm:text-right">
                Dispatches prompt for current time
              </span>
            </div>

            {/* Interactive Dispatched Prompt Preview Card */}
            {testResult && (
              <div className="p-3 sm:p-3.5 bg-[#f4f4ea] dark:bg-[#25251f] border-2 border-[#7d8461] dark:border-[#8e966f] space-y-2 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-[#e2e2d5] dark:border-[#35352c] pb-1.5">
                  <div className="flex items-center gap-1.5 text-[#555c3c] dark:text-[#9ca87a] font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mindful Prompt Dispatched</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#7d8461]/15 text-[#555c3c] dark:text-[#9ca87a]">
                    {testResult.method === 'serviceworker' || testResult.method === 'notification'
                      ? 'System Notification'
                      : 'In-App Active'}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-xs text-[#2c2c26] dark:text-[#f0efe6] font-serif">
                    {testResult.title}
                  </p>
                  <p className="text-[11px] text-[#5c5c52] dark:text-[#d0d0c4] italic leading-relaxed">
                    &ldquo;{testResult.body}&rdquo;
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#e2e2d5] dark:border-[#35352c]">
                  <span className="text-[10px] text-[#7d8461] dark:text-[#9ca87a] font-medium text-center sm:text-left">
                    {testResult.method === 'serviceworker' || testResult.method === 'notification'
                      ? '✓ Delivered to browser notifications'
                      : '✓ Ready to write in journal'}
                  </span>

                  <button
                    type="button"
                    onClick={handleStartWritingWithPrompt}
                    className="w-full sm:w-auto px-3 py-1.5 bg-[#2c2c26] hover:bg-[#3a3a30] dark:bg-[#e0ded5] dark:hover:bg-[#f0efe6] text-[#fbfaf5] dark:text-[#181814] text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition"
                  >
                    <PenLine className="w-3 h-3" />
                    <span>Reflect With This Prompt</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PWA Standalone Status & Install Card */}
          <div className="p-3 sm:p-4 bg-[#fbfaf5] dark:bg-[#25251f] border border-[#ecece0] dark:border-[#35352c] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#7d8461] dark:text-[#9ca87a] shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm text-[#2c2c26] dark:text-[#f0efe6]">
                    Standalone App (PWA)
                  </span>
                </div>
                <p className="text-[#5c5c52] dark:text-[#a8a89b] text-[11px] leading-relaxed">
                  Install Fuenzer Journal on your desktop dock or mobile home screen with offline caching.
                </p>
              </div>

              {isInstalled || installSuccess ? (
                <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-[#7d8461]/15 dark:bg-[#8e966f]/20 text-[#555c3c] dark:text-[#9ca87a] font-semibold text-[11px] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Installed</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-[#7d8461] hover:bg-[#6c7351] dark:bg-[#8e966f] dark:hover:bg-[#7d8461] text-white font-semibold text-xs shadow-xs transition cursor-pointer shrink-0"
                  title="Install Fuenzer Journal as standalone app"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
              )}
            </div>

            {/* Offline & Service Worker Indicator */}
            <div className="pt-2 border-t border-[#ecece0] dark:border-[#35352c] flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-[#555c3c] dark:text-[#9ca87a]" />
                    <span className="text-[#555c3c] dark:text-[#9ca87a] font-medium">Online &amp; Synced</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-[#c86d51]" />
                    <span className="text-[#c86d51] font-medium">Offline (Service Worker Active)</span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowInstallGuide(!showInstallGuide)}
                className="text-[10px] font-semibold text-[#7d8461] dark:text-[#9ca87a] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                <span>{showInstallGuide ? 'Hide Steps' : 'Install Guide'}</span>
                {showInstallGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Collapsible Step-by-Step Installation Guide */}
            {showInstallGuide && (
              <div className="mt-2 p-2.5 sm:p-3 bg-white dark:bg-[#1a1a16] border border-[#e2e2d5] dark:border-[#3a3a30] space-y-2 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ecece0] dark:border-[#32322a] pb-2">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-[#7d8461] dark:text-[#9ca87a]">
                    How to Install
                  </span>
                  <div className="flex items-center gap-1 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setGuidePlatform('desktop')}
                      className={`flex-1 sm:flex-none px-2 py-1 text-[10px] font-semibold cursor-pointer text-center ${
                        guidePlatform === 'desktop'
                          ? 'bg-[#7d8461] text-white'
                          : 'bg-[#f4f4ea] dark:bg-[#25251f] text-[#5c5c52] dark:text-[#a8a89b]'
                      }`}
                    >
                      Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuidePlatform('ios')}
                      className={`flex-1 sm:flex-none px-2 py-1 text-[10px] font-semibold cursor-pointer text-center ${
                        guidePlatform === 'ios'
                          ? 'bg-[#7d8461] text-white'
                          : 'bg-[#f4f4ea] dark:bg-[#25251f] text-[#5c5c52] dark:text-[#a8a89b]'
                      }`}
                    >
                      iOS / iPhone
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuidePlatform('android')}
                      className={`flex-1 sm:flex-none px-2 py-1 text-[10px] font-semibold cursor-pointer text-center ${
                        guidePlatform === 'android'
                          ? 'bg-[#7d8461] text-white'
                          : 'bg-[#f4f4ea] dark:bg-[#25251f] text-[#5c5c52] dark:text-[#a8a89b]'
                      }`}
                    >
                      Android
                    </button>
                  </div>
                </div>

                {guidePlatform === 'desktop' && (
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#5c5c52] dark:text-[#a8a89b] leading-relaxed">
                    <li>Open this URL in Google Chrome, Microsoft Edge, or Brave.</li>
                    <li>Click the <strong>Install</strong> icon in the address bar (or Menu ⋮ &rarr; <em>&ldquo;Install Fuenzer Journal&rdquo;</em>).</li>
                    <li>The app launches as a standalone window with its own icon in your dock.</li>
                  </ol>
                )}

                {guidePlatform === 'ios' && (
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#5c5c52] dark:text-[#a8a89b] leading-relaxed">
                    <li>Open this page in <strong>Apple Safari</strong> on your iPhone or iPad.</li>
                    <li>Tap the <strong>Share</strong> button at the bottom (square with arrow).</li>
                    <li>Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.</li>
                    <li>Tap <strong>&ldquo;Add&rdquo;</strong> in the top-right corner.</li>
                  </ol>
                )}

                {guidePlatform === 'android' && (
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#5c5c52] dark:text-[#a8a89b] leading-relaxed">
                    <li>Open this page in <strong>Google Chrome</strong> or Samsung Internet.</li>
                    <li>Tap the three dots <strong>(⋮)</strong> in the top-right corner.</li>
                    <li>Tap <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.</li>
                    <li>Confirm installation to add Fuenzer Journal to your home screen.</li>
                  </ol>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google Workspace Modal triggered directly from Settings */}
      <WorkspaceSyncModal
        isOpen={workspaceSyncOpen}
        onClose={() => setWorkspaceSyncOpen(false)}
        defaultTab={workspaceDefaultTab}
        entryTitle="Mindful Reflection Session"
        actionItems={[]}
        executiveSummary="Dedicated mindful reflection block for clarity and journaling."
      />
    </div>
  );
};
