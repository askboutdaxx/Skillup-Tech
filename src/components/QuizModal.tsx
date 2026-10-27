import React, { useState } from 'react';
import { ModuleQuiz } from '../data/curriculum';
import { useAuthProgress } from '../context/AuthProgressContext';
import { X, CheckCircle2, AlertCircle, Trophy, RotateCcw, ArrowRight } from 'lucide-react';

interface QuizModalProps {
  quiz: ModuleQuiz;
  moduleId: string;
  isOpen: boolean;
  onClose: () => void;
  onPassed?: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  quiz,
  moduleId,
  isOpen,
  onClose,
  onPassed,
}) => {
  const { saveQuizScore, profile } = useAuthProgress();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQuestion = quiz.questions[currentIdx];
  const totalQuestions = quiz.questions.length;
  const selected = selectedOptions[currentIdx];

  const handleSelect = (optIndex: number) => {
    if (showExplanation) return;
    setSelectedOptions((prev) => ({
      ...prev,
      [currentIdx]: optIndex,
    }));
  };

  const handleCheck = () => {
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      let correctCount = 0;
      quiz.questions.forEach((q, idx) => {
        if (selectedOptions[idx] === q.correctIndex) {
          correctCount++;
        }
      });
      const pct = Math.round((correctCount / totalQuestions) * 100);
      saveQuizScore(moduleId, pct);
      setIsFinished(true);
      if (pct >= 70 && onPassed) {
        onPassed();
      }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOptions({});
    setShowExplanation(false);
    setIsFinished(false);
  };

  let correctCount = 0;
  quiz.questions.forEach((q, idx) => {
    if (selectedOptions[idx] === q.correctIndex) {
      correctCount++;
    }
  });
  const scorePct = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = scorePct >= 70;
  const bestScore = profile.quizScores[moduleId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1E4C]/50 dark:bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#132044] rounded-2xl border border-[#D1E0FC] dark:border-[#233876] shadow-2xl overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-[#3B507D] dark:text-slate-400 hover:text-[#0D1E4C] dark:hover:text-white hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] transition-colors"
          aria-label="Close quiz"
        >
          <X className="w-5 h-5" />
        </button>

        {!isFinished ? (
          <div>
            {/* Header */}
            <div className="mb-6">
              <span className="text-xs font-bold text-[#1E5EFF] dark:text-blue-400 tracking-wide uppercase">
                Module Assessment
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0D1E4C] dark:text-white mt-1">
                {quiz.title}
              </h2>
              <div className="flex items-center justify-between text-xs text-[#3B507D] dark:text-slate-400 mt-2">
                <span>Question {currentIdx + 1} of {totalQuestions}</span>
                <span className="font-semibold text-[#1E5EFF] dark:text-blue-300 tabular-nums">
                  {Math.round(((currentIdx + 1) / totalQuestions) * 100)}% Completed
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#EAF1FF] dark:bg-[#1C2E60] rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-[#1E5EFF] transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-[#0D1E4C] dark:text-white leading-snug">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-2.5 mb-6">
              {currentQuestion.options.map((opt, optIdx) => {
                const isSelected = selected === optIdx;
                const isCorrect = optIdx === currentQuestion.correctIndex;
                let btnStyle = 'border-[#D1E0FC] dark:border-[#233876] hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] hover:border-[#1E5EFF] text-[#0D1E4C] dark:text-slate-200';

                if (showExplanation) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'border-red-500 bg-red-50 dark:bg-red-950/60 text-red-900 dark:text-red-200';
                  } else {
                    btnStyle = 'border-slate-200 dark:border-slate-800 opacity-60 text-slate-500';
                  }
                } else if (isSelected) {
                  btnStyle = 'border-[#1E5EFF] bg-[#EAF1FF] dark:bg-[#1C2E60] text-[#0D1E4C] dark:text-white font-semibold ring-1 ring-[#1E5EFF]';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(optIdx)}
                    disabled={showExplanation}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-sm transition-all flex items-start gap-3 ${btnStyle}`}
                  >
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation card */}
            {showExplanation && (
              <div className={`p-4 rounded-xl text-xs sm:text-sm mb-6 ${
                selected === currentQuestion.correctIndex
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-[#0D1E4C] dark:text-blue-200'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {selected === currentQuestion.correctIndex ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Correct Answer!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Explanation:</span>
                    </>
                  )}
                </div>
                <p className="leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}

            {/* Footer action */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D1E0FC]/60 dark:border-[#233876]/60">
              {!showExplanation ? (
                <button
                  onClick={handleCheck}
                  disabled={selected === undefined}
                  className="px-5 py-2.5 bg-[#1E5EFF] hover:bg-[#164BD6] text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-40"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1E5EFF] hover:bg-[#164BD6] text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
                >
                  <span>{currentIdx < totalQuestions - 1 ? 'Next Question' : 'View Results'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Finished scorecard */
          <div className="text-center py-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-[#EAF1FF] dark:bg-[#1C2E60] border border-[#D1E0FC] dark:border-[#233876] flex items-center justify-center mb-4">
              {isPassed ? (
                <Trophy className="w-10 h-10 text-[#1E5EFF] dark:text-blue-300" />
              ) : (
                <RotateCcw className="w-10 h-10 text-amber-600" />
              )}
            </div>

            <h3 className="text-2xl font-bold text-[#0D1E4C] dark:text-white">
              {isPassed ? 'Congratulations! Quiz Passed' : 'Keep practicing!'}
            </h3>
            <p className="text-sm text-[#3B507D] dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {isPassed
                ? 'You have demonstrated mastery of this module. Your streak has been updated and score saved.'
                : 'Review the module key takeaways and try again to achieve 70% or higher.'}
            </p>

            <div className="my-6 p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0A1128] border border-[#D1E0FC] dark:border-[#233876] inline-flex items-center gap-6">
              <div>
                <span className="block text-xs text-[#3B507D] dark:text-slate-400">Score</span>
                <span className="text-3xl font-extrabold text-[#0D1E4C] dark:text-white tabular-nums">
                  {scorePct}%
                </span>
              </div>
              <div className="h-8 w-px bg-[#D1E0FC] dark:bg-[#233876]" />
              <div>
                <span className="block text-xs text-[#3B507D] dark:text-slate-400">Correct</span>
                <span className="text-3xl font-extrabold text-[#1E5EFF] dark:text-blue-400 tabular-nums">
                  {correctCount}/{totalQuestions}
                </span>
              </div>
              {bestScore !== undefined && (
                <>
                  <div className="h-8 w-px bg-[#D1E0FC] dark:bg-[#233876]" />
                  <div>
                    <span className="block text-xs text-[#3B507D] dark:text-slate-400">Personal Best</span>
                    <span className="text-3xl font-extrabold text-[#0D1E4C] dark:text-white tabular-nums">
                      {Math.max(bestScore, scorePct)}%
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D1E0FC] dark:border-[#233876] bg-white dark:bg-[#0A1128] hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] text-sm font-semibold text-[#0D1E4C] dark:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#1E5EFF] hover:bg-[#164BD6] text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
              >
                Continue Learning
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
