import React, { useState } from 'react';
import { UserGoals } from '../types';
import CloseIcon from './icons/CloseIcon';

interface GoalSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoals: UserGoals;
  onSave: (newGoals: UserGoals) => void;
}

const GoalSettingModal: React.FC<GoalSettingModalProps> = ({ isOpen, onClose, currentGoals, onSave }) => {
  const [wordsPerWeek, setWordsPerWeek] = useState(currentGoals.wordsPerWeek);
  const [streakTarget, setStreakTarget] = useState(currentGoals.streakTarget);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ wordsPerWeek, streakTarget });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-brand-light rounded-2xl w-full max-w-md p-6 shadow-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-brand-dark">Set Your Goals</h2>
          <button onClick={onClose} title="Close goal settings" className="text-gray-500 hover:text-gray-800">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="words-goal" className="block text-sm font-medium text-gray-700 mb-2">
              New Words per Week
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                id="words-goal"
                min="5"
                max="50"
                step="5"
                value={wordsPerWeek}
                onChange={(e) => setWordsPerWeek(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="font-bold text-brand-primary w-12 text-center">{wordsPerWeek}</span>
            </div>
          </div>
          
          <div>
            <label htmlFor="streak-goal" className="block text-sm font-medium text-gray-700 mb-2">
              Daily Streak Target
            </label>
             <div className="flex items-center gap-4">
                <input
                    type="range"
                    id="streak-goal"
                    min="3"
                    max="30"
                    step="1"
                    value={streakTarget}
                    onChange={(e) => setStreakTarget(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-bold text-brand-primary w-12 text-center">{streakTarget} days</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
          >
            Save Goals
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalSettingModal;
