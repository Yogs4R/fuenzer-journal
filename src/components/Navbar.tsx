import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabSelect = (tab: 'editor' | 'history' | 'analytics') => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  const handleStartNew = () => {
    onNewEntry();
    setCurrentTab('editor');
    setMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#fbfaf5] border-b border-[#ecece0] text-[#2c2c26]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleTabSelect('editor')}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#7d8461] rounded-none flex items-center justify-center text-white shadow-xs group-hover:bg-[#6c7351] transition">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-serif italic font-bold leading-tight text-[#2c2c26]">
                  Personal Gemini Journal
                </h1>
                <p className="text-[10px] text-[#7d8461] font-medium hidden sm:block">
                  Mindful Reflection & Growth
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs (Hidden on tablet/mobile < 768px) */}
          <nav className="hidden md:flex items-center bg-[#f4f4ea] border border-[#e8e8df] rounded-none p-0.5">
            <button
              onClick={() => handleTabSelect('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'editor'
                  ? 'bg-[#7d8461] text-white shadow-xs'
                  : 'text-[#5c5c52] hover:text-[#2c2c26] hover:bg-[#ecece0]'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Active Reflection</span>
            </button>
            <button
              onClick={() => handleTabSelect('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'history'
                  ? 'bg-[#7d8461] text-white shadow-xs'
                  : 'text-[#5c5c52] hover:text-[#2c2c26] hover:bg-[#ecece0]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>
            <button
              onClick={() => handleTabSelect('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'analytics'
                  ? 'bg-[#7d8461] text-white shadow-xs'
                  : 'text-[#5c5c52] hover:text-[#2c2c26] hover:bg-[#ecece0]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Insights</span>
            </button>
          </nav>

          {/* Right Actions Desktop & Mobile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Streak Counter */}
            <div
              title={`${streakCount} day journaling streak`}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-[#e9c46a]/20 border border-[#e9c46a]/40 text-[#8a6b18] rounded-none text-xs font-semibold"
            >
              <Flame className="w-3.5 h-3.5 text-[#d48b0c] fill-[#d48b0c]/30" />
              <span>{streakCount}d</span>
            </div>

            {/* Desktop User Profile Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-none bg-[#f4f4ea] hover:bg-[#ecece0] border border-[#e8e8df] transition cursor-pointer text-xs"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-none object-cover border border-[#d8d8cc]"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-none bg-[#7d8461] flex items-center justify-center text-white text-[11px] font-bold font-serif italic">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                )}
                <span className="text-xs font-medium text-[#2c2c26] max-w-[90px] truncate">
                  {user?.displayName?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#5c5c52]" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-56 rounded-none bg-[#ffffff] border border-[#ecece0] shadow-lg p-2 text-sm z-50 animate-in fade-in">
                    <div className="p-2.5 border-b border-[#ecece0] bg-[#fbfaf5] rounded-none mb-1">
                      <p className="font-semibold text-[#2c2c26] truncate font-serif italic text-xs">
                        {user?.displayName || 'Journaler'}
                      </p>
                      <p className="text-[11px] text-[#5c5c52] truncate font-mono">{user?.email}</p>
                    </div>
                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={handleStartNew}
                        className="w-full text-left px-2.5 py-1.5 rounded-none text-[#3a3a30] hover:bg-[#f4f4ea] flex items-center gap-2 text-xs transition cursor-pointer font-medium"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#7d8461]" />
                        <span>New Reflection</span>
                      </button>
                    </div>
                    <div className="pt-1 border-t border-[#ecece0] mt-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          signOut();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-none text-[#96472d] hover:bg-[#c86d51]/10 flex items-center gap-2 text-xs transition cursor-pointer font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile / Tablet Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-none bg-[#f4f4ea] hover:bg-[#ecece0] border border-[#e8e8df] text-[#2c2c26] transition cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#ffffff] border-b border-[#ecece0] px-4 py-3 space-y-3 shadow-md animate-in slide-in-from-top-2 duration-150">
            {/* User Profile Header on Mobile */}
            <div className="flex items-center justify-between pb-3 border-b border-[#ecece0]">
              <div className="flex items-center gap-2.5">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-none object-cover border border-[#d8d8cc]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-none bg-[#7d8461] flex items-center justify-center text-white text-xs font-bold font-serif italic">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-[#2c2c26] font-serif italic">
                    {user?.displayName || 'Reflective Journaler'}
                  </p>
                  <p className="text-[10px] text-[#5c5c52] font-mono">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#e9c46a]/20 border border-[#e9c46a]/40 text-[#8a6b18] text-[11px] font-bold">
                <Flame className="w-3 h-3 text-[#d48b0c]" />
                <span>{streakCount}d</span>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              <button
                onClick={() => handleTabSelect('editor')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none text-xs font-semibold transition cursor-pointer ${
                  currentTab === 'editor'
                    ? 'bg-[#7d8461] text-white shadow-xs'
                    : 'bg-[#fbfaf5] text-[#2c2c26] hover:bg-[#f4f4ea]'
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
                    ? 'bg-[#7d8461] text-white shadow-xs'
                    : 'bg-[#fbfaf5] text-[#2c2c26] hover:bg-[#f4f4ea]'
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
                    ? 'bg-[#7d8461] text-white shadow-xs'
                    : 'bg-[#fbfaf5] text-[#2c2c26] hover:bg-[#f4f4ea]'
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
            <div className="pt-2 border-t border-[#ecece0] flex items-center gap-2">
              <button
                onClick={handleStartNew}
                className="flex-1 py-2 bg-[#f4f4ea] hover:bg-[#ecece0] border border-[#e8e8df] text-[#2c2c26] text-xs font-bold rounded-none flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                <Plus className="w-3.5 h-3.5 text-[#7d8461]" />
                <span>New Session</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="py-2 px-3 bg-[#c86d51]/10 hover:bg-[#c86d51]/20 border border-[#c86d51]/30 text-[#96472d] text-xs font-bold rounded-none flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
