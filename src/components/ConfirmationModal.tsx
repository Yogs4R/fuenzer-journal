import React from 'react';
import { AlertTriangle, Trash2, X, Sparkles, HelpCircle } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  icon?: 'trash' | 'alert' | 'save';
  secondaryAction?: {
    label: string;
    onClick: () => void;
    className?: string;
  };
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  icon = 'trash',
  secondaryAction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#23231c] border border-[#ecece0] dark:border-[#38382e] p-5 sm:p-6 shadow-2xl rounded-none text-[#2c2c26] dark:text-[#f0efe6] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-[#5c5c52] dark:text-[#9e9e90] hover:text-[#2c2c26] dark:hover:text-[#f0efe6] transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div
            className={`w-9 h-9 rounded-none flex items-center justify-center shrink-0 ${
              variant === 'danger'
                ? 'bg-[#c86d51]/15 text-[#96472d] dark:bg-[#c86d51]/25 dark:text-[#e07a5f]'
                : variant === 'warning'
                ? 'bg-[#e9c46a]/20 text-[#8a6b18] dark:bg-[#e9c46a]/30 dark:text-[#f4a261]'
                : 'bg-[#7d8461]/15 text-[#4c5432] dark:bg-[#7d8461]/30 dark:text-[#9ca87a]'
            }`}
          >
            {icon === 'trash' && <Trash2 className="w-4 h-4" />}
            {icon === 'alert' && <AlertTriangle className="w-4 h-4" />}
            {icon === 'save' && <Sparkles className="w-4 h-4" />}
          </div>

          <div className="min-w-0 flex-1 pr-4">
            <h3 className="font-serif italic font-bold text-base sm:text-lg text-[#2c2c26] dark:text-[#f0efe6] leading-tight">
              {title}
            </h3>
            <p className="text-xs text-[#5c5c52] dark:text-[#a8a89b] mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[#ecece0] dark:border-[#38382e]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[#f4f4ea] dark:bg-[#2c2c24] hover:bg-[#ecece0] dark:hover:bg-[#35352c] text-[#2c2c26] dark:text-[#d8d8cc] border border-[#e8e8df] dark:border-[#424236] text-xs font-bold transition cursor-pointer uppercase tracking-wider"
          >
            {cancelLabel}
          </button>

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className={`px-3.5 py-1.5 text-xs font-bold transition cursor-pointer uppercase tracking-wider ${
                secondaryAction.className ||
                'bg-[#f4f4ea] dark:bg-[#2c2c24] text-[#2c2c26] dark:text-[#d8d8cc] border border-[#e8e8df] dark:border-[#424236]'
              }`}
            >
              {secondaryAction.label}
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-1.5 text-xs font-bold transition cursor-pointer shadow-xs uppercase tracking-wider ${
              variant === 'danger'
                ? 'bg-[#c86d51] hover:bg-[#b05c42] text-white'
                : variant === 'warning'
                ? 'bg-[#8a6b18] hover:bg-[#725712] text-white'
                : 'bg-[#7d8461] hover:bg-[#6c7351] text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
