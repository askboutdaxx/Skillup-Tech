import React from 'react';
import { useAuthProgress, calculatePoints } from '../context/AuthProgressContext';
import { TRACKS, getAllLessons, getLessonById } from '../data/curriculum';
import { StreakBanner } from './StreakBanner';
import { Play, ArrowRight, BookOpen, CheckCircle, Trophy, Sparkles, Flame, Clock, Award } from 'lucide-react';

export interface DashboardProps {
  onOpenLesson: (lessonId: string) => void;
  onNavigateToExplore: () => void;
  onNavigateToLeaderboard: () => void;
  onNavigateToProgress: () => void;
  onOpenTrackDetail: (trackId: string) => void;
  onOpenCertificate: (certId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenLesson,
  onNavigateToExplore,
  onNavigateToLeaderboard,
  onNavigateToProgress,
  onOpenTrackDetail,
  onOpenCertificate,
}) => {
  const { profile } = useAuthProgress();

  const rawName = profile.name || 'Emmanuel';
  const uppercaseName = rawName.trim().toUpperCase();

  const allLessons = getAllLessons();
  const totalLessonsCount = allLessons.length;
  const completedLessonsCount = profile.completedLessons?.length || 0;
  const overallPercentage = Math.round((completedLessonsCount / totalLessonsCount) * 100);

  const lastLesson = profile.lastLessonViewed;
  const resumeLessonId = lastLesson?.lessonId || 'data-m1-l1';
  const resumeLessonData = getLessonById(resumeLessonId) || getLessonById('data-m1-l1');

  const earnedCertificates = profile.certificates || [];
  const points = calculatePoints(profile);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#1E5EFF] dark:text-blue-400 uppercase tracking-wider">
            Daily Learning Command Center
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0D1E4C] dark:text-white tracking-tight mt-1">
            WELCOME, {uppercaseName}
          </h1>
          <p className="text-sm sm:text-base text-[#3B507D] dark:text-slate-400 mt-1 font-medium">
            Keep your momentum alive today. 15 minutes of focused learning builds world-class skills.
          </p>
        </div>
      </div>

      {/* Daily Streak Banner & Weekly Tracker */}
      <StreakBanner />

      {/* Earned Certificate Announcement (if available) */}
      {earnedCertificates.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
              🎓
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                Official Credential Earned
              </span>
              <h3 className="text-lg font-bold text-[#0D1E4C] dark:text-white">
                {earnedCertificates[0].trackTitle} Certificate
              </h3>
              <p className="text-xs text-[#3B507D] dark:text-slate-400">
                Verified Credential ID: {earnedCertificates[0].certificateCode}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenCertificate(earnedCertificates[0].id)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs shrink-0"
          >
            <Award className="w-4 h-4" />
            <span>View Certificate</span>
          </button>
        </div>
      )}

      {/* Continue Learning Hero Card */}
      {resumeLessonData && (
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#1E5EFF] to-[#164BD6] text-white p-6 sm:p-8 shadow-md">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Jump Back In</span>
              </div>

              <div>
                <span className="text-xs font-medium text-blue-100 block">
                  {resumeLessonData.track.title} · {resumeLessonData.module.title.split(':')[0]}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  {resumeLessonData.lesson.title}
                </h3>
                <p className="text-xs sm:text-sm text-blue-100/90 mt-1.5 leading-relaxed line-clamp-2">
                  {resumeLessonData.lesson.summary}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-blue-100 pt-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{resumeLessonData.lesson.estimatedMinutes} minutes</span>
                </span>
                <span className="text-blue-300">·</span>
                <span>
                  {profile.completedLessons.includes(resumeLessonData.lesson.id)
                    ? 'Completed ✓'
                    : 'In Progress'}
                </span>
              </div>
            </div>

            <button
              onClick={() => onOpenLesson(resumeLessonId)}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white text-[#1E5EFF] hover:bg-[#EAF1FF] font-bold rounded-2xl text-sm transition-all shadow-md shrink-0 self-start md:self-center hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-[#1E5EFF]" />
              <span>Continue Learning</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#3B507D] dark:text-slate-400">Curriculum Progress</span>
            <BookOpen className="w-4 h-4 text-[#1E5EFF]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0D1E4C] dark:text-white tabular-nums">
            {overallPercentage}%
          </div>
          <div className="w-full h-1.5 bg-[#EAF1FF] dark:bg-[#1C2E60] rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full bg-[#1E5EFF] transition-all duration-300"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#3B507D] dark:text-slate-400">Total Points</span>
            <Sparkles className="w-4 h-4 text-[#1E5EFF]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0D1E4C] dark:text-white tabular-nums">
            {points.toLocaleString()}
          </div>
          <button
            onClick={onNavigateToLeaderboard}
            className="text-[11px] text-[#1E5EFF] dark:text-blue-400 hover:underline mt-2 font-semibold block text-left"
          >
            View Leaderboard &rarr;
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#3B507D] dark:text-slate-400">Daily Streak</span>
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0D1E4C] dark:text-white tabular-nums">
            {profile.streakCount || 1} <span className="text-sm font-medium text-[#3B507D] dark:text-slate-400">days</span>
          </div>
          <p className="text-[11px] text-[#3B507D] dark:text-slate-400 mt-2">
            Best streak: <strong className="text-[#0D1E4C] dark:text-white">{profile.longestStreak || 1} days</strong>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#3B507D] dark:text-slate-400">Certificates</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0D1E4C] dark:text-white tabular-nums">
            {earnedCertificates.length}
          </div>
          <button
            onClick={onNavigateToProgress}
            className="text-[11px] text-[#1E5EFF] dark:text-blue-400 hover:underline mt-2 font-semibold block text-left"
          >
            Inspect Credentials &rarr;
          </button>
        </div>
      </div>

      {/* Explore Tracks Section Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0D1E4C] dark:text-white tracking-tight">
              Skill Tracks
            </h2>
            <p className="text-xs sm:text-sm text-[#3B507D] dark:text-slate-400">
              Select any track to view modules, bite-sized lessons, and assessments.
            </p>
          </div>

          <button
            onClick={onNavigateToExplore}
            className="flex items-center gap-1 text-xs font-bold text-[#1E5EFF] dark:text-blue-400 hover:underline"
          >
            <span>Explore All Tracks</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TRACKS.map((track) => {
            let total = 0;
            let done = 0;
            track.modules.forEach((m) => {
              total += m.lessons.length;
              m.lessons.forEach((l) => {
                if (profile.completedLessons.includes(l.id)) done++;
              });
            });
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const hasCert = earnedCertificates.some(c => c.trackId === track.id);

            return (
              <div
                key={track.id}
                onClick={() => onOpenTrackDetail(track.id)}
                className="group p-5 rounded-2xl bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] hover:border-[#1E5EFF] transition-all duration-150 shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-3xl p-2.5 rounded-xl bg-[#EAF1FF] dark:bg-[#1C2E60] border border-[#D1E0FC] dark:border-[#233876] group-hover:scale-105 transition-transform">
                      {track.badge}
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-semibold text-[#1E5EFF] dark:text-blue-300 bg-[#EAF1FF] dark:bg-[#1C2E60] px-2.5 py-1 rounded-lg">
                        {track.level}
                      </span>
                      {hasCert && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                          Certified 🎓
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-[#0D1E4C] dark:text-white group-hover:text-[#1E5EFF] transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-xs text-[#3B507D] dark:text-slate-400 mt-1 line-clamp-2">
                    {track.tagline}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#D1E0FC]/60 dark:border-[#233876]/60">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-[#3B507D] dark:text-slate-400">
                      {done} / {total} Lessons
                    </span>
                    <span className="text-[#1E5EFF] dark:text-blue-400 font-bold tabular-nums">
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#EAF1FF] dark:bg-[#1C2E60] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1E5EFF] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
