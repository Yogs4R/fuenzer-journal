import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  PenLine,
  BarChart3,
  LogOut,
  Flame,
  User as UserIcon,
  ChevronDown,
  Menu,
  X,
  Plus,
  Search,
  Sun,
  Moon,
  Download,
  Bell,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { MindfulNotificationModal } from './MindfulNotificationModal';

interface NavbarProps {
  currentTab: 'editor' | 'history' | 'analytics';
  setCurrentTab: (tab: 'editor' | 'history' | 'analytics') => void;
  streakCount: number;
  onNewEntry: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  streakCount,
  onNewEntry,
}) => {
  const { user, isGuest, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const handleTabSelect = (tab: 'editor' | 'history' | 'analytics') => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    if (tab === 'editor') navigate('/app');
    else if (tab === 'history') navigate('/archive');
    else if (tab === 'analytics') navigate('/analytics');
  };

  const handleStartNew = () => {
    onNewEntry();
    setCurrentTab('editor');
    navigate('/app');
    setMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  const openCommandPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
    );
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#fbfaf5]/95 dark:bg-[#1a1a16]/95 backdrop-blur-md border-b border-[#ecece0] dark:border-[#2e2e26] text-[#2c2c26] dark:text-[#f0efe6] transition-colors shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                if (window.location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigate('/');
                }
              }}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
              title="Fuenzer Journal Home"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#7d8461] dark:bg-[#8e966f] rounded-none flex items-center justify-center text-white shadow-xs group-hover:bg-[#6c7351] transition">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h1 className="text-base sm:text-lg font-serif italic font-bold leading-tight text-[#2c2c26] dark:text-[#f0efe6]">
                Fuenzer Journal
              </h1>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center bg-[#f4f4ea] dark:bg-[#25251f] border border-[#e8e8df] dark:border-[#35352c] rounded-none p-0.5">
            <button
              onClick={() => handleTabSelect('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'editor'
                  ? 'bg-[#7d8461] dark:bg-[#8e966f] text-white shadow-xs'
                  : 'text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] hover:bg-[#ecece0] dark:hover:bg-[#303028]'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Active Reflection</span>
            </button>
            <button
              onClick={() => handleTabSelect('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'history'
                  ? 'bg-[#7d8461] dark:bg-[#8e966f] text-white shadow-xs'
                  : 'text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] hover:bg-[#ecece0] dark:hover:bg-[#303028]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>
            <button
              onClick={() => handleTabSelect('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'analytics'
                  ? 'bg-[#7d8461] dark:bg-[#8e966f] text-white shadow-xs'
                  : 'text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] hover:bg-[#ecece0] dark:hover:bg-[#303028]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Insights</span>
            </button>
          </nav>

          {/* Right Actions Desktop & Mobile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* PWA Install Button Desktop (when install prompt is available) */}
            {isInstallable && (
              <button
                onClick={promptInstall}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#7d8461] hover:bg-[#6c7351] dark:bg-[#8e966f] dark:hover:bg-[#7d8461] text-white text-xs font-semibold rounded-none transition cursor-pointer shadow-xs animate-in fade-in"
                title="Install Fuenzer Journal as a standalone desktop/mobile app"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-[11px]">Install App</span>
              </button>
            )}

            {/* Mindful Reminders / PWA Modal Trigger Button - Desktop Only (in mobile it is inside hamburger) */}
            <button
              onClick={() => setShowNotificationModal(true)}
              className="hidden md:flex p-2 bg-[#f4f4ea] dark:bg-[#25251f] hover:bg-[#ecece0] dark:hover:bg-[#303028] border border-[#e8e8df] dark:border-[#35352c] text-[#5c5c52] dark:text-[#d0d0c4] hover:text-[#2c2c26] dark:hover:text-[#ffffff] rounded-none transition cursor-pointer"
              title="Mindful Reminders & Offline PWA Settings"
              aria-label="Mindful Reminders & Offline Settings"
            >
              <Bell className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a]" />
            </button>

            {/* Quick Command Palette Button Desktop */}
            <button
              onClick={openCommandPalette}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f4f4ea] dark:bg-[#25251f] hover:bg-[#ecece0] dark:hover:bg-[#303028] border border-[#e8e8df] dark:border-[#35352c] text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] text-xs font-medium rounded-none transition cursor-pointer"
              title="Open Command Palette (Cmd+K / Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a]" />
              <span className="text-[11px] hidden lg:inline">Find</span>
              <kbd className="text-[9px] font-mono px-1 py-0.2 bg-white dark:bg-[#1a1a16] border border-[#d8d8cc] dark:border-[#424236] text-[#7d8461] dark:text-[#9ca87a] font-bold">
                ⌘K
              </kbd>
            </button>

            {/* Light / Dark Theme Toggle Button - Desktop Only (in mobile it is inside hamburger) */}
            <button
              onClick={toggleTheme}
              className="hidden md:flex p-2 bg-[#f4f4ea] dark:bg-[#25251f] hover:bg-[#ecece0] dark:hover:bg-[#303028] border border-[#e8e8df] dark:border-[#35352c] text-[#5c5c52] dark:text-[#d0d0c4] hover:text-[#2c2c26] dark:hover:text-[#ffffff] rounded-none transition cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle light or dark theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-[#e9c46a]" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[#7d8461]" />
              )}
            </button>

            {/* Streak Counter - Desktop Only (in mobile it is inside hamburger profile header) */}
            <div
              title={`${streakCount} day journaling streak`}
              className="hidden md:flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-[#e9c46a]/20 dark:bg-[#e9c46a]/15 border border-[#e9c46a]/40 dark:border-[#e9c46a]/30 text-[#8a6b18] dark:text-[#e9c46a] rounded-none text-xs font-semibold whitespace-nowrap"
            >
              <Flame className="w-3.5 h-3.5 text-[#d48b0c] dark:text-[#f4a261] fill-[#d48b0c]/30" />
              <span>{streakCount}d</span>
            </div>

            {/* Desktop User Profile Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-none bg-[#f4f4ea] dark:bg-[#25251f] hover:bg-[#ecece0] dark:hover:bg-[#303028] border border-[#e8e8df] dark:border-[#35352c] transition cursor-pointer text-xs whitespace-nowrap"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-none object-cover border border-[#d8d8cc] dark:border-[#424236]"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-none bg-[#7d8461] dark:bg-[#8e966f] flex items-center justify-center text-white text-[11px] font-bold font-serif italic">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : isGuest ? 'G' : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                )}
                <span className="text-xs font-medium text-[#2c2c26] dark:text-[#f0efe6] max-w-[90px] truncate">
                  {user?.displayName?.split(' ')[0] || (isGuest ? 'Guest' : 'User')}
                </span>
                <ChevronDown className="w-3 h-3 text-[#5c5c52] dark:text-[#a8a89b]" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-56 rounded-none bg-[#ffffff] dark:bg-[#25251f] border border-[#ecece0] dark:border-[#35352c] shadow-lg p-2 text-sm z-50 animate-in fade-in">
                    <div className="p-2.5 border-b border-[#ecece0] dark:border-[#35352c] bg-[#fbfaf5] dark:bg-[#1f1f1a] rounded-none mb-1">
                      <p className="font-semibold text-[#2c2c26] dark:text-[#f0efe6] truncate font-serif italic text-xs">
                        {user?.displayName || (isGuest ? 'Guest Writer' : 'Journaler')}
                      </p>
                      <p className="text-[11px] text-[#5c5c52] dark:text-[#a8a89b] truncate font-mono">
                        {user?.email || (isGuest ? 'Stored on device' : 'Not signed in')}
                      </p>
                    </div>
                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={handleStartNew}
                        className="w-full text-left px-2.5 py-1.5 rounded-none text-[#3a3a30] dark:text-[#e0dfd5] hover:bg-[#f4f4ea] dark:hover:bg-[#2e2e26] flex items-center gap-2 text-xs transition cursor-pointer font-medium"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a]" />
                        <span>New Reflection</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowNotificationModal(true);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-none text-[#3a3a30] dark:text-[#e0dfd5] hover:bg-[#f4f4ea] dark:hover:bg-[#2e2e26] flex items-center gap-2 text-xs transition cursor-pointer font-medium"
                      >
                        <Bell className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a]" />
                        <span>Reminders &amp; PWA</span>
                      </button>

                      {isInstallable && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            promptInstall();
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-none text-[#555c3c] dark:text-[#9ca87a] hover:bg-[#7d8461]/10 flex items-center gap-2 text-xs transition cursor-pointer font-semibold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Install App</span>
                        </button>
                      )}

                      {isGuest && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/login');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-none text-[#7d8461] dark:text-[#9ca87a] hover:bg-[#7d8461]/10 flex items-center gap-2 text-xs transition cursor-pointer font-semibold"
                        >
                          <UserIcon className="w-3.5 h-3.5" />
                          <span>Sign In with Google</span>
                        </button>
                      )}
                    </div>
                    <div className="pt-1 border-t border-[#ecece0] dark:border-[#35352c] mt-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          signOut();
                          navigate('/');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-none text-[#96472d] dark:text-[#e07a5f] hover:bg-[#c86d51]/10 dark:hover:bg-[#c86d51]/20 flex items-center gap-2 text-xs transition cursor-pointer font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{isGuest ? 'Exit Guest Mode' : 'Sign Out'}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile / Tablet Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-none bg-[#f4f4ea] dark:bg-[#25251f] hover:bg-[#ecece0] dark:hover:bg-[#303028] border border-[#e8e8df] dark:border-[#35352c] text-[#2c2c26] dark:text-[#f0efe6] transition cursor-pointer shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Drawer Menu - Absolute Overlay over the page */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop Dimmer */}
            <div
              className="fixed inset-0 top-16 bg-black/40 dark:bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-150"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Floating Drawer Overlay */}
            <div className="absolute top-full left-0 right-0 z-50 md:hidden bg-[#ffffff] dark:bg-[#20201a] border-b border-[#ecece0] dark:border-[#2e2e26] px-4 py-3.5 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-150 text-[#2c2c26] dark:text-[#f0efe6]">
              {/* User Profile Header on Mobile */}
              <div className="flex items-center justify-between pb-3 border-b border-[#ecece0] dark:border-[#2e2e26]">
                <div className="flex items-center gap-2.5">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-none object-cover border border-[#d8d8cc] dark:border-[#424236]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-none bg-[#7d8461] dark:bg-[#8e966f] flex items-center justify-center text-white text-xs font-bold font-serif italic">
                      {user?.displayName ? user.displayName.charAt(0).toUpperCase() : isGuest ? 'G' : <UserIcon className="w-4 h-4" />}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-[#2c2c26] dark:text-[#f0efe6] font-serif italic">
                      {user?.displayName || (isGuest ? 'Guest Writer' : 'Reflective Journaler')}
                    </p>
                    <p className="text-[10px] text-[#5c5c52] dark:text-[#a8a89b] font-mono">
                      {user?.email || (isGuest ? 'Stored locally on device' : 'Not signed in')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2 py-0.5 bg-[#e9c46a]/20 dark:bg-[#e9c46a]/15 border border-[#e9c46a]/40 dark:border-[#e9c46a]/30 text-[#8a6b18] dark:text-[#e9c46a] text-[11px] font-bold">
                  <Flame className="w-3 h-3 text-[#d48b0c] dark:text-[#f4a261]" />
                  <span>{streakCount}d</span>
                </div>
              </div>

              {/* Mobile Quick Action Buttons: Search, Reminders & Theme Toggle */}
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                {/* Command Palette Button inside Hamburger */}
                <button
                  onClick={openCommandPalette}
                  className="py-2 px-2 bg-[#f4f4ea] dark:bg-[#282822] hover:bg-[#ecece0] dark:hover:bg-[#32322a] border border-[#e8e8df] dark:border-[#3a3a30] text-[#2c2c26] dark:text-[#f0efe6] text-[11px] font-semibold rounded-none flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a]" />
                  <span>Search</span>
                </button>

                {/* Reminders Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowNotificationModal(true);
                  }}
                  className="py-2 px-2 bg-[#f4f4ea] dark:bg-[#282822] hover:bg-[#ecece0] dark:hover:bg-[#32322a] border border-[#e8e8df] dark:border-[#3a3a30] text-[#2c2c26] dark:text-[#f0efe6] text-[11px] font-semibold rounded-none flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a]" />
                  <span>Remind</span>
                </button>

                {/* Theme Toggle Button inside Hamburger */}
                <button
                  onClick={toggleTheme}
                  className="py-2 px-2 bg-[#f4f4ea] dark:bg-[#282822] hover:bg-[#ecece0] dark:hover:bg-[#32322a] border border-[#e8e8df] dark:border-[#3a3a30] text-[#2c2c26] dark:text-[#f0efe6] text-[11px] font-semibold rounded-none flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-[#e9c46a]" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-[#7d8461]" />
                      <span>Dark</span>
                    </>
                  )}
                </button>
              </div>

              {/* Install PWA Button on Mobile */}
              {!isInstalled ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (isInstallable) {
                      promptInstall();
                    } else {
                      setShowNotificationModal(true);
                    }
                  }}
                  className="w-full py-2.5 px-3 bg-[#7d8461] hover:bg-[#6c7351] dark:bg-[#8e966f] dark:hover:bg-[#7d8461] text-white text-xs font-bold rounded-none flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Install Fuenzer Journal App</span>
                </button>
              ) : (
                <div className="w-full py-1.5 px-3 bg-[#7d8461]/15 dark:bg-[#8e966f]/20 text-[#555c3c] dark:text-[#9ca87a] text-[11px] font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Installed as Standalone App</span>
                </div>
              )}

              {/* Mobile Navigation Links */}
              <div className="space-y-1 pt-1">
                <button
                  onClick={() => handleTabSelect('editor')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none text-xs font-semibold transition cursor-pointer ${
                    currentTab === 'editor'
                      ? 'bg-[#7d8461] dark:bg-[#8e966f] text-white shadow-xs'
                      : 'bg-[#fbfaf5] dark:bg-[#25251f] text-[#2c2c26] dark:text-[#f0efe6] hover:bg-[#f4f4ea] dark:hover:bg-[#2e2e26]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <PenLine className="w-4 h-4" />
                    <span>Active Reflection</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono opacity-80">Write</span>
                </button>

                <button
                  onClick={() => handleTabSelect('history')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none text-xs font-semibold transition cursor-pointer ${
                    currentTab === 'history'
                      ? 'bg-[#7d8461] dark:bg-[#8e966f] text-white shadow-xs'
                      : 'bg-[#fbfaf5] dark:bg-[#25251f] text-[#2c2c26] dark:text-[#f0efe6] hover:bg-[#f4f4ea] dark:hover:bg-[#2e2e26]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Archive</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono opacity-80">Past Logs</span>
                </button>

                <button
                  onClick={() => handleTabSelect('analytics')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none text-xs font-semibold transition cursor-pointer ${
                    currentTab === 'analytics'
                      ? 'bg-[#7d8461] dark:bg-[#8e966f] text-white shadow-xs'
                      : 'bg-[#fbfaf5] dark:bg-[#25251f] text-[#2c2c26] dark:text-[#f0efe6] hover:bg-[#f4f4ea] dark:hover:bg-[#2e2e26]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Insights & Growth</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono opacity-80">Analytics</span>
                </button>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t border-[#ecece0] dark:border-[#2e2e26] flex items-center gap-2">
                <button
                  onClick={handleStartNew}
                  className="flex-1 py-2 bg-[#f4f4ea] dark:bg-[#282822] hover:bg-[#ecece0] dark:hover:bg-[#32322a] border border-[#e8e8df] dark:border-[#3a3a30] text-[#2c2c26] dark:text-[#f0efe6] text-xs font-bold rounded-none flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a]" />
                  <span>New Session</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                    navigate('/');
                  }}
                  className="py-2 px-3 bg-[#c86d51]/10 dark:bg-[#c86d51]/20 hover:bg-[#c86d51]/20 border border-[#c86d51]/30 text-[#96472d] dark:text-[#e07a5f] text-xs font-bold rounded-none flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Mindful Notifications & PWA Modal */}
      <MindfulNotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />
    </>
  );
};

