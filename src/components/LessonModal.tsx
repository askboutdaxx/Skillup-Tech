import React, { useEffect, useState } from 'react';
import { getLessonById } from '../data/curriculum';
import { useAuthProgress } from '../context/AuthProgressContext';
import { PracticeSandbox } from './PracticeSandbox';
import { QuizModal } from './QuizModal';
import { X, CheckCircle, ArrowLeft, ArrowRight, Lightbulb, Clock, BookOpen, Trophy } from 'lucide-react';

interface LessonModalProps {
  lessonId: string | null;
  onClose: () => void;
  onSelectLesson: (newLessonId: string) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lessonId,
  onClose,
  onSelectLesson,
}) => {
  const { profile, markLessonComplete, recordLastViewedLesson } = useAuthProgress();
  const [quizOpen, setQuizOpen] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const lessonData = lessonId ? getLessonById(lessonId) : undefined;

  useEffect(() => {
    if (lessonData) {
      recordLastViewedLesson(
        lessonData.track.id,
        lessonData.module.id,
        lessonData.lesson.id,
        lessonData.lesson.title
      );
    }
  }, [lessonData, recordLastViewedLesson]);

  if (!lessonId || !lessonData) return null;

  const { track, module, lesson } = lessonData;
  const isCompleted = profile.completedLessons.includes(lesson.id);

  const currentModuleLessons = module.lessons;
  const currentIdx = currentModuleLessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentIdx > 0 ? currentModuleLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < currentModuleLessons.length - 1 ? currentModuleLessons[currentIdx + 1] : null;

  const handleToggleComplete = async () => {
    setIsMarking(true);
    await markLessonComplete(lesson.id, track.id, module.id, lesson.title);
    setIsMarking(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-[#0D1E4C]/50 dark:bg-black/70 backdrop-blur-xs">
        <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#132044] rounded-2xl border border-[#D1E0FC] dark:border-[#233876] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#D1E0FC] dark:border-[#233876] bg-white dark:bg-[#132044] sticky top-0 z-10">
            <div className="flex items-center gap-2 text-xs text-[#3B507D] dark:text-slate-400 font-medium truncate pr-4">
              <span className="font-bold text-[#1E5EFF] dark:text-blue-400">{track.title}</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="truncate">{module.title.split(':')[0]}</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="flex items-center gap-1 text-[#3B507D] dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{lesson.estimatedMinutes} min read</span>
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#3B507D] dark:text-slate-400 hover:text-[#0D1E4C] dark:hover:text-white hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] transition-colors shrink-0"
              aria-label="Close lesson"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EAF1FF] dark:bg-[#1C2E60] text-[#1E5EFF] dark:text-blue-300 rounded-lg text-xs font-semibold mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Lesson</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0D1E4C] dark:text-white tracking-tight">
                {lesson.title}
              </h1>
              <p className="text-sm text-[#3B507D] dark:text-slate-400 mt-2 font-medium">
                {lesson.summary}
              </p>
            </div>

            {/* Main Lesson Content Paragraphs */}
            <div className="prose prose-slate max-w-none space-y-4 text-sm sm:text-base leading-relaxed text-[#0D1E4C] dark:text-slate-200">
              {lesson.content.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Interactive Sandbox if present */}
            {lesson.interactive && (
              <PracticeSandbox interactive={lesson.interactive} />
            )}

            {/* Key Takeaway Highlight Card */}
            <div className="p-5 rounded-2xl bg-[#EAF1FF] dark:bg-[#1C2E60]/60 border border-[#D1E0FC] dark:border-[#233876]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1E5EFF] dark:text-blue-300 uppercase tracking-wider mb-2">
                <Lightbulb className="w-4 h-4 text-[#1E5EFF] dark:text-blue-400" />
                <span>Key Takeaway</span>
              </div>
              <p className="text-sm font-semibold text-[#0D1E4C] dark:text-white leading-relaxed">
                {lesson.keyTakeaway}
              </p>
            </div>

            {/* End of module quiz callout if this is the last lesson */}
            {!nextLesson && (
              <div className="p-5 rounded-2xl bg-white dark:bg-[#132044] border border-[#1E5EFF] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#1E5EFF] dark:text-blue-400 uppercase tracking-wider">
                    Ready for the assessment?
                  </span>
                  <h4 className="text-base font-bold text-[#0D1E4C] dark:text-white">
                    Take the {module.title.split(':')[0]} Quiz
                  </h4>
                  <p className="text-xs text-[#3B507D] dark:text-slate-400 mt-0.5">
                    Test your knowledge and lock in your module mastery badge.
                  </p>
                </div>
                <button
                  onClick={() => setQuizOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1E5EFF] hover:bg-[#164BD6] text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-xs"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Start Quiz</span>
                </button>
              </div>
            )}
          </div>

          {/* Sticky Footer Actions */}
          <div className="px-6 py-4 bg-[#F8FAFC] dark:bg-[#0A1128] border-t border-[#D1E0FC] dark:border-[#233876] flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleToggleComplete}
              disabled={isMarking}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs ${
                isCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-[#1E5EFF] hover:bg-[#164BD6] text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isCompleted ? 'Completed ✓ (Click to toggle)' : 'Mark as Complete'}</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {prevLesson && (
                <button
                  onClick={() => onSelectLesson(prevLesson.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0D1E4C] dark:text-white bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] rounded-xl hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              )}

              {nextLesson ? (
                <button
                  onClick={() => onSelectLesson(nextLesson.id)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1E5EFF] hover:bg-[#164BD6] rounded-xl transition-colors shadow-2xs"
                >
                  <span>Next Lesson</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setQuizOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1E5EFF] hover:bg-[#164BD6] rounded-xl transition-colors shadow-2xs"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Take Quiz</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {quizOpen && (
        <QuizModal
          quiz={module.quiz}
          moduleId={module.id}
          isOpen={quizOpen}
          onClose={() => setQuizOpen(false)}
          onPassed={() => setQuizOpen(false)}
        />
      )}
    </>
  );
};
