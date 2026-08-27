import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X, ExternalLink } from 'lucide-react';
import {
  getCookieConsentStatus,
  setCookieConsentStatus,
  initializeGoogleAnalytics,
} from '../lib/analytics';

interface CookieBannerProps {
  onOpenPrivacyPolicy: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenPrivacyPolicy }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const status = getCookieConsentStatus();
    if (status === 'undecided') {
      setIsVisible(true);
    } else if (status === 'accepted') {
      initializeGoogleAnalytics();
    }
  }, []);

  const handleAccept = () => {
    setCookieConsentStatus('accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    setCookieConsentStatus('rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-0 left-0 right-0 w-full z-50 bg-[#ffffff]/95 dark:bg-[#1f1f1a]/95 backdrop-blur-md border-t border-[#ecece0] dark:border-[#38382e] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] text-[#2c2c26] dark:text-[#f0efe6] transition-all animate-in slide-in-from-bottom-2 duration-200"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left message & privacy info */}
        <div className="flex items-start sm:items-center gap-2.5 text-xs sm:text-[13px] leading-snug w-full md:w-auto">
          <div className="p-1.5 bg-[#7d8461]/10 dark:bg-[#7d8461]/20 text-[#7d8461] dark:text-[#9ca87a] shrink-0">
            <Cookie className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <p className="font-medium">
              We use strictly privacy-conscious analytics and essential storage to ensure offline draft survival and app performance.
            </p>
            <p className="text-[11px] text-[#5c5c52] dark:text-[#a8a89b]">
              Your personal reflections and thoughts remain 100% private and are never monetized or shared. Read our{' '}
              <button
                type="button"
                onClick={onOpenPrivacyPolicy}
                className="underline text-[#7d8461] dark:text-[#9ca87a] hover:text-[#585e42] dark:hover:text-[#b8c59f] font-semibold cursor-pointer inline-flex items-center gap-0.5"
              >
                <span>Privacy Policy</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>{' '}
              for full details.
            </p>
          </div>
        </div>

        {/* Right CTA Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
          <button
            type="button"
            onClick={handleReject}
            className="flex-1 md:flex-none px-3.5 py-1.5 bg-[#f4f4ea] dark:bg-[#2c2c24] hover:bg-[#ecece0] dark:hover:bg-[#35352c] text-[#5c5c52] dark:text-[#a8a89b] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] border border-[#d8d8cc] dark:border-[#424236] text-xs font-semibold uppercase tracking-wider rounded-none transition cursor-pointer"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 md:flex-none px-4 py-1.5 bg-[#7d8461] hover:bg-[#6c7351] text-white text-xs font-bold uppercase tracking-wider rounded-none shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Accept All</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
