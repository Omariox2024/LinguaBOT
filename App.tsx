
import React, { useState, useEffect, useCallback } from 'react';
import { Language, Message, Flashcard, UserProgress, Conversation, UserGoals } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getAiResponse } from './services/geminiService';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import DashboardModal from './components/DashboardModal';
import FlashcardsModal from './components/FlashcardsModal';
import ConversationHistoryModal from './components/ConversationHistoryModal';
import ProfileModal from './components/ProfileModal';
import GoalSettingModal from './components/GoalSettingModal';
import { INITIAL_USER_PROGRESS, GREETING_MESSAGES } from './constants';
import { exportConversationToPDF } from './utils/pdfExport';

// Helper to get the start of the week (Monday)
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  // Adjust when day is Sunday (0) to treat Monday (1) as the start
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};


const App: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useLocalStorage<Language>('lang', 'en');
  const [messages, setMessages] = useLocalStorage<Message[]>('messages_v2', []);
  const [flashcards, setFlashcards] = useLocalStorage<Flashcard[]>('flashcards_v2', []);
  const [userProgress, setUserProgress] = useLocalStorage<UserProgress>('progress_v3', INITIAL_USER_PROGRESS);
  const [conversationHistory, setConversationHistory] = useLocalStorage<Conversation[]>('conversation_history_v1', []);
  
  const [isLoading, setIsLoading] = useState(false);
  const [replySuggestions, setReplySuggestions] = useState<string[]>([]);
  
  const [isDashboardOpen, setDashboardOpen] = useState(false);
  const [isFlashcardsOpen, setFlashcardsOpen] = useState(false);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);

  const saveCurrentConversation = useCallback(() => {
    // Only save if there's more than the initial greeting message
    if (messages.length > 1) {
      const conversationToSave: Conversation = {
        id: `conv-${messages[0].timestamp}`, // Use timestamp of first message as a unique ID
        startTime: messages[0].timestamp,
        language: currentLanguage,
        messages: messages,
      };

      setConversationHistory(prev => {
        const historyWithoutCurrent = prev.filter(c => c.id !== conversationToSave.id);
        return [conversationToSave, ...historyWithoutCurrent];
      });
    }
  }, [messages, currentLanguage, setConversationHistory]);

  const updateStreak = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    if (userProgress.lastSessionDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const newStreak = userProgress.lastSessionDate === yesterdayStr ? userProgress.streak + 1 : 1;
      setUserProgress(prev => ({ ...prev, streak: newStreak, lastSessionDate: today }));
    }
  }, [userProgress.lastSessionDate, userProgress.streak, setUserProgress]);

  const addInitialMessage = useCallback((lang: Language) => {
    setMessages([{
      id: `ai-greeting-${lang}-${Date.now()}`,
      text: GREETING_MESSAGES[lang],
      sender: 'ai',
      timestamp: Date.now()
    }]);
  }, [setMessages]);

  useEffect(() => {
    const langDirection = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = langDirection;
    if (messages.length === 0) {
      addInitialMessage(currentLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage]);

  // Save conversation on component unmount (e.g., tab close)
  useEffect(() => {
    return () => {
      saveCurrentConversation();
    };
  }, [saveCurrentConversation]);

  const handleSendMessage = async (text: string, confidence?: number) => {
    if (isLoading) return;

    updateStreak();

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: Date.now(),
      pronunciationScore: confidence,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setReplySuggestions([]);
    
    try {
      const aiResult = await getAiResponse(newMessages, text, currentLanguage);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: aiResult.response,
        sender: 'ai',
        timestamp: Date.now(),
      };

      if (aiResult.correction && aiResult.correction.hasError) {
        // Find the last user message and add correction to it.
        const lastUserMessageIndex = newMessages.length - 1;
        newMessages[lastUserMessageIndex].correction = {
            correctedText: aiResult.correction.correctedText,
            explanation: aiResult.correction.explanation,
        };
      }
      
      setMessages([...newMessages, aiMessage]);

      if (aiResult.newVocabulary && aiResult.newVocabulary.length > 0) {
        const newFlashcards = aiResult.newVocabulary.map(v => ({
          ...v,
          id: `fc-${Date.now()}-${v.word}`,
          language: currentLanguage,
        }));
        setFlashcards(prev => [...prev, ...newFlashcards]);
      }
      
      setReplySuggestions(aiResult.replySuggestions || []);

      // Update progress
      setUserProgress(prev => {
        const newXp = prev.xp + 10 + (aiResult.newVocabulary.length * 5);
        const wordsLearned = prev.wordsLearned + aiResult.newVocabulary.length;
        let newAvgScore = prev.avgPronunciationScore;
        let newSessionCount = prev.sessionCount;
        if(confidence) {
            newAvgScore += confidence;
            newSessionCount += 1;
        }

        // Goal tracking logic
        const wordsJustLearned = aiResult.newVocabulary.length;
        const now = new Date();
        const startOfThisWeek = getStartOfWeek(now);
        const startOfTrackedWeek = new Date(prev.weeklyWordsLearned.startDate);
        
        let newWeeklyWordCount = prev.weeklyWordsLearned.count;
        let newWeekStartDate = prev.weeklyWordsLearned.startDate;

        if (startOfThisWeek.getTime() !== startOfTrackedWeek.getTime()) {
            // It's a new week, reset the counter
            newWeeklyWordCount = wordsJustLearned;
            newWeekStartDate = startOfThisWeek.toISOString();
        } else {
            newWeeklyWordCount += wordsJustLearned;
        }

        return {
          ...prev, 
          xp: newXp, 
          wordsLearned, 
          avgPronunciationScore: newAvgScore, 
          sessionCount: newSessionCount,
          weeklyWordsLearned: {
              count: newWeeklyWordCount,
              startDate: newWeekStartDate
          }
        };
      });

    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        text: "Sorry, I couldn't connect. Please check your connection or API key.",
        sender: 'ai',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    saveCurrentConversation();
    setCurrentLanguage(lang);
    setMessages([]);
    setReplySuggestions([]);
    addInitialMessage(lang);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
      handleSendMessage(suggestion);
  };

  const handleLoadConversation = (conversation: Conversation) => {
    saveCurrentConversation(); // Save the current active conversation first
    setCurrentLanguage(conversation.language);
    setMessages(conversation.messages);
    setReplySuggestions([]);
    setHistoryOpen(false);
  };

  const handleExportCurrentConversation = () => {
    const currentConversation: Conversation = {
      id: `conv-current-${Date.now()}`,
      startTime: messages.length > 0 ? messages[0].timestamp : Date.now(),
      language: currentLanguage,
      messages: messages,
    };
    exportConversationToPDF(currentConversation);
  };
  
  const handleUpdateProfile = (newUsername: string, newAvatar: string) => {
    setUserProgress(prev => ({
        ...prev,
        username: newUsername,
        avatar: newAvatar
    }));
  };

  const handleSaveGoals = (newGoals: UserGoals) => {
    setUserProgress(prev => ({ ...prev, goals: newGoals }));
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans">
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        userProgress={userProgress}
        onOpenDashboard={() => setDashboardOpen(true)}
        onOpenFlashcards={() => setFlashcardsOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onExportCurrentConversation={handleExportCurrentConversation}
        flashcardCount={flashcards.length}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow 
            messages={messages} 
            isLoading={isLoading} 
            language={currentLanguage}
            replySuggestions={replySuggestions}
            onSuggestionClick={handleSuggestionClick}
            userAvatar={userProgress.avatar}
        />
        <ChatInput 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
            language={currentLanguage} 
        />
      </main>
      <DashboardModal 
        isOpen={isDashboardOpen} 
        onClose={() => setDashboardOpen(false)} 
        progress={userProgress}
        onOpenGoalSettings={() => setGoalModalOpen(true)}
      />
      <FlashcardsModal isOpen={isFlashcardsOpen} onClose={() => setFlashcardsOpen(false)} flashcards={flashcards} />
      <ConversationHistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setHistoryOpen(false)} 
        history={conversationHistory}
        onLoadConversation={handleLoadConversation}
      />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        progress={userProgress}
        onSave={handleUpdateProfile}
      />
      <GoalSettingModal
        isOpen={isGoalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        currentGoals={userProgress.goals}
        onSave={handleSaveGoals}
      />
    </div>
  );
};

export default App;