import React, { useState } from 'react';
import { TRACKS } from '../data/curriculum';
import { useAuthProgress } from '../context/AuthProgressContext';
import { BookOpen, Clock, ArrowRight, Trophy, Sparkles, Award } from 'lucide-react';

export interface ExploreProps {
  onOpenTrackDetail: (trackId: string) => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenCertificate: (certId: string) => void;
}

export const Explore: React.FC<ExploreProps> = ({
  onOpenTrackDetail,
  onOpenLesson,
  onOpenCertificate,
}) => {
  const { profile } = useAuthProgress();
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTracks = TRACKS.filter((track) => {
    const matchesLevel = filterLevel === 'all' || track.level.toLowerCase().includes(filterLevel.toLowerCase());
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EAF1FF] dark:bg-[#1C2E60] text-[#1E5EFF] dark:text-blue-300 rounded-lg text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curriculum Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0D1E4C] dark:text-white tracking-tight">
          Explore Skill Tracks
        </h1>
        <p className="text-sm sm:text-base text-[#3B507D] dark:text-slate-400 mt-1 max-w-2xl font-medium">
          Master high-demand tech skills through structured modules, practical code sandboxes, and end-of-module knowledge quizzes. Earn a verified certificate upon completion.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-[#3B507D] dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Filter:
          </span>
          {['all', 'beginner', 'all levels'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                filterLevel === lvl
                  ? 'bg-[#1E5EFF] text-white shadow-2xs font-bold'
                  : 'bg-[#F8FAFC] dark:bg-[#0A1128] text-[#3B507D] dark:text-slate-400 hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] hover:text-[#0D1E4C] dark:hover:text-white'
              }`}
            >
              {lvl === 'all' ? 'All Skills' : lvl}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search tracks or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-1.5 text-xs bg-[#F8FAFC] dark:bg-[#0A1128] border border-[#D1E0FC] dark:border-[#233876] rounded-xl text-[#0D1E4C] dark:text-white placeholder-[#3B507D]/60 dark:placeholder-slate-500 focus:outline-none focus:border-[#1E5EFF] focus:bg-white dark:focus:bg-[#132044] transition-colors"
          />
        </div>
      </div>

      {/* 5 Track Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTracks.map((track) => {
          let totalLessons = 0;
          let completedLessons = 0;
          let quizzesPassed = 0;

          track.modules.forEach((mod) => {
            totalLessons += mod.lessons.length;
            mod.lessons.forEach((les) => {
              if (profile.completedLessons.includes(les.id)) {
                completedLessons++;
              }
            });
            if (profile.quizScores[mod.id] !== undefined) {
              quizzesPassed++;
            }
          });

          const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
          const isStarted = completedLessons > 0;
          const isCompleted = completedLessons === totalLessons && totalLessons > 0;
          const earnedCert = profile.certificates?.find(c => c.trackId === track.id);

          let nextLessonId = track.modules[0]?.lessons[0]?.id;
          for (const m of track.modules) {
            const uncompleted = m.lessons.find((l) => !profile.completedLessons.includes(l.id));
            if (uncompleted) {
              nextLessonId = uncompleted.id;
              break;
            }
          }

          return (
            <div
              key={track.id}
              className="group bg-white dark:bg-[#132044] rounded-2xl border border-[#D1E0FC] dark:border-[#233876] hover:border-[#1E5EFF] transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#EAF1FF] dark:bg-[#1C2E60] border border-[#D1E0FC] dark:border-[#233876] flex items-center justify-center text-3xl group-hover:scale-105 transition-transform shrink-0">
                    {track.badge}
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#EAF1FF] dark:bg-[#1C2E60] text-[#1E5EFF] dark:text-blue-300">
                      {track.level}
                    </span>
                    <span className="block text-[11px] text-[#3B507D] dark:text-slate-400 mt-1">
                      {track.estimatedHours} hrs est.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-[#0D1E4C] dark:text-white group-hover:text-[#1E5EFF] transition-colors">
                    {track.title}
                  </h3>
                  {earnedCert && (
                    <span title="Certificate Earned">
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-[#1E5EFF] dark:text-blue-400 mt-1">
                  {track.tagline}
                </p>
                <p className="text-xs text-[#3B507D] dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {track.description}
                </p>

                {/* Modules & Lessons meta breakdown */}
                <div className="flex items-center gap-3 text-xs text-[#3B507D] dark:text-slate-400 mt-4 pt-3 border-t border-[#D1E0FC]/60 dark:border-[#233876]/60">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-[#1E5EFF]" />
                    <span>{track.modules.length} Modules</span>
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span>{totalLessons} Lessons</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>{quizzesPassed}/{track.modules.length} Quizzes</span>
                  </span>
                </div>
              </div>

              {/* Card Footer with Progress Bar and Action Buttons */}
              <div className="p-6 pt-0">
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-[#3B507D] dark:text-slate-400">
                      {completedLessons} / {totalLessons} Completed
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

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => onOpenTrackDetail(track.id)}
                      className="w-full py-2.5 px-3 rounded-xl border border-[#D1E0FC] dark:border-[#233876] bg-white dark:bg-[#0A1128] hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] text-xs font-bold text-[#0D1E4C] dark:text-white transition-colors"
                    >
                      View Syllabus
                    </button>

                    <button
                      onClick={() => {
                        if (nextLessonId) onOpenLesson(nextLessonId);
                        else onOpenTrackDetail(track.id);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#1E5EFF] hover:bg-[#164BD6] text-white text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                    >
                      <span>{isCompleted ? 'Review' : isStarted ? 'Resume' : 'Start Track'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {earnedCert && (
                    <button
                      onClick={() => onOpenCertificate(earnedCert.id)}
                      className="w-full py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>View Certificate of Completion</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
