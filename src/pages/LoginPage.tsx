import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Lock, ArrowLeft, CheckCircle2, Sparkles, Feather } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { user, signInWithGoogle, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/app', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf5] text-[#2c2c26] flex flex-col justify-between selection:bg-[#7d8461] selection:text-white relative">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-[#7d8461]/15 via-[#ddb892]/10 to-transparent blur-[100px]" />
        <div className="absolute bottom-10 -right-32 w-[350px] h-[350px] bg-[#9c6644]/10 blur-[90px]" />
      </div>

      {/* Header bar */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between w-full">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-[#7d8461] flex items-center justify-center text-white shadow-xs group-hover:bg-[#6c7351] transition">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-serif italic font-bold text-base text-[#2c2c26]">
            Fuenzer Journal
          </span>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#5c5c52] hover:text-[#2c2c26] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md bg-white border border-[#ecece0] p-6 sm:p-8 shadow-md rounded-none text-center">
          {/* Card Icon */}
          <div className="w-12 h-12 mx-auto bg-[#7d8461]/10 border border-[#7d8461]/25 flex items-center justify-center text-[#7d8461] mb-4 shadow-xs">
            <Feather className="w-6 h-6" />
          </div>

          <h1 className="text-xl sm:text-2xl font-serif italic font-bold text-[#2c2c26]">
            Welcome to Your Sanctuary
          </h1>
          <p className="text-xs text-[#5c5c52] mt-1.5 leading-relaxed">
            Sign in with your Google account to access your private reflection archive, multi-turn dialogues, and mood insights.
          </p>

          {/* Sign In Button */}
          <div className="mt-7">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 bg-[#2c2c26] hover:bg-[#3a3a30] text-[#fbfaf5] font-semibold text-xs uppercase tracking-wider rounded-none shadow-sm flex items-center justify-center gap-3 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
          </div>

          {error && (
            <div className="mt-4 p-3 bg-[#c86d51]/10 border border-[#c86d51]/30 rounded-none text-[#96472d] text-xs text-left">
              {error}
            </div>
          )}

          {/* Privacy Guarantee Badges */}
          <div className="mt-6 pt-5 border-t border-[#ecece0] space-y-2 text-left text-xs text-[#5c5c52]">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#7d8461] shrink-0" />
              <span>Passwordless Google Authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7d8461] shrink-0" />
              <span>Owner-isolated Cloud Firestore database</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#7d8461] shrink-0" />
              <span>Zero training on your private reflection data</span>
            </div>
          </div>

          <div className="mt-5 text-[11px] text-[#5c5c52]">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-[#2c2c26]">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:text-[#2c2c26]">
              Privacy Policy
            </Link>.
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-[#5c5c52] border-t border-[#ecece0] bg-white">
        <span>&copy; 2026 Fuenzer Sports. All rights reserved.</span>
      </footer>
    </div>
  );
};
