import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Compass, Home, Feather, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Footer } from '../components/Footer';
import { usePageTitle } from '../hooks/usePageTitle';

export const NotFoundPage: React.FC = () => {
  usePageTitle('Fuenzer Journal | Page Not Found');
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#fbfaf5] dark:bg-[#181814] text-[#2c2c26] dark:text-[#f0efe6] flex flex-col justify-between selection:bg-[#7d8461] selection:text-white transition-colors duration-150">
      {/* Header */}
      <header className="bg-white dark:bg-[#181814] border-b border-[#ecece0] dark:border-[#2e2e26] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-[#7d8461] dark:bg-[#8e966f] flex items-center justify-center text-white shadow-xs group-hover:bg-[#6c7351] transition">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-serif italic font-bold text-base text-[#2c2c26] dark:text-[#f0efe6]">
              Fuenzer Journal
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-none text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] hover:bg-[#f4f4ea] dark:hover:bg-[#25251f] border border-[#e8e8df] dark:border-[#35352c] transition cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#e9c46a]" />
              ) : (
                <Moon className="w-4 h-4 text-[#7d8461]" />
              )}
            </button>

            <Link
              to={user ? '/app' : '/'}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] bg-[#f4f4ea] dark:bg-[#25251f] hover:bg-[#ecece0] dark:hover:bg-[#303028] border border-[#e8e8df] dark:border-[#35352c] px-3 py-1.5 transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{user ? 'Go to Journal' : 'Home'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main 404 Body */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="max-w-lg w-full text-center bg-white dark:bg-[#23231c] border border-[#ecece0] dark:border-[#38382e] p-8 sm:p-12 shadow-sm rounded-none">
          <div className="w-14 h-14 mx-auto bg-[#7d8461]/10 dark:bg-[#7d8461]/25 border border-[#7d8461]/25 dark:border-[#7d8461]/40 flex items-center justify-center text-[#7d8461] dark:text-[#9ca87a] mb-5">
            <Compass className="w-7 h-7" />
          </div>

          <span className="font-mono text-xs font-bold text-[#7d8461] dark:text-[#9ca87a] tracking-widest uppercase block mb-1">
            Error 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6]">
            Lost in Reflection?
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-[#5c5c52] dark:text-[#a8a89b] leading-relaxed italic">
            &ldquo;Even in wandering, clarity can be found. The page you are looking for does not exist or has been relocated.&rdquo;
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#7d8461] hover:bg-[#6c7351] text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </Link>

            <Link
              to={user ? '/app' : '/login'}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#f4f4ea] dark:bg-[#2c2c24] hover:bg-[#ecece0] dark:hover:bg-[#38382e] border border-[#e8e8df] dark:border-[#38382e] text-[#2c2c26] dark:text-[#f0efe6] text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2"
            >
              <Feather className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a]" />
              <span>{user ? 'Open Reflection Studio' : 'Sign In to Journal'}</span>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-[#ecece0] dark:border-[#38382e] flex items-center justify-center gap-4 text-xs text-[#5c5c52] dark:text-[#a8a89b]">
            <Link to="/privacy" className="hover:underline hover:text-[#2c2c26] dark:hover:text-[#f0efe6]">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:underline hover:text-[#2c2c26] dark:hover:text-[#f0efe6]">
              Terms of Service
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
