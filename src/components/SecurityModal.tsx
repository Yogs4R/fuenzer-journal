import React from 'react';
import { ShieldCheck, Lock, KeyRound, Database, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2c2c26]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#ecece0] rounded-none max-w-2xl w-full p-5 sm:p-7 shadow-xl text-[#2c2c26] overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#5c5c52] hover:text-[#2c2c26] p-1.5 rounded-none hover:bg-[#f4f4ea] transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#ecece0]">
          <div className="w-9 h-9 bg-[#7d8461]/10 text-[#7d8461] rounded-none flex items-center justify-center border border-[#7d8461]/25">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-serif italic font-bold text-[#2c2c26]">
              Zero Data Leakage Architecture
            </h2>
            <p className="text-xs text-[#5c5c52]">Strict isolation & end-to-end user privacy guarantee</p>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-[#5c5c52]">
          <div className="p-3.5 bg-[#fbfaf5] rounded-none border border-[#ecece0] flex gap-3">
            <Lock className="w-4 h-4 text-[#7d8461] shrink-0 mt-0.5" />
            <div>
              <p className="font-serif italic font-bold text-[#2c2c26] text-xs sm:text-sm">Owner-Bound Path Checking</p>
              <p className="text-xs text-[#5c5c52] mt-0.5 leading-relaxed">
                Your entries are stored strictly under <code className="bg-[#f4f4ea] px-1.5 py-0.5 rounded-none text-[#4c5432] font-mono text-[10px] sm:text-[11px] border border-[#ecece0]">/users/{user?.uid || '{userId}'}/journals/*</code>. Firestore security rules enforce that only requests with matching JWT tokens can read or write documents.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-[#fbfaf5] rounded-none border border-[#ecece0] flex gap-3">
            <Database className="w-4 h-4 text-[#7d8461] shrink-0 mt-0.5" />
            <div className="w-full">
              <p className="font-serif italic font-bold text-[#2c2c26] text-xs sm:text-sm">Active Firestore Security Rules</p>
              <pre className="mt-1.5 bg-[#f4f4ea] p-2.5 rounded-none text-[11px] text-[#283618] font-mono overflow-x-auto border border-[#ecece0]">
{`match /users/{userId}/journals/{journalId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}`}
              </pre>
            </div>
          </div>

          <div className="p-3.5 bg-[#fbfaf5] rounded-none border border-[#ecece0] flex gap-3">
            <KeyRound className="w-4 h-4 text-[#9c6644] shrink-0 mt-0.5" />
            <div>
              <p className="font-serif italic font-bold text-[#2c2c26] text-xs sm:text-sm">Server-Side Secret Management</p>
              <p className="text-xs text-[#5c5c52] mt-0.5 leading-relaxed">
                API tokens and server credentials are never shipped to client browser bundles. All generative calls route through authenticated backend proxies.
              </p>
            </div>
          </div>

          <div className="bg-[#7d8461]/10 border border-[#7d8461]/25 rounded-none p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7d8461] shrink-0" />
              <span className="text-xs text-[#4c5432] font-medium">
                UID: <span className="font-mono text-[#283618]">{user?.uid || 'Not signed in'}</span>
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-none bg-[#7d8461] text-white font-bold">
              Isolated
            </span>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#3a3a30] hover:bg-[#2c2c26] text-[#fbfaf5] rounded-none text-xs font-bold transition cursor-pointer uppercase tracking-wider shadow-xs"
          >
            Close & Return
          </button>
        </div>
      </div>
    </div>
  );
};
