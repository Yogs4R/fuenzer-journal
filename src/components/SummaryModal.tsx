import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Plus,
  Trash2,
  Tag,
  Smile,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { JournalFrameworkId, JournalSummary, ChatMessage, JournalEntry } from '../types/journal';
import { saveJournalToFirestore } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: JournalSummary | null;
  transcript: ChatMessage[];
  framework: JournalFrameworkId;
  initialMood?: string;
  onSavedSuccessfully: (savedEntry: JournalEntry) => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  transcript,
  framework,
  initialMood,
  onSavedSuccessfully,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(summary?.title || 'Reflective Journal Entry');
  const [executiveSummary, setExecutiveSummary] = useState(summary?.executiveSummary || '');
  const [keyInsights, setKeyInsights] = useState<string[]>(summary?.keyInsights || []);
  const [newInsight, setNewInsight] = useState('');
  const [actionItems, setActionItems] = useState<string[]>(summary?.actionItems || []);
  const [newAction, setNewAction] = useState('');
  const [detectedMood, setDetectedMood] = useState(summary?.detectedMood || initialMood || 'Reflective');
  const [themes, setThemes] = useState<string[]>(summary?.themes || ['Reflection']);
  const [newTheme, setNewTheme] = useState('');
  const [closingAffirmation, setClosingAffirmation] = useState(summary?.closingAffirmation || '');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync state when summary changes
  React.useEffect(() => {
    if (summary) {
      setTitle(summary.title || 'Reflective Journal Entry');
      setExecutiveSummary(summary.executiveSummary || '');
      setKeyInsights(summary.keyInsights || []);
      setActionItems(summary.actionItems || []);
      setDetectedMood(summary.detectedMood || initialMood || 'Reflective');
      setThemes(summary.themes || ['Reflection']);
      setClosingAffirmation(summary.closingAffirmation || '');
    }
  }, [summary, initialMood]);

  if (!isOpen || !summary) return null;

  const handleAddInsight = () => {
    if (newInsight.trim()) {
      setKeyInsights([...keyInsights, newInsight.trim()]);
      setNewInsight('');
    }
  };

  const handleRemoveInsight = (index: number) => {
    setKeyInsights(keyInsights.filter((_, idx) => idx !== index));
  };

  const handleAddAction = () => {
    if (newAction.trim()) {
      setActionItems([...actionItems, newAction.trim()]);
      setNewAction('');
    }
  };

  const handleRemoveAction = (index: number) => {
    setActionItems(actionItems.filter((_, idx) => idx !== index));
  };

  const handleAddTheme = () => {
    if (newTheme.trim() && !themes.includes(newTheme.trim())) {
      setThemes([...themes, newTheme.trim().replace(/^#/, '')]);
      setNewTheme('');
    }
  };

  const handleRemoveTheme = (index: number) => {
    setThemes(themes.filter((_, idx) => idx !== index));
  };

  const calculateTotalWords = () => {
    return transcript.reduce((acc, msg) => {
      return acc + (msg.content.trim().split(/\s+/).filter(Boolean).length || 0);
    }, 0);
  };

  const handleConfirmSave = async () => {
    if (!user) {
      setSaveError('You must be signed in to save entries.');
      return;
    }

    setSaving(true);
    setSaveError(null);

    const now = Date.now();
    const entryId = `journal_${now}_${Math.random().toString(36).substring(2, 8)}`;

    const newEntry: JournalEntry = {
      id: entryId,
      userId: user.uid,
      title: title.trim() || 'Untitled Reflection',
      createdAt: now,
      updatedAt: now,
      framework,
      initialMood: initialMood || undefined,
      detectedMood: detectedMood.trim() || undefined,
      themes: themes.length > 0 ? themes : ['Reflection'],
      executiveSummary: executiveSummary.trim(),
      keyInsights: keyInsights.filter(Boolean),
      actionItems: actionItems.filter(Boolean),
      closingAffirmation: closingAffirmation.trim() || undefined,
      transcript,
      wordCount: calculateTotalWords(),
      pinned: false,
    };

    try {
      await saveJournalToFirestore(user.uid, newEntry);

      // Trigger celebratory confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#7d8461', '#ddb892', '#3a3a30', '#c86d51'],
      });

      onSavedSuccessfully(newEntry);
    } catch (err: any) {
      console.error('Error saving journal entry to Firestore:', err);
      setSaveError(err?.message || 'Failed to save to Firestore. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#2c2c26]/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#ecece0] rounded-none max-w-3xl w-full p-4 sm:p-6 shadow-xl text-[#2c2c26] relative my-4 animate-in fade-in duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#5c5c52] hover:text-[#2c2c26] p-1.5 rounded-none hover:bg-[#f4f4ea] transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#ecece0]">
          <div className="w-9 h-9 bg-[#7d8461] text-white rounded-none flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-serif italic font-bold text-[#2c2c26]">
                Synthesized Journal Summary
              </h2>
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-[#7d8461]/10 text-[#4c5432] border border-[#7d8461]/25 rounded-none font-bold">
                Distillation
              </span>
            </div>
            <p className="text-xs text-[#5c5c52] mt-0.5">
              Review and customize your takeaways before saving to your personal journal.
            </p>
          </div>
        </div>

        {saveError && (
          <div className="mb-3 p-3 bg-[#c86d51]/10 border border-[#c86d51]/30 rounded-none text-[#96472d] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Title Field */}
          <div>
            <label className="block text-[10px] font-bold text-[#7d8461] uppercase tracking-wider mb-1">
              Reflection Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#f4f4ea]/40 border border-[#ecece0] focus:border-[#7d8461] rounded-none px-3 py-2 text-sm sm:text-base font-serif italic font-bold text-[#2c2c26] focus:outline-none transition"
              placeholder="Give this reflection a title..."
            />
          </div>

          {/* Executive Summary Field */}
          <div>
            <label className="block text-[10px] font-bold text-[#7d8461] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#7d8461]" />
              <span>Executive Synthesis</span>
            </label>
            <textarea
              rows={3}
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              className="w-full bg-[#f4f4ea]/40 border border-[#ecece0] focus:border-[#7d8461] rounded-none px-3 py-2 text-xs sm:text-sm text-[#2c2c26] focus:outline-none transition leading-relaxed resize-none"
              placeholder="Summary of this conversation..."
            />
          </div>

          {/* Key Insights & Revelations */}
          <div>
            <label className="block text-[10px] font-bold text-[#7d8461] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-[#7d8461]" />
              <span>Key Insights & Realizations</span>
            </label>
            <div className="space-y-1.5 mb-2">
              {keyInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2.5 bg-[#f4f4ea] rounded-none border border-[#ecece0] text-xs text-[#2c2c26]"
                >
                  <div className="flex items-start gap-2 flex-1">
                    <span className="text-[#7d8461] font-bold">•</span>
                    <span>{insight}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveInsight(idx)}
                    className="text-[#5c5c52] hover:text-[#96472d] p-1 rounded-none transition cursor-pointer"
                    title="Remove insight"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newInsight}
                onChange={(e) => setNewInsight(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInsight())}
                placeholder="Add key insight..."
                className="flex-1 bg-[#f4f4ea]/40 border border-[#ecece0] focus:border-[#7d8461] rounded-none px-3 py-1.5 text-xs text-[#2c2c26] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddInsight}
                className="px-3 py-1.5 bg-[#f4f4ea] hover:bg-[#ecece0] text-[#2c2c26] rounded-none text-xs font-bold border border-[#e8e8df] flex items-center gap-1 cursor-pointer transition uppercase text-[10px]"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Action Items / Intentions */}
          <div>
            <label className="block text-[10px] font-bold text-[#7d8461] uppercase tracking-wider mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#7d8461]" />
              <span>Next Steps & Intentions</span>
            </label>
            <div className="space-y-1.5 mb-2">
              {actionItems.map((action, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2.5 bg-[#f4f4ea] rounded-none border border-[#ecece0] text-xs text-[#2c2c26]"
                >
                  <div className="flex items-start gap-2 flex-1">
                    <span className="text-[#7d8461] font-bold">✓</span>
                    <span>{action}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveAction(idx)}
                    className="text-[#5c5c52] hover:text-[#96472d] p-1 rounded-none transition cursor-pointer"
                    title="Remove action"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAction())}
                placeholder="Add next step..."
                className="flex-1 bg-[#f4f4ea]/40 border border-[#ecece0] focus:border-[#7d8461] rounded-none px-3 py-1.5 text-xs text-[#2c2c26] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddAction}
                className="px-3 py-1.5 bg-[#f4f4ea] hover:bg-[#ecece0] text-[#2c2c26] rounded-none text-xs font-bold border border-[#e8e8df] flex items-center gap-1 cursor-pointer transition uppercase text-[10px]"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Mood & Theme Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#7d8461] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Smile className="w-3 h-3 text-[#7d8461]" />
                <span>Emotional Tone</span>
              </label>
              <input
                type="text"
                value={detectedMood}
                onChange={(e) => setDetectedMood(e.target.value)}
                className="w-full bg-[#f4f4ea]/40 border border-[#ecece0] focus:border-[#7d8461] rounded-none px-3 py-1.5 text-xs text-[#2c2c26] focus:outline-none font-medium"
                placeholder="e.g. Peaceful Clarity, Energized"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#7d8461] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#7d8461]" />
                <span>Thematic Tags</span>
              </label>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {themes.map((theme, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none bg-[#f4f4ea] border border-[#e8e8df] text-[#2c2c26] text-[11px] font-medium"
                  >
                    #{theme}
                    <button
                      onClick={() => handleRemoveTheme(idx)}
                      className="hover:text-[#96472d] transition cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTheme())}
                  placeholder="Add tag..."
                  className="flex-1 bg-[#f4f4ea]/40 border border-[#ecece0] focus:border-[#7d8461] rounded-none px-3 py-1 text-xs text-[#2c2c26] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTheme}
                  className="px-2.5 py-1 bg-[#f4f4ea] hover:bg-[#ecece0] text-[#2c2c26] rounded-none text-xs font-bold border border-[#e8e8df] cursor-pointer transition"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Closing Affirmation */}
          {closingAffirmation && (
            <div className="p-3 bg-[#ddb892]/15 rounded-none border border-[#ddb892]/30 text-xs italic text-[#7f4f24]">
              <span className="font-bold not-italic block mb-0.5 uppercase tracking-wider text-[9px]">Closing Thought:</span>
              &ldquo;{closingAffirmation}&rdquo;
            </div>
          )}

          {/* Metadata preview */}
          <div className="flex items-center justify-between text-[10px] text-[#5c5c52] pt-2 border-t border-[#ecece0]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-[#7d8461]" />
              <span>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <span>{transcript.length} turns • ~{calculateTotalWords()} words</span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-4 pt-3 border-t border-[#ecece0] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 bg-[#f4f4ea] hover:bg-[#ecece0] text-[#2c2c26] rounded-none text-xs font-bold transition cursor-pointer disabled:opacity-50 uppercase tracking-wider"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleConfirmSave}
            disabled={saving}
            className="px-5 py-2 bg-[#7d8461] hover:bg-[#6c7351] text-white rounded-none text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 uppercase tracking-wider"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Reflection</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
