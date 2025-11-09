
import React from 'react';
import { Conversation, Language, LanguageOption } from '../types';
import CloseIcon from './icons/CloseIcon';
import { LANGUAGE_OPTIONS } from '../constants';
import ExportIcon from './icons/ExportIcon';
import { exportConversationToPDF } from '../utils/pdfExport';

interface ConversationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: Conversation[];
  onLoadConversation: (conversation: Conversation) => void;
}

const getFriendlyDate = (timestamp: number): string => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const date = new Date(timestamp);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const groupHistoryByDate = (history: Conversation[]): [string, Conversation[]][] => {
  const groups = history.reduce((acc, conversation) => {
    const friendlyDate = getFriendlyDate(conversation.startTime);
    if (!acc[friendlyDate]) {
      acc[friendlyDate] = [];
    }
    acc[friendlyDate].push(conversation);
    return acc;
  }, {} as Record<string, Conversation[]>);
  
  return Object.entries(groups);
};

const ConversationHistoryModal: React.FC<ConversationHistoryModalProps> = ({ isOpen, onClose, history, onLoadConversation }) => {
  if (!isOpen) return null;

  const groupedHistory = groupHistoryByDate(history);
  const getLanguageOption = (langCode: Language): LanguageOption | undefined => LANGUAGE_OPTIONS.find(opt => opt.code === langCode);

  const handleExport = (e: React.MouseEvent, conversation: Conversation) => {
    e.stopPropagation(); // Prevent loading the conversation
    exportConversationToPDF(conversation);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-brand-light rounded-2xl w-full max-w-lg h-[90vh] flex flex-col p-6 shadow-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-brand-dark">Conversation History</h2>
          <button onClick={onClose} title="Close history" className="text-gray-500 hover:text-gray-800">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {history.length > 0 ? (
          <div className="overflow-y-auto pr-2 space-y-6">
            {groupedHistory.map(([date, conversations]) => (
              <div key={date}>
                <h3 className="font-bold text-lg text-gray-700 mb-2 sticky top-0 bg-brand-light py-1 -mx-2 px-2">{date}</h3>
                <div className="space-y-2">
                  {conversations.map(conv => {
                      const langOpt = getLanguageOption(conv.language);
                      const userMessagePreview = conv.messages.find(m => m.sender === 'user')?.text;
                      return (
                        <div
                          key={conv.id}
                          className="group w-full text-left p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
                        >
                          <button
                            onClick={() => onLoadConversation(conv)}
                            className="flex-1 flex items-center gap-3 overflow-hidden text-left"
                          >
                            <span className="text-xl">{langOpt?.flag || '...'}</span>
                            <div className="flex-1 overflow-hidden">
                              <p className="font-semibold text-brand-dark truncate">
                                {userMessagePreview || 'Conversation started'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(conv.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {' '}&bull;{' '}
                                {conv.messages.length} messages
                              </p>
                            </div>
                          </button>
                          <button
                            onClick={(e) => handleExport(e, conv)}
                            title="Export this conversation"
                            className="p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExportIcon className="w-5 h-5" />
                          </button>
                        </div>
                      );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
            <p className="text-lg font-semibold">No history yet!</p>
            <p>Your past conversations will be saved here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationHistoryModal;
