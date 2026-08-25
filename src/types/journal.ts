export type JournalFrameworkId =
  | 'free_flow'
  | 'stoic'
  | 'gratitude'
  | 'problem_solving'
  | 'emotional_clarity'
  | 'future_vision';

export interface JournalFramework {
  id: JournalFrameworkId;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  starterPrompt: string;
  colorClass: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface JournalSummary {
  title: string;
  executiveSummary: string;
  keyInsights: string[];
  actionItems: string[];
  detectedMood: string;
  themes: string[];
  closingAffirmation: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  framework: JournalFrameworkId;
  initialMood?: string;
  detectedMood?: string;
  themes: string[];
  executiveSummary: string;
  keyInsights: string[];
  actionItems: string[];
  closingAffirmation?: string;
  transcript: ChatMessage[];
  wordCount: number;
  pinned?: boolean;
}

export interface MoodOption {
  id: string;
  label: string;
  iconName: string;
  category: 'positive' | 'reflective' | 'challenging' | 'calm';
  bgColor: string;
  textColor: string;
}

export interface UserStats {
  totalEntries: number;
  currentStreak: number;
  totalWords: number;
  topMoods: { mood: string; count: number }[];
  frameworkUsage: { framework: string; count: number }[];
  lastJournalDate?: number;
}
