
import React from 'react';
import { Language, LanguageOption, UserProgress } from '../types';
import { LANGUAGE_OPTIONS } from '../constants';
import BookIcon from './icons/BookIcon';
import ChartIcon from './icons/ChartIcon';
import FireIcon from './icons/FireIcon';
import HistoryIcon from './icons/HistoryIcon';
import ExportIcon from './icons/ExportIcon';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  userProgress: UserProgress;
  onOpenDashboard: () => void;
  onOpenFlashcards: () => void;
  onOpenHistory: () => void;
  onOpenProfile: () => void;
  onExportCurrentConversation: () => void;
  flashcardCount: number;
}

const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  userProgress,
  onOpenDashboard,
  onOpenFlashcards,
  onOpenHistory,
  onOpenProfile,
  onExportCurrentConversation,
  flashcardCount
}) => {
  const currentLangOption = LANGUAGE_OPTIONS.find(opt => opt.code === currentLanguage);

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-md sticky top-0 z-20 p-3 sm:p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
          LinguaBot AI
        </h1>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
            <button onClick={onExportCurrentConversation} className="p-2 rounded-full hover:bg-gray-200 transition-colors" title="Export current conversation">
              <ExportIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button onClick={onOpenHistory} className="p-2 rounded-full hover:bg-gray-200 transition-colors" title="View Conversation History">
              <HistoryIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button onClick={onOpenDashboard} className="p-2 rounded-full hover:bg-gray-200 transition-colors" title="View Progress Dashboard">
              <ChartIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button onClick={onOpenFlashcards} className="relative p-2 rounded-full hover:bg-gray-200 transition-colors" title="View Flashcard Collection">
              <BookIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              {flashcardCount > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold ring-2 ring-white">
                  {flashcardCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-1 text-orange-500 font-bold" title={`${userProgress.streak} day streak`}>
              <FireIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>{userProgress.streak}</span>
            </div>
             <button
              onClick={onOpenProfile}
              title="Edit your profile"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg sm:text-xl hover:ring-2 hover:ring-brand-primary transition-all"
            >
              {userProgress.avatar}
            </button>
          </div>
          
          <select
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            title="Change conversation language"
            className="bg-gray-100 border-2 border-gray-200 rounded-lg py-2 px-3 text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.flag} {opt.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;