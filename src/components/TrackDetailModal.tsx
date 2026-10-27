import React, { useState } from 'react';
import { Track } from '../data/curriculum';
import { useAuthProgress } from '../context/AuthProgressContext';
import { QuizModal } from './QuizModal';
import { X, CheckCircle, Clock, BookOpen, Trophy, ArrowRight, Award } from 'lucide-react';

interface TrackDetailModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenCertificate?: (certId: string) => void;
}

export const TrackDetailModal: React.FC<TrackDetailModalProps> = ({
  track,
  isOpen,
  onClose,
  onOpenLesson,
  onOpenCertificate,
}) => {
  const { profile, claimCertificate } = useAuthProgress();
  const [activeQuizModule, setActiveQuizModule] = useState<{ id: string; quiz: any } | null>(null);

  if (!isOpen || !track) return null;

  let totalLessons = 0;
  let completedCount = 0;
  track.modules.forEach((m) => {
    totalLessons += m.lessons.length;
    m.lessons.forEach((l) => {
      if (profile.completedLessons.includes(l.id)) {
        completedCount++;
      }
    });
  });
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isFinished = progressPct === 100;
  const existingCert = profile.certificates?.find((c) => c.trackId === track.id);

  const handleClaim = async () => {
    const cert = await claimCertificate(track.id);
    if (cert && onOpenCertificate) {
      onClose();
      onOpenCertificate(cert.id);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-[#0D1E4C]/50 dark:bg-black/70 backdrop-blur-xs">
        <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#132044] rounded-2xl border border-[#D1E0FC] dark:border-[#233876] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-[#D1E0FC] dark:border-[#233876] bg-white dark:bg-[#132044] sticky top-0 z-10">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-lg text-[#3B507D] dark:text-slate-400 hover:text-[#0D1E4C] dark:hover:text-white hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] transition-colors"
              aria-label="Close track details"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF1FF] dark:bg-[#1C2E60] border border-[#D1E0FC] dark:border-[#233876] flex items-center justify-center text-3xl shrink-0">
                {track.badge}
              </div>
              <div className="pr-8">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1E5EFF] dark:text-blue-300 uppercase tracking-wide">
                  <span>{track.level}</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span>{track.estimatedHours} Hours total</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1E4C] dark:text-white tracking-tight mt-0.5">
                  {track.title}
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#3B507D] dark:text-slate-400 mt-3">
              {track.description}
            </p>

            {/* Progress bar and Certificate status */}
            <div className="mt-4 pt-4 border-t border-[#D1E0FC]/60 dark:border-[#233876]/60">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-[#0D1E4C] dark:text-white">
                  {completedCount} of {totalLessons} Lessons Completed
                </span>
                <span className="text-[#1E5EFF] dark:text-blue-400 tabular-nums font-bold">
                  {progressPct}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#EAF1FF] dark:bg-[#1C2E60] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1E5EFF] transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {isFinished && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      {existingCert ? 'Certificate Earned ✓' : 'Track Complete! Claim your certificate'}
                    </span>
                  </div>
                  {existingCert ? (
                    <button
                      onClick={() => {
                        if (onOpenCertificate) {
                          onClose();
                          onOpenCertificate(existingCert.id);
                        }
                      }}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                    >
                      View Certificate
                    </button>
                  ) : (
                    <button
                      onClick={handleClaim}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                    >
                      Claim Certificate 🎓
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Module List */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {track.modules.map((mod, modIdx) => {
              const quizScore = profile.quizScores[mod.id];
              const modCompletedLessons = mod.lessons.filter((l) =>
                profile.completedLessons.includes(l.id)
              ).length;
              const isModFullyCompleted = modCompletedLessons === mod.lessons.length;

              return (
                <div
                  key={mod.id}
                  className="rounded-2xl border border-[#D1E0FC] dark:border-[#233876] bg-white dark:bg-[#132044] overflow-hidden shadow-2xs"
                >
                  <div className="p-4 sm:p-5 bg-[#F8FAFC] dark:bg-[#0A1128] border-b border-[#D1E0FC] dark:border-[#233876] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1E5EFF] dark:text-blue-300 uppercase tracking-wide">
                          Module {modIdx + 1}
                        </span>
                        {isModFullyCompleted && (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            Completed ✓
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#0D1E4C] dark:text-white mt-0.5">
                        {mod.title.replace(/^Module \d+:\s*/, '')}
                      </h3>
                      <p className="text-xs text-[#3B507D] dark:text-slate-400 mt-0.5">
                        {mod.description}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveQuizModule({ id: mod.id, quiz: mod.quiz })}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                        quizScore !== undefined
                          ? 'bg-[#EAF1FF] dark:bg-[#1C2E60] text-[#1E5EFF] dark:text-blue-300 border-[#1E5EFF]'
                          : 'bg-white dark:bg-[#132044] hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] text-[#0D1E4C] dark:text-white border-[#D1E0FC] dark:border-[#233876]'
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5 text-[#1E5EFF] dark:text-blue-400" />
                      <span>
                        {quizScore !== undefined ? `Quiz: ${quizScore}% (Retake)` : 'Take Quiz'}
                      </span>
                    </button>
                  </div>

                  {/* Lessons list inside module */}
                  <div className="divide-y divide-[#D1E0FC]/60 dark:divide-[#233876]/60">
                    {mod.lessons.map((lesson, lIdx) => {
                      const isCompleted = profile.completedLessons.includes(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            onClose();
                            onOpenLesson(lesson.id);
                          }}
                          className="p-4 sm:px-5 flex items-center justify-between gap-4 hover:bg-[#EAF1FF]/40 dark:hover:bg-[#1C2E60]/40 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-[#EAF1FF] dark:bg-[#1C2E60] text-[#1E5EFF] dark:text-blue-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                              {lIdx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-[#0D1E4C] dark:text-white group-hover:text-[#1E5EFF] dark:group-hover:text-blue-300 transition-colors">
                                  {lesson.title}
                                </h4>
                                {isCompleted && (
                                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-[#3B507D] dark:text-slate-400 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{lesson.estimatedMinutes} min</span>
                                </span>
                                {lesson.interactive && (
                                  <>
                                    <span className="text-slate-300 dark:text-slate-600">·</span>
                                    <span className="text-[#1E5EFF] dark:text-blue-400 font-medium">Interactive practice</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-semibold text-[#1E5EFF] dark:text-blue-400 hidden sm:inline-block">
                              {isCompleted ? 'Review' : 'Start'}
                            </span>
                            <ArrowRight className="w-4 h-4 text-[#3B507D] dark:text-slate-400 group-hover:text-[#1E5EFF] dark:group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {activeQuizModule && (
        <QuizModal
          quiz={activeQuizModule.quiz}
          moduleId={activeQuizModule.id}
          isOpen={!!activeQuizModule}
          onClose={() => setActiveQuizModule(null)}
        />
      )}
    </>
  );
};
