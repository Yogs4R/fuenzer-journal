import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Lock, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';
import { Footer } from '../components/Footer';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fbfaf5] text-[#2c2c26] flex flex-col justify-between selection:bg-[#7d8461] selection:text-white">
      {/* Top Header */}
      <header className="bg-white border-b border-[#ecece0] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
            className="flex items-center gap-1.5 text-xs font-semibold text-[#5c5c52] hover:text-[#2c2c26] bg-[#f4f4ea] hover:bg-[#ecece0] border border-[#e8e8df] px-3 py-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        <div className="bg-white border border-[#ecece0] p-6 sm:p-10 shadow-xs">
          <div className="flex items-center gap-3 pb-5 border-b border-[#ecece0] mb-6">
            <div className="w-10 h-10 bg-[#7d8461]/10 flex items-center justify-center text-[#7d8461] border border-[#7d8461]/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif italic font-bold text-2xl sm:text-3xl text-[#2c2c26]">
                Privacy Policy
              </h1>
              <p className="text-xs text-[#5c5c52] mt-0.5">
                Effective Date: January 1, 2026 &bull; Fuenzer Journal Trust & Data Standards
              </p>
            </div>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-[#5c5c52] leading-relaxed">
            <div className="p-4 bg-[#7d8461]/5 border border-[#7d8461]/20">
              <p className="font-medium text-[#2c2c26]">
                Your personal journal is an intimate and sacred space. We operate on a strict <strong>Zero Data Monetization</strong> policy: your thoughts, reflections, and personal entries are yours alone.
              </p>
            </div>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] mb-2">
                1. Fundamental Privacy Guarantee
              </h2>
              <p>
                At <strong>Fuenzer Journal</strong> (operated by Fuenzer Sports), we believe personal reflection requires complete psychological safety. We do not sell, rent, license, or monetize your journal data, prompts, or reflections under any circumstances.
              </p>
            </section>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] mb-2">
                2. User-Isolated Cloud Storage (Firestore)
              </h2>
              <p>
                Every reflection, draft, and synthesis is saved strictly under your unique document path (<code className="bg-[#f4f4ea] px-1 py-0.5 font-mono text-[11px] text-[#4c5432]">/users/{'{userId}'}/journals/*</code>). Database-level Cloud Firestore Security Rules enforce that only authenticated requests matching your specific user ID can read, modify, or delete your entries. Cross-user queries are physically blocked.
              </p>
            </section>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] mb-2">
                3. AI Processing & Gemini Model Interaction
              </h2>
              <p>
                Your reflection prompts and transcripts are processed in-flight via secure, server-side proxies solely to provide conversational Socratic inquiries, sentiment recognition, and structured summaries. Your private journals are <strong>never used to train public foundational AI models</strong>.
              </p>
            </section>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] mb-2">
                4. Authentication & Credentials
              </h2>
              <p>
                We use Google Federated Authentication via Firebase Auth. We never receive, store, or manage user passwords. Session tokens are securely authenticated via HTTPS and verified on every server request.
              </p>
            </section>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] mb-2">
                5. Data Ownership, Portability & Deletion
              </h2>
              <p>
                You retain 100% intellectual property and ownership over every word you write. You can export your entire journal archive at any time in formatted Markdown (.md), PDF, or raw JSON. When you delete a journal entry, it is permanently erased from your database vault.
              </p>
            </section>

            <section>
              <h2 className="font-serif italic font-bold text-base text-[#2c2c26] mb-2">
                6. Contact & Data Privacy Inquiries
              </h2>
              <p>
                For any questions regarding your data privacy, security, or rights, please contact our team at{' '}
                <a href="mailto:fuenzerofficial@gmail.com" className="text-[#7d8461] underline font-medium">
                  fuenzerofficial@gmail.com
                </a>.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-[#ecece0] flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/terms"
              className="text-xs font-semibold text-[#7d8461] hover:underline"
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
