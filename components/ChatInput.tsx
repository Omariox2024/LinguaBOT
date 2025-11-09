import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import SendIcon from './icons/SendIcon';
import MicIcon from './icons/MicIcon';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface ChatInputProps {
  onSendMessage: (text: string, confidence?: number) => void;
  isLoading: boolean;
  language: Language;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, language }) => {
  const [text, setText] = useState('');
  const { transcript, confidence, isListening, error, startListening, stopListening, isSupported } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setText(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (!isListening && transcript) {
      onSendMessage(transcript, confidence);
      setText('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript, confidence]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(language);
    }
  };

  const isRTL = language === 'ar';

  return (
    <div className="bg-white/80 backdrop-blur-lg border-t border-gray-200 p-3 sm:p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-4">
        {isSupported && (
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isLoading}
            title={isListening ? 'Stop listening' : 'Start voice input'}
            className={`p-2 rounded-full transition-colors ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            <MicIcon className="w-6 h-6" />
          </button>
        )}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isListening ? 'Listening...' : 'Type a message...'}
          disabled={isLoading || isListening}
          className={`flex-1 p-3 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow ${isRTL ? 'text-right' : ''}`}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          title="Send message"
          className="p-3 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white enabled:hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
      {error && <p className="text-red-500 text-xs text-center mt-2 animate-fade-in">{error}</p>}
    </div>
  );
};

export default ChatInput;