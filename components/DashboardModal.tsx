import React from 'react';
import { UserProgress } from '../types';
import CloseIcon from './icons/CloseIcon';
import FireIcon from './icons/FireIcon';
import TargetIcon from './icons/TargetIcon';
import EditIcon from './icons/EditIcon';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onOpenGoalSettings: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-xl shadow-md flex items-center gap-4">
    <div className="p-3 bg-blue-100 rounded-full text-brand-primary">
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-brand-dark">{value}</p>
    </div>
  </div>
);

const GoalProgress: React.FC<{ title: string; current: number; target: number; unit: string }> = ({ title, current, target, unit }) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-sm text-gray-500">
          <span className="font-bold text-brand-dark">{current}</span> / {target} {unit}
        </p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-gradient-to-r from-brand-secondary to-green-400 h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};


const DashboardModal: React.FC<DashboardModalProps> = ({ isOpen, onClose, progress, onOpenGoalSettings }) => {
  if (!isOpen) return null;

  const avgScore = progress.sessionCount > 0 ? Math.round((progress.avgPronunciationScore / progress.sessionCount) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-brand-light rounded-2xl w-full max-w-md p-6 shadow-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
           <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-4xl text-white shadow-lg">
                {progress.avatar}
            </div>
            <div>
                <h2 className="text-2xl font-bold text-brand-dark">{progress.username}</h2>
                <p className="text-gray-500">Your Progress</p>
            </div>
          </div>
          <button onClick={onClose} title="Close dashboard" className="text-gray-500 hover:text-gray-800">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <StatCard title="Daily Streak" value={progress.streak} icon={<FireIcon className="w-6 h-6 text-orange-500"/>} />
          <StatCard title="Total XP" value={progress.xp} icon={<span className="font-bold text-lg">XP</span>} />
          <StatCard title="Words Learned" value={progress.wordsLearned} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-5.247-8.991l10.494 0M4.753 12h14.494" /></svg>} />
          <StatCard title="Avg. Pronunciation" value={`${avgScore}%`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 5.636a9 9 0 0112.728 0m-12.728 0a9 9 0 000 12.728m0-12.728l12.728 12.728" /></svg>} />
        </div>
        
        <div className="mt-6 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-brand-dark flex items-center gap-2">
                    <TargetIcon className="w-6 h-6 text-brand-secondary" />
                    My Goals
                </h3>
                <button onClick={onOpenGoalSettings} className="text-sm text-brand-primary font-semibold hover:underline flex items-center gap-1">
                    <EditIcon className="w-4 h-4" />
                    Edit
                </button>
            </div>
            <div className="space-y-4">
                <GoalProgress title="Weekly Words" current={progress.weeklyWordsLearned.count} target={progress.goals.wordsPerWeek} unit="words" />
                <GoalProgress title="Streak Target" current={progress.streak} target={progress.goals.streakTarget} unit="days" />
            </div>
        </div>

        <div className="mt-6">
            <h3 className="text-lg font-semibold text-brand-dark mb-2">XP Progress</h3>
            <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                    className="bg-gradient-to-r from-brand-primary to-brand-secondary h-4 rounded-full transition-all duration-500" 
                    style={{ width: `${(progress.xp % 100)}%` }}
                ></div>
            </div>
            <p className="text-right text-sm text-gray-500 mt-1">{(progress.xp % 100)} / 100 XP to next level</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardModal;