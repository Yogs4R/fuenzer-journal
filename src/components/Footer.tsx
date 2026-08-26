import React, { useState } from 'react';
import { BookOpen, ShieldCheck, Mail, Lock, Heart } from 'lucide-react';
import { PrivacyPolicyModal, TermsOfServiceModal } from './LegalModals';
import { SecurityModal } from './SecurityModal';

export const Footer: React.FC = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);

  return (
    <footer className="relative z-10 bg-white border-t border-[#ecece0] text-[#5c5c52] mt-auto">
      {/* Upper Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#7d8461] rounded-none flex items-center justify-center text-white shadow-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-serif italic font-bold text-base text-[#2c2c26]">
                Fuenzer Journal
              </span>
            </div>
            <p className="text-xs text-[#5c5c52] leading-relaxed max-w-md">
              A private, AI-powered mindful reflection sanctuary. Cultivating clarity, emotional intelligence, and deliberate self-discovery through conversational Socratic thought partnership and isolated cloud vaults.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#7d8461] font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Owner-bound Firestore • End-to-end user isolation</span>
            </div>
          </div>

          {/* Col 2: Legal & Security Links */}
          <div className="space-y-2.5">
            <h3 className="font-serif italic font-bold text-xs uppercase tracking-wider text-[#2c2c26]">
              Trust & Legal
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setShowPrivacy(true)}
                  className="hover:text-[#7d8461] hover:underline transition cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowTerms(true)}
                  className="hover:text-[#7d8461] hover:underline transition cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowSecurity(true)}
                  className="hover:text-[#7d8461] hover:underline transition cursor-pointer text-left"
                >
                  Security Architecture
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Connect & Social Channels */}
          <div className="space-y-2.5">
            <h3 className="font-serif italic font-bold text-xs uppercase tracking-wider text-[#2c2c26]">
              Connect & Developer
            </h3>
            <div className="flex flex-col gap-2 text-xs">
              {/* LinkedIn Button */}
              <a
                href="https://linkedin.com/in/ridwansuryantara"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none bg-[#f4f4ea] hover:bg-[#ecece0] text-[#2c2c26] border border-[#e8e8df] hover:border-[#7d8461] transition font-medium text-xs"
                title="Connect on LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-[#0a66c2]" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.2a1.64 1.64 0 0 0-1.66 1.64c0 .9.74 1.64 1.66 1.64a1.64 1.64 0 0 0 1.64-1.64A1.64 1.64 0 0 0 7.83 6.2z" />
                </svg>
                <span>LinkedIn</span>
              </a>

              {/* GitHub Button */}
              <a
                href="https://github.com/Yogs4R/fuenzer-journal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none bg-[#f4f4ea] hover:bg-[#ecece0] text-[#2c2c26] border border-[#e8e8df] hover:border-[#7d8461] transition font-medium text-xs"
                title="View Source on GitHub"
              >
                <svg className="w-3.5 h-3.5 fill-[#24292e]" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>GitHub Repository</span>
              </a>

              {/* Email Contact Button */}
              <a
                href="mailto:fuenzerofficial@gmail.com"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none bg-[#f4f4ea] hover:bg-[#ecece0] text-[#2c2c26] border border-[#e8e8df] hover:border-[#7d8461] transition font-medium text-xs"
                title="Send an Email to Support"
              >
                <Mail className="w-3.5 h-3.5 text-[#7d8461]" />
                <span className="truncate">fuenzerofficial@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="border-t border-[#ecece0] bg-[#fbfaf5] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#5c5c52]">
          <div className="flex items-center gap-1.5">
            <span className="font-serif italic">Fuenzer Journal</span>
            <span>&copy; 2026. Empowering mindful reflection and personal clarity.</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-[#7d8461] font-medium">
              <Lock className="w-3 h-3" />
              <span>Encrypted Firebase Infrastructure</span>
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsOfServiceModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <SecurityModal isOpen={showSecurity} onClose={() => setShowSecurity(false)} />
    </footer>
  );
};
