import React from 'react';
import { X, ShieldCheck, FileText, Lock, CheckCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#23231c] border border-[#ecece0] dark:border-[#38382e] rounded-none max-w-2xl w-full p-5 sm:p-7 shadow-xl text-[#2c2c26] dark:text-[#f0efe6] relative my-6 max-h-[85vh] flex flex-col animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#ecece0] dark:border-[#38382e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#7d8461]/10 dark:bg-[#7d8461]/25 flex items-center justify-center text-[#7d8461] dark:text-[#9ca87a]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif italic font-bold text-lg text-[#2c2c26] dark:text-[#f0efe6]">Privacy Policy</h2>
              <p className="text-[11px] text-[#5c5c52] dark:text-[#a8a89b]">Fuenzer Journal Data Protection Standards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#5c5c52] dark:text-[#9e9e90] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] hover:bg-[#f4f4ea] dark:hover:bg-[#2c2c24] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-4 text-xs sm:text-sm text-[#5c5c52] dark:text-[#a8a89b] leading-relaxed pr-1">
          <div>
            <h3 className="font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6] text-sm mb-1">
              1. Fundamental Privacy Guarantee
            </h3>
            <p>
              At <strong>Fuenzer Journal</strong>, your private reflections and journals belong solely to you. We do not sell, rent, or monetize your journal data or personal thoughts under any circumstances.
            </p>
          </div>

          <div>
            <h3 className="font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6] text-sm mb-1">
              2. User-Isolated Cloud Storage (Firestore)
            </h3>
            <p>
              Every reflection and draft is stored strictly under your isolated document path (<code className="bg-[#f4f4ea] dark:bg-[#2c2c24] px-1 py-0.5 font-mono text-[11px] text-[#4c5432] dark:text-[#c4ceaa]">/users/{'{userId}'}/journals</code>). Access is enforced at the database engine level via granular Cloud Firestore Security Rules, ensuring zero cross-user access or data leakage.
            </p>
          </div>

          <div>
            <h3 className="font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6] text-sm mb-1">
              3. AI Processing & Gemini Model Interaction
            </h3>
            <p>
              Your reflection prompts and transcripts are processed in-flight solely to provide conversational Socratic feedback, structure insights, and generate summaries. We do not use your private entries to train public foundational AI models.
            </p>
          </div>

          <div>
            <h3 className="font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6] text-sm mb-1">
              4. Authentication & Credentials
            </h3>
            <p>
              We utilize Google Federated Authentication via Firebase Auth. We never see, receive, or store your passwords. Session tokens are verified securely on every request.
            </p>
          </div>

          <div>
            <h3 className="font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6] text-sm mb-1">
              5. Data Portability & Deletion
            </h3>
            <p>
              You have complete ownership of your archive. You can export all your reflections anytime as PDF, formatted Markdown (.md), or raw JSON, and permanently delete any journal entry whenever you choose.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-[#ecece0] dark:border-[#38382e] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#7d8461] hover:bg-[#6c7351] text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export const TermsOfServiceModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#23231c] border border-[#ecece0] dark:border-[#38382e] rounded-none max-w-2xl w-full p-5 sm:p-7 shadow-xl text-[#2c2c26] dark:text-[#f0efe6] relative my-6 max-h-[85vh] flex flex-col animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#ecece0] dark:border-[#38382e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#7d8461]/10 dark:bg-[#7d8461]/25 flex items-center justify-center text-[#7d8461] dark:text-[#9ca87a]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif italic font-bold text-lg text-[#2c2c26] dark:text-[#f0efe6]">Terms of Service</h2>
              <p className="text-[11px] text-[#5c5c52] dark:text-[#a8a89b]">Fuenzer Journal Usage Guidelines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#5c5c52] dark:text-[#9e9e90] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] hover:bg-[#f4f4ea] dark:hover:bg-[#2c2c24] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-4 text-xs sm:text-sm text-[#5c5c52] dark:text-[#a8a89b] leading-relaxed pr-1">
          <div>
            <h3 className="font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6] text-sm mb-1">
              1. Intended Use & Mindful Reflection
            </h3>
            <p>
              <strong>Fuenzer Journal</strong> is an AI-powered personal journaling sanctuary designed to facilitate self-reflection, emotional decompression, problem deconstruction, and personal growth.
            </p>
          </div>

          <div>
            <h3 className="font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6] text-sm mb-1">
              2. Non-Medical / Non-Psychiatric Disclaimer
            </h3>
            <p>
              The AI thought partner provides conversational reflective prompts and structured summaries based on philosophical and cognitive frameworks (such as Stoicism or CBT reframing). <strong>Fuenzer Journal is not a medical, psychiatric, or crisis intervention service.</strong> If you are experiencing acute mental health distress or a crisis, please seek immediate guidance from licensed healthcare professionals.
            </p>
          </div>

          <div>
            <h3 className="font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6] text-sm mb-1">
              3. User Responsibilities
            </h3>
            <p>
              You are responsible for maintaining the confidentiality of your Google account credentials used to log in. You agree not to attempt to reverse engineer, disrupt, or perform malicious attacks against the infrastructure.
            </p>
          </div>

          <div>
            <h3 className="font-serif italic font-bold text-[#2c2c26] dark:text-[#f0efe6] text-sm mb-1">
              4. Service Availability & Evolution
            </h3>
            <p>
              We continuously enhance Fuenzer Journal with new journaling frameworks, analytics tools, and resilient model fallbacks to maintain high availability and delight users.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-[#ecece0] dark:border-[#38382e] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#7d8461] hover:bg-[#6c7351] text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            Accept Terms
          </button>
        </div>
      </div>
    </div>
  );
};
