export type Language = 'en' | 'fr' | 'ar';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
  correction?: {
    correctedText: string;
    explanation: string;
  } | null;
  pronunciationScore?: number;
}

export interface Flashcard {
  id: string;
  word: string;
  translation: string;
  example: string;
  language: Language;
}

export interface UserGoals {
  wordsPerWeek: number;
  streakTarget: number;
}

export interface UserProgress {
  xp: number;
  streak: number;
  lastSessionDate: string | null;
  wordsLearned: number;
  avgPronunciationScore: number;
  sessionCount: number;
  username: string;
  avatar: string;
  goals: UserGoals;
  weeklyWordsLearned: {
    count: number;
    startDate: string; // ISO string for the start of the week
  };
}

export interface GeminiResponse {
  response: string;
  correction: {
    hasError: boolean;
    correctedText: string;
    explanation: string;
  } | null;
  newVocabulary: Omit<Flashcard, 'id' | 'language'>[];
  replySuggestions: string[];
}

export interface Conversation {
  id: string;
  startTime: number;
  language: Language;
  messages: Message[];
}

declare global {
    interface Window {
      jspdf: any;
    }
}