import React, { useState } from 'react';
import { useAuthProgress, calculatePoints } from '../context/AuthProgressContext';
import { User, Mail, Flame, Trophy, Calendar, Cloud, LogOut, LogIn, Edit2, Check, RefreshCw, Moon, Sun, Award } from 'lucide-react';

export interface ProfileViewProps {
  onOpenAuthModal: () => void;
  onOpenCertificate: (certId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenAuthModal, onOpenCertificate }) => {
  const { profile, isGuest, isSaving, logout, continueAsGuest, theme, toggleTheme } = useAuthProgress();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(profile.name || 'Emmanuel');

  const handleSaveName = () => {
    if (editedName.trim()) {
      continueAsGuest(editedName.trim());
      setIsEditingName(false);
    }
  };

  const points = calculatePoints(profile);
  const certificates = profile.certificates || [];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#1E5EFF] dark:text-blue-400 uppercase tracking-wider">
          Account & Preferences
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0D1E4C] dark:text-white tracking-tight mt-0.5">
          Learner Profile
        </h1>
        <p className="text-sm text-[#3B507D] dark:text-slate-400 mt-1 font-medium">
          Manage your account credentials, cloud synchronization, dark mode preferences, and verified certificates.
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#D1E0FC] dark:border-[#233876]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#EAF1FF] dark:bg-[#1C2E60] border border-[#D1E0FC] dark:border-[#233876] flex items-center justify-center text-2xl font-bold text-[#1E5EFF] dark:text-blue-300 shrink-0">
              {(profile.name || 'E').charAt(0).toUpperCase()}
            </div>

            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="px-3 py-1 bg-[#F8FAFC] dark:bg-[#0A1128] border border-[#1E5EFF] rounded-xl text-base font-bold text-[#0D1E4C] dark:text-white focus:outline-none"
                    placeholder="Enter name"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 bg-[#1E5EFF] text-white rounded-lg hover:bg-[#164BD6]"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#0D1E4C] dark:text-white">
                    {profile.name || 'Emmanuel'}
                  </h2>
                  <button
                    onClick={() => {
                      setEditedName(profile.name || 'Emmanuel');
                      setIsEditingName(true);
                    }}
                    className="p-1 text-[#3B507D] dark:text-slate-400 hover:text-[#1E5EFF] dark:hover:text-white rounded-md transition-colors"
                    title="Edit Name"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <p className="text-xs sm:text-sm text-[#3B507D] dark:text-slate-400 mt-0.5">
                {profile.email || (isGuest ? 'Guest Learner (Offline Cache)' : 'Registered Learner')}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  !isGuest
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                }`}>
                  <Cloud className="w-3 h-3" />
                  <span>{!isGuest ? 'Cloud Firestore Synced' : 'Local Storage Mode'}</span>
                </span>
                {isSaving && (
                  <span className="text-[11px] text-[#3B507D] dark:text-slate-400 flex items-center gap-1 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Syncing...</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3.5 py-2 border border-[#D1E0FC] dark:border-[#233876] bg-[#F8FAFC] dark:bg-[#0B1220] text-[#0D1E4C] dark:text-white text-xs font-bold rounded-xl transition-colors duration-250 hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] cursor-pointer"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[#1E5EFF]" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {isGuest ? (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-5 py-2 bg-[#1E5EFF] hover:bg-[#164BD6] text-white font-bold rounded-xl text-xs transition-colors shadow-2xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Create / Link Account</span>
              </button>
            ) : (
              <button
                onClick={() => logout()}
                className="flex items-center gap-2 px-4 py-2 border border-[#D1E0FC] dark:border-[#233876] bg-white dark:bg-[#0A1128] hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] text-[#0D1E4C] dark:text-white font-semibold rounded-xl text-xs transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A1128] border border-[#D1E0FC]/70 dark:border-[#233876]">
            <div className="flex items-center gap-2 text-xs text-[#3B507D] dark:text-slate-400 font-medium mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Current Daily Streak</span>
            </div>
            <div className="text-2xl font-extrabold text-[#0D1E4C] dark:text-white tabular-nums">
              {profile.streakCount || 1} days
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A1128] border border-[#D1E0FC]/70 dark:border-[#233876]">
            <div className="flex items-center gap-2 text-xs text-[#3B507D] dark:text-slate-400 font-medium mb-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Longest Streak</span>
            </div>
            <div className="text-2xl font-extrabold text-[#0D1E4C] dark:text-white tabular-nums">
              {profile.longestStreak || 1} days
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A1128] border border-[#D1E0FC]/70 dark:border-[#233876]">
            <div className="flex items-center gap-2 text-xs text-[#3B507D] dark:text-slate-400 font-medium mb-1">
              <Award className="w-3.5 h-3.5 text-[#1E5EFF]" />
              <span>Certificates Claimed</span>
            </div>
            <div className="text-2xl font-extrabold text-[#0D1E4C] dark:text-white tabular-nums">
              {certificates.length}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A1128] border border-[#D1E0FC]/70 dark:border-[#233876]">
            <div className="flex items-center gap-2 text-xs text-[#3B507D] dark:text-slate-400 font-medium mb-1">
              <Cloud className="w-3.5 h-3.5 text-[#1E5EFF]" />
              <span>Lessons Saved</span>
            </div>
            <div className="text-2xl font-extrabold text-[#0D1E4C] dark:text-white tabular-nums">
              {profile.completedLessons?.length || 0}
            </div>
          </div>
        </div>

        {/* Certificates Quick Access */}
        {certificates.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#D1E0FC] dark:border-[#233876]">
            <h3 className="text-sm font-bold text-[#0D1E4C] dark:text-white mb-3">
              Earned Diplomas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0A1128] border border-[#D1E0FC] dark:border-[#233876] flex items-center justify-between"
                >
                  <div>
                    <span className="block text-xs font-bold text-[#0D1E4C] dark:text-white">
                      {cert.trackTitle}
                    </span>
                    <span className="block text-[11px] text-[#3B507D] dark:text-slate-400 font-mono">
                      {cert.certificateCode}
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenCertificate(cert.id)}
                    className="px-3 py-1 bg-[#1E5EFF] text-white text-xs font-semibold rounded-lg hover:bg-[#164BD6] transition-colors"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Guest Mode Callout if not signed in */}
      {isGuest && (
        <div className="p-6 rounded-3xl bg-[#EAF1FF] dark:bg-[#1C2E60] border border-[#D1E0FC] dark:border-[#233876] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#0D1E4C] dark:text-white">
              Sync Your Progress Across Devices
            </h3>
            <p className="text-xs text-[#3B507D] dark:text-slate-300 mt-1 max-w-lg leading-relaxed">
              You are currently exploring as a guest. Create a free account or sign in with Google to protect your daily streaks and continue learning anywhere.
            </p>
          </div>
          <button
            onClick={onOpenAuthModal}
            className="px-5 py-2.5 bg-[#1E5EFF] hover:bg-[#164BD6] text-white font-bold rounded-xl text-xs transition-colors shadow-xs shrink-0"
          >
            Save My Account
          </button>
        </div>
      )}
    </div>
  );
};
