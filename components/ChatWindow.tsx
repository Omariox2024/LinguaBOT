
import React, { useEffect, useRef } from 'react';
import { Message, Language } from '../types';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  language: Language;
  replySuggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  userAvatar: string;
}

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-white text-gray-800 p-3 rounded-2xl rounded-bl-lg shadow-md flex items-center space-x-2">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-fast"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-fast animation-delay-200"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-fast animation-delay-400"></div>
    </div>
  </div>
);

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, language, replySuggestions, onSuggestionClick, userAvatar }) => {
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
      <div className="space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} language={language} userAvatar={userAvatar} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={endOfMessagesRef} />
      </div>
      {replySuggestions.length > 0 && !isLoading && (
        <div className={`mt-4 flex gap-2 ${language === 'ar' ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
          {replySuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="bg-white border border-gray-300 text-sm text-gray-700 px-3 py-1 rounded-full hover:bg-gray-100 transition-colors animate-fade-in"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatWindow;