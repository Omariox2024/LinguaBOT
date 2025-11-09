import React, { useState } from 'react';
import { UserProgress } from '../types';
import { AVATAR_OPTIONS } from '../constants';
import CloseIcon from './icons/CloseIcon';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onSave: (username: string, avatar: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, progress, onSave }) => {
  const [username, setUsername] = useState(progress.username);
  const [avatar, setAvatar] = useState(progress.avatar);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(username, avatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-brand-light rounded-2xl w-full max-w-md p-6 shadow-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-brand-dark">Edit Profile</h2>
          <button onClick={onClose} title="Close profile editor" className="text-gray-500 hover:text-gray-800">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              maxLength={20}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Avatar
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-4">
              {AVATAR_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setAvatar(option)}
                  className={`text-3xl p-2 rounded-full flex items-center justify-center transition-all duration-200
                    ${avatar === option ? 'bg-brand-primary ring-4 ring-blue-300' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
