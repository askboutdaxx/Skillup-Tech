import React from 'react';
import { useAuthProgress } from '../context/AuthProgressContext';
import { getCurrentWeekDays } from '../lib/streak';
import { Flame, Trophy, Calendar, Check, Zap } from 'lucide-react';

export const StreakBanner: React.FC = () => {
  const { profile } = useAuthProgress();
  const weekDays = getCurrentWeekDays(profile.activeDays || []);

  const streakDays = profile.streakCount || 1;
  const longestStreak = profile.longestStreak || streakDays;

  const getMotivationalNote = (streak: number) => {
    if (streak >= 30) return "Legendary dedication! You're in the top 1% of learners.";
    if (streak >= 14) return "Unstoppable momentum! Two solid weeks of learning.";
    if (streak >= 7) return "One full week conquered! Daily learning is your superpower.";
    if (streak >= 3) return "Habit locked in! Keep the daily fire burning bright.";
    return "Great start! Complete a lesson today to maintain your momentum.";
  };

  return (
    <div className="w-full bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Streak metric and status */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#EAF1FF] dark:bg-[#1C2E60] border border-[#D1E0FC] dark:border-[#233876] flex items-center justify-center shrink-0">
            <span className="text-3xl sm:text-4xl animate-bounce duration-1000 select-none">🔥</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0D1E4C] dark:text-white tracking-tight tabular-nums">
                {streakDays}-day streak
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF1FF] dark:bg-[#1C2E60] text-[#1E5EFF] dark:text-blue-300 border border-[#D1E0FC] dark:border-[#233876]">
                <Zap className="w-3 h-3 fill-[#1E5EFF]" />
                Active
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-[#3B507D] dark:text-slate-400 mt-1">
              {getMotivationalNote(streakDays)}
            </p>

            <div className="flex items-center gap-4 mt-2 text-xs font-medium text-[#3B507D] dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#1E5EFF]" />
                <span>Best streak: <strong className="text-[#0D1E4C] dark:text-white tabular-nums">{longestStreak} days</strong></span>
              </span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#1E5EFF]" />
                <span>{profile.activeDays?.length || 1} total active days</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Weekly tracker (Mon to Sun) */}
        <div className="lg:border-l lg:border-[#D1E0FC] dark:lg:border-[#233876] lg:pl-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#0D1E4C] dark:text-white tracking-wide uppercase">
              Weekly Activity
            </span>
            <span className="text-xs text-[#3B507D] dark:text-slate-400">Mon – Sun</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekDays.map((day) => {
              const active = day.isActive;
              const today = day.isToday;

              return (
                <div
                  key={day.dateString}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
                    active
                      ? 'bg-[#1E5EFF] text-white border-[#1E5EFF] shadow-xs'
                      : today
                      ? 'bg-[#EAF1FF] dark:bg-[#1C2E60] text-[#0D1E4C] dark:text-white border-[#1E5EFF]'
                      : 'bg-[#F8FAFC] dark:bg-[#0A1128] text-[#3B507D] dark:text-slate-400 border-[#D1E0FC]/60 dark:border-[#233876]'
                  }`}
                  title={`${day.fullDayName}: ${active ? 'Active (Streak day completed)' : today ? 'Today (Learn now to mark day)' : 'Not active'}`}
                >
                  <span className={`text-[10px] font-bold ${active ? 'text-white/90' : 'text-[#3B507D] dark:text-slate-400'}`}>
                    {day.dayName}
                  </span>

                  <div className="my-1">
                    {active ? (
                      <Check className="w-4 h-4 stroke-[3] text-white" />
                    ) : (
                      <span className={`text-xs font-semibold tabular-nums ${today ? 'text-[#1E5EFF] dark:text-blue-300' : 'text-[#3B507D] dark:text-slate-400'}`}>
                        {day.dayNumber}
                      </span>
                    )}
                  </div>

                  {today && (
                    <span className={`w-1 h-1 rounded-full ${active ? 'bg-white' : 'bg-[#1E5EFF]'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
