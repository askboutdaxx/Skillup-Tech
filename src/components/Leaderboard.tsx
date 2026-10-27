import React, { useEffect, useState } from 'react';
import { useAuthProgress, PublicLeaderboardItem, calculatePoints } from '../context/AuthProgressContext';
import { Trophy, Flame, Crown } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { profile, fetchLeaderboard } = useAuthProgress();
  const [items, setItems] = useState<PublicLeaderboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'points' | 'streak' | 'completed'>('points');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const data = await fetchLeaderboard();
      if (mounted) {
        setItems(data);
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [fetchLeaderboard]);

  const sortedItems = [...items].sort((a, b) => {
    if (activeFilter === 'streak') {
      return (b.streakCount || 0) - (a.streakCount || 0);
    }
    if (activeFilter === 'completed') {
      return (b.completedCount || 0) - (a.completedCount || 0);
    }
    return (b.points || 0) - (a.points || 0);
  });

  const userRankIndex = sortedItems.findIndex(i => i.uid === profile.uid);
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : 1;

  const topThree = sortedItems.slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EAF1FF] dark:bg-[#1C2E60] text-[#1E5EFF] dark:text-blue-300 rounded-lg text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Global Tech Community</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0D1E4C] dark:text-white tracking-tight">
            Learner Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-[#3B507D] dark:text-slate-400 mt-1 font-medium">
            Celebrate daily consistency, lessons mastered, and competitive streaks across the platform.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="inline-flex p-1 bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] rounded-2xl shadow-2xs self-start sm:self-center">
          <button
            onClick={() => setActiveFilter('points')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'points'
                ? 'bg-[#1E5EFF] text-white shadow-xs'
                : 'text-[#3B507D] dark:text-slate-400 hover:text-[#0D1E4C] dark:hover:text-white'
            }`}
          >
            Points
          </button>
          <button
            onClick={() => setActiveFilter('streak')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'streak'
                ? 'bg-[#1E5EFF] text-white shadow-xs'
                : 'text-[#3B507D] dark:text-slate-400 hover:text-[#0D1E4C] dark:hover:text-white'
            }`}
          >
            Streaks
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'completed'
                ? 'bg-[#1E5EFF] text-white shadow-xs'
                : 'text-[#3B507D] dark:text-slate-400 hover:text-[#0D1E4C] dark:hover:text-white'
            }`}
          >
            Lessons
          </button>
        </div>
      </div>

      {/* User's Current Standing Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-linear-to-r from-[#1E5EFF] to-[#164BD6] text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl font-black">
            #{userRank}
          </div>
          <div>
            <span className="text-xs font-medium text-blue-100 uppercase tracking-wider block">
              Your Current Standing
            </span>
            <h3 className="text-xl font-extrabold text-white">
              {profile.name || 'Emmanuel'}
            </h3>
            <span className="text-xs text-blue-100">
              Ranked among active tech peers
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-center sm:text-right">
          <div>
            <span className="block text-xs text-blue-100">Total Points</span>
            <span className="text-2xl font-black text-white tabular-nums">
              {calculatePoints(profile).toLocaleString()}
            </span>
          </div>
          <div className="h-8 w-px bg-white/30" />
          <div>
            <span className="block text-xs text-blue-100">Streak</span>
            <span className="text-2xl font-black text-white tabular-nums flex items-center justify-center gap-1">
              <span>🔥</span>
              <span>{profile.streakCount || 1}d</span>
            </span>
          </div>
          <div className="h-8 w-px bg-white/30" />
          <div>
            <span className="block text-xs text-blue-100">Lessons</span>
            <span className="text-2xl font-black text-white tabular-nums">
              {profile.completedLessons?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-[#132044] rounded-2xl border border-[#D1E0FC] dark:border-[#233876]">
          <div className="w-8 h-8 mx-auto border-3 border-[#1E5EFF] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-[#3B507D] dark:text-slate-400">Loading live rankings...</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {topThree.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-4">
              {/* 2nd Place */}
              <div className="order-2 md:order-1 p-6 rounded-2xl bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] shadow-xs flex flex-col items-center text-center relative">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-sm absolute -top-5 border-2 border-white dark:border-[#132044] shadow-xs">
                  2
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[#EAF1FF] dark:bg-[#1C2E60] border border-[#D1E0FC] dark:border-[#233876] flex items-center justify-center text-2xl font-black text-[#1E5EFF] dark:text-blue-300 mt-2 mb-3">
                  {topThree[1].name.charAt(0)}
                </div>
                <h4 className="text-base font-bold text-[#0D1E4C] dark:text-white truncate max-w-full">
                  {topThree[1].name}
                </h4>
                <span className="text-xs font-semibold text-[#1E5EFF] dark:text-blue-400 mt-0.5 tabular-nums">
                  {activeFilter === 'streak'
                    ? `🔥 ${topThree[1].streakCount}d streak`
                    : activeFilter === 'completed'
                    ? `${topThree[1].completedCount} lessons`
                    : `${topThree[1].points.toLocaleString()} pts`}
                </span>
                <div className="mt-3 text-[11px] text-[#3B507D] dark:text-slate-400 flex items-center gap-2">
                  <span>🔥 {topThree[1].streakCount}d</span>
                  <span>·</span>
                  <span>{topThree[1].completedCount} done</span>
                </div>
              </div>

              {/* 1st Place (Gold Center) */}
              <div className="order-1 md:order-2 p-6 rounded-2xl bg-linear-to-b from-[#EAF1FF] to-white dark:from-[#1C2E60] dark:to-[#132044] border-2 border-[#1E5EFF] shadow-md flex flex-col items-center text-center relative -translate-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center text-base absolute -top-6 border-2 border-white dark:border-[#132044] shadow-sm">
                  <Crown className="w-6 h-6 fill-amber-950" />
                </div>
                <div className="w-20 h-20 rounded-2xl bg-[#1E5EFF] text-white flex items-center justify-center text-3xl font-black mt-2 mb-3 shadow-sm">
                  {topThree[0].name.charAt(0)}
                </div>
                <h4 className="text-lg font-extrabold text-[#0D1E4C] dark:text-white truncate max-w-full">
                  {topThree[0].name}
                </h4>
                <span className="text-sm font-extrabold text-[#1E5EFF] dark:text-blue-300 mt-0.5 tabular-nums">
                  {activeFilter === 'streak'
                    ? `🔥 ${topThree[0].streakCount}d streak`
                    : activeFilter === 'completed'
                    ? `${topThree[0].completedCount} lessons`
                    : `${topThree[0].points.toLocaleString()} pts`}
                </span>
                <span className="mt-2 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                  Global Leader #1
                </span>
              </div>

              {/* 3rd Place */}
              <div className="order-3 p-6 rounded-2xl bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] shadow-xs flex flex-col items-center text-center relative">
                <div className="w-10 h-10 rounded-full bg-amber-700 text-amber-50 font-bold flex items-center justify-center text-sm absolute -top-5 border-2 border-white dark:border-[#132044] shadow-xs">
                  3
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[#EAF1FF] dark:bg-[#1C2E60] border border-[#D1E0FC] dark:border-[#233876] flex items-center justify-center text-2xl font-black text-[#1E5EFF] dark:text-blue-300 mt-2 mb-3">
                  {topThree[2].name.charAt(0)}
                </div>
                <h4 className="text-base font-bold text-[#0D1E4C] dark:text-white truncate max-w-full">
                  {topThree[2].name}
                </h4>
                <span className="text-xs font-semibold text-[#1E5EFF] dark:text-blue-400 mt-0.5 tabular-nums">
                  {activeFilter === 'streak'
                    ? `🔥 ${topThree[2].streakCount}d streak`
                    : activeFilter === 'completed'
                    ? `${topThree[2].completedCount} lessons`
                    : `${topThree[2].points.toLocaleString()} pts`}
                </span>
                <div className="mt-3 text-[11px] text-[#3B507D] dark:text-slate-400 flex items-center gap-2">
                  <span>🔥 {topThree[2].streakCount}d</span>
                  <span>·</span>
                  <span>{topThree[2].completedCount} done</span>
                </div>
              </div>
            </div>
          )}

          {/* Complete Ranked Table */}
          <div className="rounded-2xl border border-[#D1E0FC] dark:border-[#233876] bg-white dark:bg-[#132044] overflow-hidden shadow-xs">
            <div className="p-4 sm:px-6 bg-[#F8FAFC] dark:bg-[#0A1128] border-b border-[#D1E0FC] dark:border-[#233876] flex items-center justify-between text-xs font-bold text-[#3B507D] dark:text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-6">
                <span className="w-8">Rank</span>
                <span>Learner</span>
              </div>
              <div className="flex items-center gap-8 text-right">
                <span className="hidden sm:inline-block w-20">Streak</span>
                <span className="hidden sm:inline-block w-20">Lessons</span>
                <span className="w-24">Total Points</span>
              </div>
            </div>

            <div className="divide-y divide-[#D1E0FC]/60 dark:divide-[#233876]/60">
              {sortedItems.map((item, idx) => {
                const rank = idx + 1;
                const isCurrentUser = item.uid === profile.uid;

                return (
                  <div
                    key={item.uid}
                    className={`p-4 sm:px-6 flex items-center justify-between transition-colors ${
                      isCurrentUser
                        ? 'bg-[#EAF1FF]/70 dark:bg-[#1E3A8A]/30 font-bold'
                        : 'hover:bg-[#F8FAFC] dark:hover:bg-[#1C2E60]/40'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <span className={`w-8 text-xs font-black tabular-nums ${
                        rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-slate-400' : rank === 3 ? 'text-amber-700' : 'text-[#3B507D] dark:text-slate-400'
                      }`}>
                        #{rank}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#EAF1FF] dark:bg-[#1C2E60] border border-[#D1E0FC] dark:border-[#233876] flex items-center justify-center font-bold text-[#1E5EFF] dark:text-blue-300 text-xs shrink-0">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#0D1E4C] dark:text-white truncate">
                              {item.name}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[10px] bg-[#1E5EFF] text-white px-2 py-0.5 rounded-full font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#3B507D] dark:text-slate-400 sm:hidden block">
                            🔥 {item.streakCount}d · {item.completedCount} lessons
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 text-right">
                      <span className="hidden sm:inline-block w-20 text-xs text-[#0D1E4C] dark:text-slate-200 tabular-nums">
                        🔥 {item.streakCount} days
                      </span>
                      <span className="hidden sm:inline-block w-20 text-xs text-[#0D1E4C] dark:text-slate-200 tabular-nums">
                        {item.completedCount}
                      </span>
                      <span className="w-24 text-sm font-black text-[#1E5EFF] dark:text-blue-400 tabular-nums">
                        {item.points.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
