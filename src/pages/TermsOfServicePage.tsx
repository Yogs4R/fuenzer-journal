import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, ArrowLeft, CheckCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Footer } from '../components/Footer';

export const TermsOfServicePage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#fbfaf5] dark:bg-[#181814] text-[#2c2c26] dark:text-[#f0efe6] flex flex-col justify-between selection:bg-[#7d8461] selection:text-white transition-colors duration-150">
      {/* Top Header */}
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
              to="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] bg-[#f4f4ea] dark:bg-[#25251f] hover:bg-[#ecece0] dark:hover:bg-[#303028] border border-[#e8e8df] dark:border-[#35352c] px-3 py-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        <div className="bg-white dark:bg-[#23231c] border border-[#ecece0] dark:border-[#38382e] p-6 sm:p-10 shadow-xs">
          <div className="flex items-center gap-3 pb-5 border-b border-[#ecece0] dark:border-[#38382e] mb-6">
            <div className="w-10 h-10 bg-[#7d8461]/10 dark:bg-[#7d8461]/25 flex items-center justify-center text-[#7d8461] dark:text-[#9ca87a] border border-[#7d8461]/20 dark:border-[#7d8461]/40">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif italic font-bold text-2xl sm:text-3xl text-[#2c2c26] dark:text-[#f0efe6]">
                Terms of Service
              </h1>
              <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] mt-0.5">
                Effective Date: January 1, 2026 &bull; Fuenzer Sports
              </p>
            </div>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-[#5c5c52] dark:text-[#a8a89b] leading-relaxed">
            <div className="p-4 bg-[#7d8461]/5 dark:bg-[#7d8461]/15 border border-[#7d8461]/20 dark:border-[#7d8461]/35">
              <p className="font-medium text-[#2c2c26] dark:text-[#f0efe6]">
                By accessing or using Fuenzer Journal, you agree to these Terms of Service. Please read them carefully to understand your rights and responsibilities.
              </p>
            </div>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] dark:text-[#f0efe6] mb-2">
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account, authenticating via Google Sign-In, or utilizing Fuenzer Journal, you agree to comply with and be bound by these terms. If you disagree with any portion of these terms, you should discontinue use of the service.
              </p>
            </section>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] dark:text-[#f0efe6] mb-2">
                2. Purpose of Service & Mental Wellness Disclaimer
              </h2>
              <p>
                Fuenzer Journal is a personal self-reflection and philosophical thinking companion designed to assist with mindful journaling and thought deconstruction. <strong>It is not a licensed medical, psychological, or crisis intervention service.</strong> Fuenzer Journal does not provide psychiatric diagnoses or medical treatments. If you are in distress or experiencing a medical emergency, please consult a qualified healthcare professional or crisis hotline immediately.
              </p>
            </section>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] dark:text-[#f0efe6] mb-2">
                3. User Content & Intellectual Property
              </h2>
              <p>
                You retain all rights, title, and interest in and to your reflections, journal entries, notes, and user data. Fuenzer Journal claims zero ownership over your authored content.
              </p>
            </section>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] dark:text-[#f0efe6] mb-2">
                4. Account Security
              </h2>
              <p>
                You are responsible for maintaining the security of your Google account credentials used to log in. Fuenzer Journal is not liable for unauthorized access resulting from compromised user authentication credentials.
              </p>
            </section>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] dark:text-[#f0efe6] mb-2">
                5. Service Availability & Modifications
              </h2>
              <p>
                We strive to maintain continuous availability and data durability. We may periodically enhance features, improve AI reflection frameworks, or conduct system updates.
              </p>
            </section>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] dark:text-[#f0efe6] mb-2">
                6. Governing Law & Contact
              </h2>
              <p>
                These Terms are governed by applicable laws. For questions or legal notices, contact{' '}
                <a href="mailto:fuenzerofficial@gmail.com" className="text-[#7d8461] dark:text-[#9ca87a] underline font-medium">
                  fuenzerofficial@gmail.com
                </a>.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-[#ecece0] dark:border-[#38382e] flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/privacy"
              className="text-xs font-semibold text-[#7d8461] dark:text-[#9ca87a] hover:underline"
            >
              &larr; View Privacy Policy
            </Link>

            <Link
              to="/login"
              className="px-4 py-2 bg-[#7d8461] hover:bg-[#6c7351] text-white text-xs font-bold uppercase tracking-wider transition"
            >
              Continue to Login
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
