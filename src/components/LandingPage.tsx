import React, { useState } from 'react';
import {
  ShieldCheck,
  Brain,
  Lock,
  ArrowRight,
  BookOpen,
  CheckCircle,
  HeartHandshake,
  Compass,
  FileText,
  Feather,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SecurityModal } from './SecurityModal';

export const LandingPage: React.FC = () => {
  const { signInWithGoogle, loading, error } = useAuth();
  const [showSecurity, setShowSecurity] = useState(false);

  const samplePrompts = [
    {
      title: 'Stoic Evening Reflection',
      tagline: 'Equanimity & Control',
      icon: ShieldCheck,
      color: 'border-[#9c6644]/30 bg-[#9c6644]/10 text-[#7f4f24]',
      sample: '"I felt anxious about my team presentation today. Help me separate what was in my control from what was outside it."',
    },
    {
      title: 'Emotional Untangling',
      tagline: 'Clarity & Validation',
      icon: HeartHandshake,
      color: 'border-[#c86d51]/30 bg-[#c86d51]/10 text-[#96472d]',
      sample: '"I am feeling frustrated but also guilty for feeling this way. Help me unpack where this tension is rooted."',
    },
    {
      title: 'Problem Deconstruction',
      tagline: 'First Principles Thinking',
      icon: Brain,
      color: 'border-[#85756e]/30 bg-[#85756e]/10 text-[#53463f]',
      sample: '"I have two competing priorities this quarter and feel paralyzed. Walk me through a decision framework."',
    },
    {
      title: 'Future Visioning',
      tagline: 'Purpose Alignment',
      icon: Compass,
      color: 'border-[#b08968]/30 bg-[#b08968]/10 text-[#6f4e37]',
      sample: '"What small micro-habit today will my 5-year future self thank me for starting?"',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbfaf5] text-[#2c2c26] flex flex-col justify-between selection:bg-[#7d8461] selection:text-white">
      {/* Background ambient natural tint */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[750px] h-[500px] bg-gradient-to-b from-[#7d8461]/15 via-[#ddb892]/10 to-transparent blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] bg-[#9c6644]/10 blur-[100px]" />
        <div className="absolute bottom-10 -left-40 w-[400px] h-[400px] bg-[#7d8461]/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between w-full border-b border-[#ecece0]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#7d8461] rounded-none flex items-center justify-center text-white shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-serif italic font-bold leading-tight text-[#2c2c26]">
              Personal Gemini Journal
            </h1>
            <span className="text-[9px] uppercase tracking-[0.18em] text-[#7d8461] font-semibold">
              Mindful Reflection Sanctuary
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="text-[11px] uppercase tracking-wider font-bold bg-[#3a3a30] text-[#fbfaf5] px-4 py-2 rounded-none hover:bg-[#2c2c26] shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 text-center">
        {/* Trust badge - Square */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-[#f4f4ea] border border-[#e8e8df] text-xs text-[#5c5c52] mb-6 shadow-xs">
          <span className="flex h-2 w-2 rounded-none bg-[#7d8461] animate-pulse" />
          <span className="font-medium text-[11px] uppercase tracking-wider text-[#4c5432]">
            Private Journal & Mindful AI Sounding Board
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif italic font-bold tracking-tight text-[#2c2c26] leading-tight sm:leading-tight">
          Your Private Sanctuary for <br />
          <span className="text-[#7d8461] underline decoration-[#ddb892]/60 underline-offset-8">
            Deep Reflection & Clarity
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-lg text-[#5c5c52] max-w-2xl mx-auto leading-relaxed font-light">
          Engage in thoughtful multi-turn dialogues to untangle feelings, deconstruct decisions, and cultivate calm. Automatically distill key takeaways into an encrypted, strictly isolated personal archive.
        </p>

        {/* Primary Call to Action */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full sm:w-auto px-7 py-3.5 bg-[#7d8461] hover:bg-[#6c7351] text-white font-bold rounded-none shadow-md shadow-[#7d8461]/25 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 text-sm uppercase tracking-wider"
          >
            {/* Google G Logo SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#ffffff"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#ffffff"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#ffffff"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#ffffff"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{loading ? 'Connecting to Google...' : 'Continue with Google Sign-In'}</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 max-w-md mx-auto bg-[#c86d51]/10 border border-[#c86d51]/30 rounded-none text-[#96472d] text-xs">
            {error}
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-xs text-[#5c5c52]">
          <span className="flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-[#7d8461]" />
            No Passwords Stored
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7d8461]" />
            Owner-Bound Firestore
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-[#7d8461]" />
            Zero Cross-User Leaks
          </span>
        </div>

        {/* Feature Grid - Square Corners */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          <div className="p-6 rounded-none bg-white border border-[#e8e8df] shadow-xs hover:border-[#7d8461]/40 transition">
            <div className="w-10 h-10 rounded-none bg-[#7d8461]/10 border border-[#7d8461]/20 text-[#7d8461] flex items-center justify-center mb-3.5">
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="text-base font-serif italic font-bold text-[#2c2c26] mb-1.5">Socratic Reflection Companion</h2>
            <p className="text-xs text-[#5c5c52] leading-relaxed">
              Acts as an empathetic sounding board, asking incisive clarifying questions to uncover your deepest insights.
            </p>
          </div>

          <div className="p-6 rounded-none bg-white border border-[#e8e8df] shadow-xs hover:border-[#7d8461]/40 transition">
            <div className="w-10 h-10 rounded-none bg-[#9c6644]/10 border border-[#9c6644]/20 text-[#9c6644] flex items-center justify-center mb-3.5">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-base font-serif italic font-bold text-[#2c2c26] mb-1.5">Instant Automated Summaries</h2>
            <p className="text-xs text-[#5c5c52] leading-relaxed">
              When you wrap up, the engine automatically crafts a title, synthesis, key breakthroughs, and actionable next steps.
            </p>
          </div>

          <div className="p-6 rounded-none bg-white border border-[#e8e8df] shadow-xs hover:border-[#7d8461]/40 transition">
            <div className="w-10 h-10 rounded-none bg-[#7d8461]/10 border border-[#7d8461]/20 text-[#7d8461] flex items-center justify-center mb-3.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-serif italic font-bold text-[#2c2c26] mb-1.5">Guaranteed User Isolation</h2>
            <p className="text-xs text-[#5c5c52] leading-relaxed">
              Enforced at the database engine level via Firestore Security Rules. No user can ever query or access another person’s thoughts.
            </p>
          </div>
        </div>

        {/* Sample Reflection Frameworks Showcase */}
        <div className="mt-14 text-left">
          <div className="flex items-center gap-2 mb-4">
            <Feather className="w-4 h-4 text-[#7d8461]" />
            <h2 className="text-lg font-serif italic font-bold text-[#2c2c26]">Curated Reflection Frameworks</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {samplePrompts.map((item, idx) => {
              return (
                <div
                  key={idx}
                  className="p-5 rounded-none bg-white border border-[#e8e8df] hover:border-[#7d8461]/40 transition flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-serif italic font-bold text-[#2c2c26] text-sm">{item.title}</span>
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-none border ${item.color}`}>
                        {item.tagline}
                      </span>
                    </div>
                    <p className="text-xs text-[#5c5c52] italic leading-relaxed bg-[#f4f4ea] p-2.5 rounded-none border border-[#ecece0]">
                      {item.sample}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#ecece0] py-6 text-center text-xs text-[#5c5c52]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-[#7d8461]" />
            <span className="font-serif italic text-xs">Personal Gemini Journal &copy; 2026</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#5c5c52]">
            <button onClick={() => setShowSecurity(true)} className="hover:text-[#2c2c26] transition cursor-pointer font-medium">
              Security Architecture
            </button>
            <span>•</span>
            <span>Cloud Firestore Isolated</span>
            <span>•</span>
            <span>Strict Privacy</span>
          </div>
        </div>
      </footer>

      <SecurityModal isOpen={showSecurity} onClose={() => setShowSecurity(false)} />
    </div>
  );
};
