import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  BellRing,
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
  ExternalLink,
  Laptop,
  PenLine,
  HelpCircle,
  Calendar,
} from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  getStoredNotificationSettings,
  saveNotificationSettings,
  sendMindfulNotification,
  getPromptForCurrentTime,
  NotificationSettings,
  NotificationResult,
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
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [testResult, setTestResult] = useState<NotificationResult | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();
  const [installSuccess, setInstallSuccess] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [guidePlatform, setGuidePlatform] = useState<'desktop' | 'ios' | 'android'>('desktop');
  const [calendarSyncOpen, setCalendarSyncOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getStoredNotificationSettings());
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
      // User is enabling reminders
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
      // User is disabling reminders
      const updated: NotificationSettings = { ...settings, enabled: false };
      setSettings(updated);
      saveNotificationSettings(updated);
    }
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
    // If native prompt is not available (e.g. Safari, Firefox, or in iframe), open the visual guide
    setShowInstallGuide(true);
  };

  const handleStartWritingWithPrompt = () => {
    onClose();
    navigate('/app');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-[#ffffff] dark:bg-[#1f1f1a] border border-[#ecece0] dark:border-[#35352c] shadow-2xl p-5 sm:p-6 relative text-[#2c2c26] dark:text-[#f0efe6] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title & Inline/Corner Close Button */}
        <div className="flex items-start justify-between gap-3 mb-5 border-b border-[#ecece0] dark:border-[#2e2e26] pb-4">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-10 h-10 bg-[#7d8461]/15 dark:bg-[#8e966f]/20 flex items-center justify-center text-[#7d8461] dark:text-[#9ca87a] shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-serif italic font-bold leading-tight truncate">
                Mindful Reminders &amp; PWA
              </h2>
              <p className="text-[11px] sm:text-xs text-[#5c5c52] dark:text-[#a8a89b] leading-tight">
                Daily reflection prompts, offline caching, &amp; PWA.
              </p>
            </div>
          </div>

          {/* Close Button with dedicated flex space to never overlap */}
          <button
            onClick={onClose}
            className="p-1.5 -mr-1 -mt-1 text-[#8c8c7a] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] transition cursor-pointer shrink-0 rounded-none bg-[#f4f4ea] dark:bg-[#25251f] hover:bg-[#ecece0] dark:hover:bg-[#303028] border border-[#e8e8df] dark:border-[#35352c]"
            title="Close Settings"
            aria-label="Close Settings"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="space-y-5 text-xs">
          {/* PWA Standalone Status & Install Card */}
          <div className="p-4 bg-[#fbfaf5] dark:bg-[#25251f] border border-[#ecece0] dark:border-[#35352c] space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#7d8461] dark:text-[#9ca87a]" />
                  <span className="font-semibold text-sm">Standalone App (PWA)</span>
                </div>
                <p className="text-[#5c5c52] dark:text-[#a8a89b] text-[11px] leading-relaxed">
                  Install Fuenzer Journal on your desktop dock or mobile home screen for distraction-free journaling with full offline support.
                </p>
              </div>

              {isInstalled || installSuccess ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#7d8461]/15 dark:bg-[#8e966f]/20 text-[#555c3c] dark:text-[#9ca87a] font-semibold text-[11px] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Installed</span>
                </div>
              ) : (
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7d8461] hover:bg-[#6c7351] dark:bg-[#8e966f] dark:hover:bg-[#7d8461] text-white font-semibold text-xs shadow-xs transition cursor-pointer shrink-0"
                  title="Install Fuenzer Journal as standalone app"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
              )}
            </div>

            {/* Offline & Service Worker Indicator */}
            <div className="pt-2 border-t border-[#ecece0] dark:border-[#35352c] flex items-center justify-between text-[11px]">
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
                onClick={() => setShowInstallGuide(!showInstallGuide)}
                className="text-[10px] font-semibold text-[#7d8461] dark:text-[#9ca87a] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                <span>{showInstallGuide ? 'Hide Install Steps' : 'Install Guide'}</span>
                {showInstallGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Collapsible Step-by-Step Installation Guide */}
            {showInstallGuide && (
              <div className="mt-2 p-3 bg-white dark:bg-[#1a1a16] border border-[#e2e2d5] dark:border-[#3a3a30] space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-[#ecece0] dark:border-[#32322a] pb-2">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-[#7d8461] dark:text-[#9ca87a]">
                    How to Install
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setGuidePlatform('desktop')}
                      className={`px-2 py-0.5 text-[10px] font-semibold cursor-pointer ${
                        guidePlatform === 'desktop'
                          ? 'bg-[#7d8461] text-white'
                          : 'bg-[#f4f4ea] dark:bg-[#25251f] text-[#5c5c52] dark:text-[#a8a89b]'
                      }`}
                    >
                      Desktop
                    </button>
                    <button
                      onClick={() => setGuidePlatform('ios')}
                      className={`px-2 py-0.5 text-[10px] font-semibold cursor-pointer ${
                        guidePlatform === 'ios'
                          ? 'bg-[#7d8461] text-white'
                          : 'bg-[#f4f4ea] dark:bg-[#25251f] text-[#5c5c52] dark:text-[#a8a89b]'
                      }`}
                    >
                      iPhone / iPad
                    </button>
                    <button
                      onClick={() => setGuidePlatform('android')}
                      className={`px-2 py-0.5 text-[10px] font-semibold cursor-pointer ${
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
                    <li>The app will launch as a standalone desktop window with its own icon in your dock/taskbar.</li>
                  </ol>
                )}

                {guidePlatform === 'ios' && (
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#5c5c52] dark:text-[#a8a89b] leading-relaxed">
                    <li>Open this page in <strong>Apple Safari</strong> on your iPhone or iPad.</li>
                    <li>Tap the <strong>Share</strong> button at the bottom (the square with an arrow pointing up).</li>
                    <li>Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.</li>
                    <li>Tap <strong>&ldquo;Add&rdquo;</strong> in the top-right corner to place Fuenzer Journal on your Home Screen.</li>
                  </ol>
                )}

                {guidePlatform === 'android' && (
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#5c5c52] dark:text-[#a8a89b] leading-relaxed">
                    <li>Open this page in <strong>Google Chrome</strong> or Samsung Internet.</li>
                    <li>Tap the three dots <strong>(⋮)</strong> in the top-right corner.</li>
                    <li>Tap <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.</li>
                    <li>Confirm installation to add the app icon directly to your app drawer and home screen.</li>
                  </ol>
                )}
              </div>
            )}
          </div>

          {/* Daily Mindful Notifications Toggle */}
          <div className="p-4 bg-[#fbfaf5] dark:bg-[#25251f] border border-[#ecece0] dark:border-[#35352c] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.enabled ? (
                  <Bell className="w-4 h-4 text-[#7d8461] dark:text-[#9ca87a]" />
                ) : (
                  <BellOff className="w-4 h-4 text-[#8c8c7a]" />
                )}
                <span className="font-semibold text-sm">Daily Mindful Reflection Reminder</span>
              </div>

              <button
                onClick={handleToggleNotifications}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.enabled ? 'bg-[#7d8461] dark:bg-[#8e966f]' : 'bg-[#d8d8cc] dark:bg-[#424236]'
                }`}
                role="switch"
                aria-checked={settings.enabled}
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
                <p>
                  Browser notifications are blocked in your site settings. Click the padlock icon in your address bar to allow notifications for this site.
                </p>
              </div>
            )}

            {/* Reminder Time Picker & Presets */}
            {settings.enabled && (
              <div className="space-y-3 pt-2 border-t border-[#ecece0] dark:border-[#35352c] animate-in fade-in">
                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-1.5 text-[#5c5c52] dark:text-[#a8a89b] font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#7d8461]" />
                    <span>Reminder Time:</span>
                  </label>
                  <input
                    type="time"
                    value={settings.reminderTime}
                    onChange={handleTimeChange}
                    className="px-2.5 py-1 bg-white dark:bg-[#1a1a16] border border-[#d8d8cc] dark:border-[#424236] text-xs font-mono font-bold focus:outline-none focus:border-[#7d8461]"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#8c8c7a]">Presets:</span>
                  <button
                    onClick={() => handleQuickPreset('08:30', 'morning')}
                    className={`px-2 py-0.5 border text-[11px] font-medium transition cursor-pointer ${
                      settings.reminderTime === '08:30'
                        ? 'bg-[#7d8461] text-white border-[#7d8461]'
                        : 'bg-white dark:bg-[#1a1a16] border-[#d8d8cc] dark:border-[#424236] text-[#5c5c52] dark:text-[#a8a89b]'
                    }`}
                  >
                    🌅 Morning (08:30)
                  </button>
                  <button
                    onClick={() => handleQuickPreset('20:00', 'evening')}
                    className={`px-2 py-0.5 border text-[11px] font-medium transition cursor-pointer ${
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

          {/* Test Mindful Prompt Section with Interactive Live Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleSendTest}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#7d8461] hover:bg-[#6c7351] dark:bg-[#8e966f] dark:hover:bg-[#7d8461] text-white font-semibold text-xs transition cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Mindful Prompt</span>
              </button>

              <span className="text-[11px] text-[#8c8c7a]">
                Dispatches a prompt for your current time
              </span>
            </div>

            {/* Interactive Dispatched Prompt Preview Card */}
            {testResult && (
              <div className="p-3.5 bg-[#f4f4ea] dark:bg-[#25251f] border-2 border-[#7d8461] dark:border-[#8e966f] space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-2 border-b border-[#e2e2d5] dark:border-[#35352c] pb-1.5">
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

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#e2e2d5] dark:border-[#35352c]">
                  <span className="text-[10px] text-[#7d8461] dark:text-[#9ca87a] font-medium">
                    {testResult.method === 'serviceworker' || testResult.method === 'notification'
                      ? '✓ Delivered to browser notifications'
                      : '✓ Ready to write in journal'}
                  </span>

                  <button
                    onClick={handleStartWritingWithPrompt}
                    className="px-2.5 py-1 bg-[#2c2c26] hover:bg-[#3a3a30] dark:bg-[#e0ded5] dark:hover:bg-[#f0efe6] text-[#fbfaf5] dark:text-[#181814] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    <PenLine className="w-3 h-3" />
                    <span>Reflect With This Prompt</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Google Calendar Reflection Block Scheduling */}
          <div className="p-3.5 bg-[#f4f4ea] dark:bg-[#25251f] border border-[#d8d8cc] dark:border-[#38382e] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-[#7d8461]/15 text-[#555c3c] dark:text-[#9ca87a]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#2c2c26] dark:text-[#f0efe6]">
                  Google Calendar Reflection Blocks
                </p>
                <p className="text-[11px] text-[#5c5c52] dark:text-[#a8a89b]">
                  Block out protected 15–30 min deep focus reflection time in your Google Calendar
                </p>
              </div>
            </div>
            <button
              onClick={() => setCalendarSyncOpen(true)}
              className="px-3 py-1.5 bg-[#7d8461] hover:bg-[#6c7351] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule on Calendar</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#ecece0] dark:border-[#2e2e26] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#7d8461] hover:bg-[#6c7351] dark:bg-[#8e966f] dark:hover:bg-[#7d8461] text-white text-xs font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      {/* Google Calendar Schedule Modal */}
      <WorkspaceSyncModal
        isOpen={calendarSyncOpen}
        onClose={() => setCalendarSyncOpen(false)}
        defaultTab="calendar"
        entryTitle="Mindful Reflection Session"
        actionItems={[]}
        executiveSummary="Dedicated mindful reflection block for clarity and journaling."
      />
    </div>
  );
};

