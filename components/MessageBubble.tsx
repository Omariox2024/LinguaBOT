import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  language: string;
  userAvatar: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, language, userAvatar }) => {
  const isUser = message.sender === 'user';
  const isRTL = language === 'ar';

  return (
    <div
      className={`flex items-end gap-2 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xl flex-shrink-0">
          🤖
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white rounded-br-lg'
            : 'bg-white text-gray-800 rounded-bl-lg shadow-md'
        }`}
      >
        <p className={`whitespace-pre-wrap ${isRTL ? 'text-right' : 'text-left'}`}>{message.text}</p>
        
        {message.correction && (
          <div className="mt-2 p-2 bg-red-100/50 border-l-4 border-red-400 text-red-800 rounded-lg text-sm">
            <p className="font-bold">Correction:</p>
            <p className="italic">"{message.correction.correctedText}"</p>
            <p className="mt-1 text-xs">{message.correction.explanation}</p>
          </div>
        )}

        {message.pronunciationScore && (
          <div className="mt-2 text-xs text-right">
            <span className={`font-semibold ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
              Pronunciation: {Math.round(message.pronunciationScore * 100)}%
            </span>
          </div>
        )}
      </div>
       {isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">
          {userAvatar}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;