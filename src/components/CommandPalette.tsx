import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  PenTool,
  Archive,
  BarChart3,
  Home,
  Shield,
  FileText,
  Sparkles,
  ArrowRight,
  CornerDownLeft,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewEntry?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Legal';
  icon: React.ElementType;
  action: () => void;
  shortcut?: string;
  description: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNewEntry,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'editor',
      title: 'Editor / Reflection Studio',
      category: 'Navigation',
      icon: PenTool,
      description: 'Open the main interactive journaling editor',
      shortcut: 'E',
      action: () => {
        navigate('/app');
        onClose();
      },
    },
    {
      id: 'new_reflection',
      title: 'Start Fresh Reflection',
      category: 'Actions',
      icon: Sparkles,
      description: 'Begin a new guided socratic dialogue from scratch',
      shortcut: 'N',
      action: () => {
        if (onNewEntry) onNewEntry();
        navigate('/app');
        onClose();
      },
    },
    {
      id: 'archive',
      title: 'Archive / Past Reflections',
      category: 'Navigation',
      icon: Archive,
      description: 'Search, filter, and review all saved journal entries',
      shortcut: 'A',
      action: () => {
        navigate('/archive');
        onClose();
      },
    },
    {
      id: 'analytics',
      title: 'Analytics & Mood Growth',
      category: 'Navigation',
      icon: BarChart3,
      description: 'View 24-hour, weekly, and monthly emotional trajectories',
      shortcut: 'G',
      action: () => {
        navigate('/analytics');
        onClose();
      },
    },
    {
      id: 'home',
      title: 'Landing Page',
      category: 'Navigation',
      icon: Home,
      description: 'Return to the Fuenzer Journal homepage',
      shortcut: 'H',
      action: () => {
        navigate('/');
        onClose();
      },
    },
    {
      id: 'privacy',
      title: 'Privacy Policy & Data Sanctuary',
      category: 'Legal',
      icon: Shield,
      description: 'Inspect our zero-data monetization and encryption policy',
      action: () => {
        navigate('/privacy');
        onClose();
      },
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      category: 'Legal',
      icon: FileText,
      description: 'Read the terms of service and user agreements',
      action: () => {
        navigate('/terms');
        onClose();
      },
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard navigation inside the palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Overlay Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#23231c] border border-[#2c2c26]/20 dark:border-[#3a3a30] shadow-2xl rounded-none overflow-hidden z-10 animate-in zoom-in-95 duration-150 text-[#2c2c26] dark:text-[#f0efe6]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#ecece0] dark:border-[#38382e] bg-[#fbfaf5] dark:bg-[#1c1c17]">
          <Search className="w-4 h-4 text-[#7d8461] dark:text-[#9ca87a] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or jump to page... (e.g. Editor, Archive, Analytics)"
            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-[#2c2c26] dark:text-[#f0efe6] placeholder-[#8c8c80] dark:placeholder-[#78786c] font-sans"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="p-1 text-[#8c8c80] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] transition cursor-pointer mr-1.5"
              title="Clear search text"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            title="Close command palette (Esc)"
            aria-label="Close command palette"
            className="ml-1 p-1.5 text-[#5c5c52] dark:text-[#9e9e90] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] hover:bg-[#ecece0] dark:hover:bg-[#2c2c24] transition cursor-pointer flex items-center justify-center shrink-0 border border-[#d8d8cc]/60 dark:border-[#3e3e34]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#ecece0]/50 dark:divide-[#38382e]/50">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8c8c80] dark:text-[#808072]">
              <p>No matching commands found for &ldquo;{search}&rdquo;</p>
              <p className="mt-1 text-[11px]">Try searching for &ldquo;Editor&rdquo;, &ldquo;Archive&rdquo;, or &ldquo;Analytics&rdquo;</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 sm:p-3 text-left transition cursor-pointer rounded-none ${
                    isSelected
                      ? 'bg-[#7d8461] dark:bg-[#8e966f] text-white shadow-xs'
                      : 'bg-transparent text-[#2c2c26] dark:text-[#f0efe6] hover:bg-[#f4f4ea] dark:hover:bg-[#2c2c24]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-none flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[#f4f4ea] dark:bg-[#2c2c24] text-[#7d8461] dark:text-[#9ca87a]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <p
                        className={`text-xs font-serif italic font-bold truncate ${
                          isSelected ? 'text-white' : 'text-[#2c2c26] dark:text-[#f0efe6]'
                        }`}
                      >
                        {cmd.title}
                      </p>
                      <p
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-white/80' : 'text-[#5c5c52] dark:text-[#a8a89b]'
                        }`}
                      >
                        {cmd.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-none font-mono ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[#ecece0] dark:bg-[#34342c] text-[#5c5c52] dark:text-[#a8a89b]'
                      }`}
                    >
                      {cmd.category}
                    </span>
                    {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-white animate-pulse" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-3 py-2 bg-[#f4f4ea] dark:bg-[#1c1c17] border-t border-[#ecece0] dark:border-[#38382e] flex items-center justify-between text-[10px] text-[#5c5c52] dark:text-[#a8a89b]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 bg-white dark:bg-[#2c2c24] border border-[#d8d8cc] dark:border-[#424236] text-[9px] font-mono shadow-2xs text-[#2c2c26] dark:text-[#f0efe6]">↑</kbd>
              <kbd className="px-1 py-0.5 bg-white dark:bg-[#2c2c24] border border-[#d8d8cc] dark:border-[#424236] text-[9px] font-mono shadow-2xs ml-1 text-[#2c2c26] dark:text-[#f0efe6]">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-white dark:bg-[#2c2c24] border border-[#d8d8cc] dark:border-[#424236] text-[9px] font-mono shadow-2xs text-[#2c2c26] dark:text-[#f0efe6]">↵</kbd> to select
            </span>
          </div>
          <span className="font-mono text-[9px] text-[#7d8461] dark:text-[#9ca87a] font-bold">
            ⌘K / Ctrl+K
          </span>
        </div>
      </div>
    </div>
  );
};
