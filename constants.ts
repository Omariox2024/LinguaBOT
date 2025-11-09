
import { LanguageOption, UserProgress } from './types';

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦' },
];

// Helper to get the start of the week (Monday)
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  // Adjust when day is Sunday (0) to treat Monday (1) as the start
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(d.setDate(diff));
};

const startOfWeek = getStartOfWeek(new Date());
startOfWeek.setHours(0, 0, 0, 0);

export const INITIAL_USER_PROGRESS: UserProgress = {
  xp: 0,
  streak: 0,
  lastSessionDate: null,
  wordsLearned: 0,
  avgPronunciationScore: 0,
  sessionCount: 0,
  username: 'Learner',
  avatar: '👤',
  goals: {
    wordsPerWeek: 10,
    streakTarget: 7,
  },
  weeklyWordsLearned: {
    count: 0,
    startDate: startOfWeek.toISOString(),
  },
};

export const GREETING_MESSAGES: { [key in 'en' | 'fr' | 'ar']: string } = {
  en: "Hello! Let's practice English. How was your day?",
  fr: "Bonjour! Pratiquons le français. Comment s'est passée ta journée?",
  ar: "مرحباً! لنتمرن على اللغة العربية. كيف كان يومك؟",
};

export const AVATAR_OPTIONS = ['👤', '😊', '🧑‍💻', '🎓', '🌟', '🤔', '🚀', '💡', '🌍'];