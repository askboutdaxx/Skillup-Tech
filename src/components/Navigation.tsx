import React from 'react';
import { useAuthProgress } from '../context/AuthProgressContext';
import {
  LayoutDashboard,
  Compass,
  TrendingUp,
  Trophy,
  User,
  LogIn,
  Sun,
  Moon
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'explore' | 'progress' | 'leaderboard' | 'profile';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAuthModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenAuthModal,
}) => {
  const { profile, isGuest, theme, toggleTheme } = useAuthProgress();

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'explore' as ActiveTab, label: 'Explore', icon: Compass },
    { id: 'progress' as ActiveTab, label: 'My Progress', icon: TrendingUp },
    { id: 'leaderboard' as ActiveTab, label: 'Leaderboard', icon: Trophy },
    { id: 'profile' as ActiveTab, label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 bg-white dark:bg-[#131c2e] border-r border-[#D1E0FC] dark:border-[#233876] p-6 shrink-0 h-screen sticky top-0 transition-colors duration-250">
        <div>
          {/* Brand Logo & Dark Mode Switch */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E5EFF] text-white flex items-center justify-center font-black text-xl shadow-xs">
                S
              </div>
              <div>
                <span className="text-lg font-black text-[#0D1E4C] dark:text-white tracking-tight block">
                  SkillUp Tech
                </span>
                <span className="text-[11px] text-[#3B507D] dark:text-slate-400 font-semibold tracking-wide uppercase block -mt-0.5">
                  Digital Skills Platform
                </span>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-[#3B507D] dark:text-slate-300 hover:text-[#0D1E4C] dark:hover:text-white bg-[#F8FAFC] dark:bg-[#0B1220] border border-[#D1E0FC] dark:border-[#233876] transition-colors duration-250 cursor-pointer shadow-2xs"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#1E5EFF]" />
              )}
            </button>
          </div>

          {/* Quick Streak Widget inside Sidebar */}
          <div className="mb-6 p-4 rounded-2xl bg-[#EAF1FF] dark:bg-[#1C2E60] border border-[#D1E0FC] dark:border-[#233876]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <div>
                  <span className="block text-xs font-bold text-[#0D1E4C] dark:text-white tabular-nums">
                    {profile.streakCount || 1}-Day Streak
                  </span>
                  <span className="block text-[10px] text-[#3B507D] dark:text-slate-300">
                    Best: {profile.longestStreak || 1} days
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#1E5EFF] dark:text-blue-300 bg-white dark:bg-[#132044] px-2 py-0.5 rounded-full border border-[#D1E0FC] dark:border-[#233876]">
                Active
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1E5EFF] text-white shadow-xs font-bold'
                      : 'text-[#3B507D] dark:text-slate-300 hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] hover:text-[#0D1E4C] dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#3B507D] dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="pt-6 border-t border-[#D1E0FC] dark:border-[#233876]">
          <div
            onClick={() => onTabChange('profile')}
            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EAF1FF] dark:bg-[#1C2E60] border border-[#D1E0FC] dark:border-[#233876] group-hover:border-[#1E5EFF] flex items-center justify-center font-bold text-[#1E5EFF] dark:text-blue-300 text-sm shrink-0">
              {(profile.name || 'E').charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <span className="block text-xs font-bold text-[#0D1E4C] dark:text-white truncate group-hover:text-[#1E5EFF] transition-colors">
                {profile.name || 'Emmanuel'}
              </span>
              <span className="block text-[11px] text-[#3B507D] dark:text-slate-400 truncate">
                {!isGuest ? profile.email : 'Guest Mode'}
              </span>
            </div>
          </div>

          {isGuest && (
            <button
              onClick={onOpenAuthModal}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white dark:bg-[#0A1128] border border-[#1E5EFF] text-[#1E5EFF] hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] text-xs font-bold transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Sync</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#131c2e] border-b border-[#D1E0FC] dark:border-[#233876] sticky top-0 z-30 transition-colors duration-250">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1E5EFF] text-white flex items-center justify-center font-black text-base">
            S
          </div>
          <span className="text-base font-extrabold text-[#0D1E4C] dark:text-white tracking-tight">
            SkillUp Tech
          </span>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-[#3B507D] dark:text-slate-300 hover:text-[#0D1E4C] dark:hover:text-white bg-[#F8FAFC] dark:bg-[#0B1220] border border-[#D1E0FC] dark:border-[#233876] transition-colors duration-250 cursor-pointer ml-1"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#1E5EFF]" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-[#EAF1FF] dark:bg-[#1C2E60] border border-[#D1E0FC] dark:border-[#233876] rounded-lg text-xs font-bold text-[#0D1E4C] dark:text-white tabular-nums">
            <span>🔥</span>
            <span>{profile.streakCount || 1}d</span>
          </div>

          <button
            onClick={() => onTabChange('profile')}
            className="w-8 h-8 rounded-lg bg-[#EAF1FF] dark:bg-[#1C2E60] border border-[#D1E0FC] dark:border-[#233876] flex items-center justify-center font-bold text-[#1E5EFF] dark:text-blue-300 text-xs"
            aria-label="View Profile"
          >
            {(profile.name || 'E').charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#131c2e] border-t border-[#D1E0FC] dark:border-[#233876] px-2 py-2 z-30 flex items-center justify-around shadow-lg transition-colors duration-250">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl text-[10px] font-bold transition-colors ${
                isActive
                  ? 'text-[#1E5EFF]'
                  : 'text-[#3B507D] dark:text-slate-400 hover:text-[#0D1E4C] dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#1E5EFF]' : 'text-[#3B507D] dark:text-slate-400'}`} />
              <span className="truncate max-w-[60px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
