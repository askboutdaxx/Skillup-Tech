import React from 'react';
import { useAuthProgress } from '../context/AuthProgressContext';
import { TRACKS, getAllLessons } from '../data/curriculum';
import { StreakBanner } from './StreakBanner';
import { Trophy, Award, ShieldCheck, Target, Flame } from 'lucide-react';

export interface MyProgressProps {
  onOpenTrackDetail: (trackId: string) => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenCertificate: (certId: string) => void;
}

export const MyProgress: React.FC<MyProgressProps> = ({
  onOpenTrackDetail,
  onOpenLesson,
  onOpenCertificate,
}) => {
  const { profile, claimCertificate } = useAuthProgress();

  const allLessons = getAllLessons();
  const totalCount = allLessons.length;
  const completedCount = profile.completedLessons?.length || 0;
  const overallPct = Math.round((completedCount / totalCount) * 100);

  const certificates = profile.certificates || [];

  const badges = [
    {
      id: 'first_step',
      name: 'First Step',
      description: 'Completed your very first tech lesson',
      icon: '🌱',
      isUnlocked: completedCount >= 1,
    },
    {
      id: 'three_day',
      name: '3-Day Fire',
      description: 'Maintained a 3-day daily streak',
      icon: '🔥',
      isUnlocked: (profile.longestStreak || 0) >= 3,
    },
    {
      id: 'seven_day',
      name: 'Week Champion',
      description: 'Maintained a 7-day daily streak',
      icon: '⚡',
      isUnlocked: (profile.longestStreak || 0) >= 7,
    },
    {
      id: 'quiz_ace',
      name: 'Quiz Ace',
      description: 'Scored 100% on any module quiz',
      icon: '🏆',
      isUnlocked: Object.values(profile.quizScores || {}).some(s => s === 100),
    },
    {
      id: 'ten_lessons',
      name: 'Knowledge Seeker',
      description: 'Completed 10 tech lessons',
      icon: '📚',
      isUnlocked: completedCount >= 10,
    },
    {
      id: 'track_master',
      name: 'Track Finisher',
      description: 'Completed all lessons in a skill track',
      icon: '🎓',
      isUnlocked: certificates.length > 0 || TRACKS.some(t => {
        let allDone = true;
        t.modules.forEach(m => {
          m.lessons.forEach(l => {
            if (!profile.completedLessons.includes(l.id)) allDone = false;
          });
        });
        return allDone;
      }),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#1E5EFF] dark:text-blue-400 uppercase tracking-wider">
          Learning Analytics & Milestones
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0D1E4C] dark:text-white tracking-tight mt-0.5">
          My Progress & Credentials
        </h1>
        <p className="text-sm sm:text-base text-[#3B507D] dark:text-slate-400 mt-1 font-medium">
          Track your skill mastery, daily consistency, unlocked badges, and verified track certificates.
        </p>
      </div>

      {/* Streak and Weekly Activity Banner */}
      <StreakBanner />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#3B507D] dark:text-slate-400 uppercase">Overall Curriculum</span>
            <Target className="w-4 h-4 text-[#1E5EFF]" />
          </div>
          <div className="text-3xl font-extrabold text-[#0D1E4C] dark:text-white tabular-nums">
            {overallPct}%
          </div>
          <div className="w-full h-2 bg-[#EAF1FF] dark:bg-[#1C2E60] rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-[#1E5EFF] transition-all duration-300"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <p className="text-xs text-[#3B507D] dark:text-slate-400 mt-2">
            {completedCount} of {totalCount} lessons completed
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#3B507D] dark:text-slate-400 uppercase">Streak Record</span>
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
          <div className="text-3xl font-extrabold text-[#0D1E4C] dark:text-white tabular-nums">
            {profile.streakCount || 1} <span className="text-lg font-bold text-[#3B507D] dark:text-slate-400">days</span>
          </div>
          <p className="text-xs text-[#3B507D] dark:text-slate-400 mt-2">
            Longest record: <strong className="text-[#0D1E4C] dark:text-white">{profile.longestStreak || 1} days</strong>
          </p>
          <p className="text-xs text-[#3B507D] dark:text-slate-400">
            Total active days: <strong className="text-[#0D1E4C] dark:text-white">{profile.activeDays?.length || 1}</strong>
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#3B507D] dark:text-slate-400 uppercase">Certificates Earned</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-[#0D1E4C] dark:text-white tabular-nums">
            {certificates.length}
          </div>
          <p className="text-xs text-[#3B507D] dark:text-slate-400 mt-2">
            {5 - certificates.length} remaining to finish full academy
          </p>
        </div>
      </div>

      {/* Verified Certificates Showcase Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-[#0D1E4C] dark:text-white">
                Track Completion Certificates
              </h2>
            </div>
            <p className="text-xs text-[#3B507D] dark:text-slate-400 mt-1">
              Certificates are automatically issued when all lessons in a skill track are marked complete.
            </p>
          </div>

          <span className="text-xs font-bold text-[#1E5EFF] dark:text-blue-300 bg-[#EAF1FF] dark:bg-[#1C2E60] px-3 py-1 rounded-xl self-start sm:self-center">
            {certificates.length} of 5 Tracks Certified
          </span>
        </div>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A1128] border border-[#D1E0FC] dark:border-[#233876] flex flex-col justify-between hover:border-[#1E5EFF] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified Credential
                    </span>
                    <span className="text-xs text-[#3B507D] dark:text-slate-400 font-mono">
                      {cert.certificateCode}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#0D1E4C] dark:text-white">
                    {cert.trackTitle}
                  </h3>
                  <p className="text-xs text-[#3B507D] dark:text-slate-400 mt-1">
                    Issued to {cert.learnerName} · {cert.issueDate}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#D1E0FC]/60 dark:border-[#233876]/60 flex items-center justify-end gap-2">
                  <button
                    onClick={() => onOpenCertificate(cert.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1E5EFF] hover:bg-[#164BD6] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>View & Print</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#F8FAFC] dark:bg-[#0A1128] rounded-2xl border border-dashed border-[#D1E0FC] dark:border-[#233876]">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EAF1FF] dark:bg-[#1C2E60] flex items-center justify-center text-2xl mb-3">
              🎓
            </div>
            <h3 className="text-sm font-bold text-[#0D1E4C] dark:text-white">
              No certificates unlocked yet
            </h3>
            <p className="text-xs text-[#3B507D] dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Finish all lessons in any of the 5 skill tracks (Data Analytics, Python, AI Automation, Digital Marketing, or Prompt Engineering) to earn your first certified diploma.
            </p>
          </div>
        )}
      </div>

      {/* Achievement Badges */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#0D1E4C] dark:text-white">Milestone Badges</h2>
            <p className="text-xs text-[#3B507D] dark:text-slate-400">
              Badges unlock automatically as you maintain streaks and finish modules.
            </p>
          </div>
          <span className="text-xs font-bold text-[#1E5EFF] dark:text-blue-300 bg-[#EAF1FF] dark:bg-[#1C2E60] px-2.5 py-1 rounded-lg">
            {badges.filter((b) => b.isUnlocked).length} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
                badge.isUnlocked
                  ? 'bg-[#EAF1FF]/60 dark:bg-[#1C2E60]/50 border-[#D1E0FC] dark:border-[#233876] shadow-2xs'
                  : 'bg-[#F8FAFC] dark:bg-[#0A1128] border-slate-200 dark:border-slate-800 opacity-50 grayscale'
              }`}
            >
              <span className="text-3xl mb-2">{badge.icon}</span>
              <h4 className="text-xs font-bold text-[#0D1E4C] dark:text-white leading-snug">
                {badge.name}
              </h4>
              <p className="text-[10px] text-[#3B507D] dark:text-slate-400 mt-1 line-clamp-2">
                {badge.description}
              </p>
              {badge.isUnlocked && (
                <span className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Unlocked ✓
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Track-by-Track Detailed Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#0D1E4C] dark:text-white">
          Skill Track Breakdown
        </h2>

        <div className="space-y-4">
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
            const hasCert = certificates.some(c => c.trackId === track.id);
            const canClaim = pct === 100 && !hasCert;

            return (
              <div
                key={track.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-[#1E5EFF] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl p-2.5 rounded-xl bg-[#EAF1FF] dark:bg-[#1C2E60] border border-[#D1E0FC] dark:border-[#233876] shrink-0">
                    {track.badge}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#0D1E4C] dark:text-white">
                        {track.title}
                      </h3>
                      {hasCert && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                          Certified 🎓
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#3B507D] dark:text-slate-400 mt-0.5">
                      {track.modules.length} modules · {total} lessons · {track.level}
                    </p>
                  </div>
                </div>

                <div className="flex-1 max-w-xs">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-[#3B507D] dark:text-slate-400">{done} of {total} completed</span>
                    <span className="text-[#1E5EFF] dark:text-blue-400 font-bold tabular-nums">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#EAF1FF] dark:bg-[#1C2E60] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1E5EFF] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {canClaim ? (
                    <button
                      onClick={() => claimCertificate(track.id)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
                    >
                      Claim Certificate 🎓
                    </button>
                  ) : hasCert ? (
                    <button
                      onClick={() => {
                        const cert = certificates.find(c => c.trackId === track.id);
                        if (cert) onOpenCertificate(cert.id);
                      }}
                      className="px-3.5 py-2 bg-[#EAF1FF] dark:bg-[#1C2E60] border border-[#1E5EFF] text-[#1E5EFF] dark:text-blue-300 text-xs font-bold rounded-xl hover:bg-[#1E5EFF] hover:text-white transition-colors"
                    >
                      View Certificate
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenTrackDetail(track.id)}
                      className="px-4 py-2 bg-white dark:bg-[#0A1128] hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] border border-[#D1E0FC] dark:border-[#233876] text-[#0D1E4C] dark:text-white hover:text-[#1E5EFF] text-xs font-bold rounded-xl transition-colors"
                    >
                      View Syllabus
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
