import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Lock, ArrowLeft, CheckCircle2, Sparkles, Feather, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const LoginPage: React.FC = () => {
  const { user, signInWithGoogle, continueAsGuest, isGuest, loading, error } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if ((user || isGuest) && !loading) {
      navigate('/app', { replace: true });
    }
  }, [user, isGuest, loading, navigate]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf5] dark:bg-[#181814] text-[#2c2c26] dark:text-[#f0efe6] flex flex-col justify-between selection:bg-[#7d8461] selection:text-white relative transition-colors duration-150">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-[#7d8461]/15 via-[#ddb892]/10 to-transparent dark:from-[#7d8461]/20 dark:via-[#4a4a35]/15 blur-[100px]" />
        <div className="absolute bottom-10 -right-32 w-[350px] h-[350px] bg-[#9c6644]/10 dark:bg-[#9c6644]/20 blur-[90px]" />
      </div>

      {/* Header bar */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between w-full">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-[#7d8461] dark:bg-[#8e966f] flex items-center justify-center text-white shadow-xs group-hover:bg-[#6c7351] transition">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-serif italic font-bold text-base text-[#2c2c26] dark:text-[#f0efe6]">
            Fuenzer Journal
          </span>
        </Link>

        <div className="flex items-center gap-3">
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
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md bg-white dark:bg-[#23231c] border border-[#ecece0] dark:border-[#38382e] p-6 sm:p-8 shadow-md rounded-none text-center">
          {/* Card Icon */}
          <div className="w-12 h-12 mx-auto bg-[#7d8461]/10 dark:bg-[#7d8461]/25 border border-[#7d8461]/25 dark:border-[#7d8461]/40 flex items-center justify-center text-[#7d8461] dark:text-[#9ca87a] mb-4 shadow-xs">
            <Feather className="w-6 h-6" />
          </div>

          <h1 className="text-xl sm:text-2xl font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6]">
            Welcome to Your Sanctuary
          </h1>
          <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] mt-1.5 leading-relaxed">
            Sign in with your Google account to access your private reflection archive, multi-turn dialogues, and mood insights.
          </p>

          {/* Sign In Button */}
          <div className="mt-7 space-y-3">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 bg-[#2c2c26] dark:bg-[#f0efe6] hover:bg-[#3a3a30] dark:hover:bg-[#ffffff] text-[#fbfaf5] dark:text-[#181814] font-semibold text-xs uppercase tracking-wider rounded-none shadow-sm flex items-center justify-center gap-3 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                </svg>
              )}
              <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-[#ecece0] dark:border-[#38382e] w-full" />
              <span className="bg-white dark:bg-[#23231c] px-2 text-[10px] uppercase font-mono tracking-widest text-[#8c8c80] dark:text-[#88887a] absolute">
                or
              </span>
            </div>

            {/* Continue as Guest Button */}
            <button
              type="button"
              onClick={() => {
                continueAsGuest();
                navigate('/app');
              }}
              className="w-full py-2.5 px-4 bg-[#f4f4ea] dark:bg-[#2c2c24] hover:bg-[#ecece0] dark:hover:bg-[#35352c] border border-[#d8d8cc] dark:border-[#424236] text-[#2c2c26] dark:text-[#f0efe6] font-semibold text-xs uppercase tracking-wider rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>Continue as Guest</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </button>
            <p className="text-[11px] text-[#7d8461] dark:text-[#9ca87a] italic">
              Guest entries are stored locally on your device without an account.
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-[#c86d51]/10 dark:bg-[#c86d51]/20 border border-[#c86d51]/30 text-[#96472d] dark:text-[#e07a5f] text-xs text-left">
              {error}
            </div>
          )}

          {/* Privacy Guarantee Badges */}
          <div className="mt-6 pt-5 border-t border-[#ecece0] dark:border-[#38382e] space-y-2 text-left text-xs text-[#5c5c52] dark:text-[#a8a89b]">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a] shrink-0" />
              <span>Passwordless Google Authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a] shrink-0" />
              <span>Owner-isolated Cloud Firestore database</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#7d8461] dark:text-[#9ca87a] shrink-0" />
              <span>Zero training on your private reflection data</span>
            </div>
          </div>

          <div className="mt-5 text-[11px] text-[#5c5c52] dark:text-[#a8a89b]">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-[#2c2c26] dark:hover:text-[#f0efe6]">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:text-[#2c2c26] dark:hover:text-[#f0efe6]">
              Privacy Policy
            </Link>.
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-[#5c5c52] dark:text-[#a8a89b] border-t border-[#ecece0] dark:border-[#2e2e26] bg-white dark:bg-[#181814]">
        <span>&copy; 2026 Fuenzer Sports. All rights reserved.</span>
      </footer>
    </div>
  );
};
