import { JournalFramework, MoodOption } from '../types/journal';

export const JOURNAL_FRAMEWORKS: JournalFramework[] = [
  {
    id: 'free_flow',
    name: 'Free Flow Reflection',
    tagline: 'Open-ended mental decompression',
    description: 'Uncensored stream of consciousness. Gemini listens, validates, and gently expands your thoughts without agenda.',
    iconName: 'Feather',
    starterPrompt: "What's occupying your head and heart right now? Feel free to write anything freely.",
    colorClass: 'bg-[#7d8461]/10 border-[#7d8461]/30 text-[#4c5432]',
  },
  {
    id: 'stoic',
    name: 'Stoic Evening Review',
    tagline: 'Dichotomy of control & virtue',
    description: 'Filter events through the Stoic lens. Distinguish what is in your power, cultivate equanimity, and plan tomorrow with virtue.',
    iconName: 'Shield',
    starterPrompt: "Think back on today: What was within your control, what was outside it, and how did you respond?",
    colorClass: 'bg-[#9c6644]/10 border-[#9c6644]/30 text-[#7f4f24]',
  },
  {
    id: 'gratitude',
    name: 'Gratitude & Micro-Wins',
    tagline: 'Savoring the good & building resilience',
    description: 'Anchor positive neural pathways by savoring specific small moments, kind gestures, and progress you made today.',
    iconName: 'HeartHandshake',
    starterPrompt: "What are 3 distinct moments, people, or sensations from today that you feel genuine appreciation for?",
    colorClass: 'bg-[#606c38]/10 border-[#606c38]/30 text-[#283618]',
  },
  {
    id: 'problem_solving',
    name: 'Problem Deconstruction',
    tagline: 'Untangle dilemmas & make decisions',
    description: 'Break overwhelming problems into first principles, analyze hidden assumptions, and define low-risk micro-experiments.',
    iconName: 'Brain',
    starterPrompt: "What difficult decision or knotty problem are you currently facing? Describe the crux of the issue.",
    colorClass: 'bg-[#85756e]/10 border-[#85756e]/30 text-[#53463f]',
  },
  {
    id: 'emotional_clarity',
    name: 'Emotional Untangling',
    tagline: 'Name, feel, and release heavy emotions',
    description: 'A compassionate, non-judgmental space to name nuanced emotions, understand triggers, and release mental tension.',
    iconName: 'Sparkles',
    starterPrompt: "What emotions are visiting you right now? Where do you feel them in your body or mindset?",
    colorClass: 'bg-[#c86d51]/10 border-[#c86d51]/30 text-[#96472d]',
  },
  {
    id: 'future_vision',
    name: 'Future Self & Visioning',
    tagline: 'Align today with your highest self',
    description: 'Step into the mindset of your future self in 1-5 years. What choices today create the momentum you desire?',
    iconName: 'Compass',
    starterPrompt: "If you spoke to your future self 1 year from now who overcame this season, what advice would they whisper back to you?",
    colorClass: 'bg-[#b08968]/10 border-[#b08968]/30 text-[#6f4e37]',
  },
];

export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'calm', label: 'Calm & Grounded', iconName: 'Leaf', category: 'calm', bgColor: 'bg-[#7d8461]/15', textColor: 'text-[#474e2d]' },
  { id: 'inspired', label: 'Inspired & Focused', iconName: 'Sparkles', category: 'positive', bgColor: 'bg-[#ddb892]/25', textColor: 'text-[#7f4f24]' },
  { id: 'grateful', label: 'Grateful & Warm', iconName: 'Sun', category: 'positive', bgColor: 'bg-[#e9c46a]/20', textColor: 'text-[#8a6b18]' },
  { id: 'energized', label: 'Energized & Motivated', iconName: 'Sprout', category: 'positive', bgColor: 'bg-[#606c38]/15', textColor: 'text-[#283618]' },
  { id: 'pensive', label: 'Pensive & Reflective', iconName: 'Coffee', category: 'reflective', bgColor: 'bg-[#b08968]/20', textColor: 'text-[#583922]' },
  { id: 'overwhelmed', label: 'Overwhelmed & Busy', iconName: 'Wind', category: 'challenging', bgColor: 'bg-[#c86d51]/15', textColor: 'text-[#96472d]' },
  { id: 'anxious', label: 'Anxious or Hesitant', iconName: 'CloudRain', category: 'challenging', bgColor: 'bg-[#8d99ae]/20', textColor: 'text-[#434b58]' },
  { id: 'tired', label: 'Tired & Drained', iconName: 'Moon', category: 'challenging', bgColor: 'bg-[#e8e8df]', textColor: 'text-[#5c5c52]' },
];
