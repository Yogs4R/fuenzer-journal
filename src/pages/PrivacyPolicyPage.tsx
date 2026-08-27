import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Lock, ArrowLeft, ShieldCheck, CheckCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Footer } from '../components/Footer';
import { usePageTitle } from '../hooks/usePageTitle';

export const PrivacyPolicyPage: React.FC = () => {
  usePageTitle('Fuenzer Journal | Privacy');
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
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif italic font-bold text-2xl sm:text-3xl text-[#2c2c26] dark:text-[#f0efe6]">
                Privacy Policy
              </h1>
              <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] mt-0.5">
                Effective Date: January 1, 2026 &bull; Fuenzer Journal Trust & Data Standards
              </p>
            </div>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-[#5c5c52] dark:text-[#a8a89b] leading-relaxed">
            <div className="p-4 bg-[#7d8461]/5 dark:bg-[#7d8461]/15 border border-[#7d8461]/20 dark:border-[#7d8461]/35">
              <p className="font-medium text-[#2c2c26] dark:text-[#f0efe6]">
                Your personal journal is an intimate and sacred space. We operate on a strict <strong>Zero Data Monetization</strong> policy: your thoughts, reflections, and personal entries are yours alone.
              </p>
            </div>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] dark:text-[#f0efe6] mb-2">
                1. Fundamental Privacy Guarantee
              </h2>
              <p>
                At <strong>Fuenzer Journal</strong> (operated by Fuenzer Sports), we believe personal reflection requires complete psychological safety. We do not sell, rent, license, or monetize your journal data, prompts, or reflections under any circumstances.
              </p>
            </section>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] dark:text-[#f0efe6] mb-2">
                2. User-Isolated Cloud Storage (Firestore)
              </h2>
              <p>
                Every reflection, draft, and synthesis is saved strictly under your unique document path (<code className="bg-[#f4f4ea] dark:bg-[#2c2c24] px-1 py-0.5 font-mono text-[11px] text-[#4c5432] dark:text-[#c4ceaa]">/users/{'{userId}'}/journals/*</code>). Database-level Cloud Firestore Security Rules enforce that only authenticated requests matching your specific user ID can read, modify, or delete your entries. Cross-user queries are physically blocked.
              </p>
            </section>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] dark:text-[#f0efe6] mb-2">
                3. AI Processing & Gemini Model Interaction
              </h2>
              <p>
                Your reflection prompts and transcripts are processed in-flight via secure, server-side proxies solely to provide conversational Socratic inquiries, sentiment recognition, and structured summaries. Your private journals are <strong>never used to train public foundational AI models</strong>.
              </p>
            </section>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] dark:text-[#f0efe6] mb-2">
                4. Authentication & Credentials
              </h2>
              <p>
                We use Google Federated Authentication via Firebase Auth. We never receive, store, or manage user passwords. Session tokens are securely authenticated via HTTPS and verified on every server request.
              </p>
            </section>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] dark:text-[#f0efe6] mb-2">
                5. Data Ownership, Portability & Deletion
              </h2>
              <p>
                You retain 100% intellectual property and ownership over every word you write. You can export your entire journal archive at any time in formatted Markdown (.md), PDF, CSV, or raw JSON. When you delete a journal entry, it is permanently erased from your database vault.
              </p>
            </section>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] dark:text-[#f0efe6] mb-2">
                6. Cookies, Local Storage & Google Analytics (Measurement ID: G-90FWP0F2D3)
              </h2>
              <p>
                We believe in full transparency regarding client-side data and analytics cookies:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pt-1.5 pl-1 text-[11px] sm:text-xs">
                <li>
                  <strong>Essential Local Storage:</strong> Preserves dark/light theme choices, guest mode authentication, active draft chat messages, and your cookie consent preference. These are essential for core site functionality.
                </li>
                <li>
                  <strong>Google Analytics (G-90FWP0F2D3):</strong> Used solely to collect high-level, aggregate diagnostic metrics (page views, session durations, error encounters) to guide performance enhancements. <strong>IP anonymization is strictly enabled</strong>.
                </li>
                <li>
                  <strong>Explicit User Consent:</strong> Analytics cookies are only initialized after you affirmatively choose <em>"Accept All"</em> on our cookie consent banner. If you choose <em>"Essential Only"</em>, Google Analytics is disabled (<code className="font-mono text-[10px] bg-[#f4f4ea] dark:bg-[#2c2c24] px-1">ga-disable-G-90FWP0F2D3 = true</code>) and no third-party tracking scripts are executed.
                </li>
                <li>
                  <strong>Zero Advertising / Retargeting:</strong> We do not deploy third-party advertising cookies, retargeting pixels, or behavioral tracking across external websites.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] dark:text-[#f0efe6] mb-2">
                7. Contact & Data Privacy Inquiries
              </h2>
              <p>
                For any questions regarding your data privacy, security, or rights, please contact our team at{' '}
                <a href="mailto:fuenzerofficial@gmail.com" className="text-[#7d8461] dark:text-[#9ca87a] underline font-medium">
                  fuenzerofficial@gmail.com
                </a>.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-[#ecece0] dark:border-[#38382e] flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/terms"
              className="text-xs font-semibold text-[#7d8461] dark:text-[#9ca87a] hover:underline"
            >
              Read Terms of Service &rarr;
            </Link>

            <Link
              to="/login"
              className="px-4 py-2 bg-[#7d8461] hover:bg-[#6c7351] text-white text-xs font-bold uppercase tracking-wider transition"
            >
              Open Journal Studio
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
