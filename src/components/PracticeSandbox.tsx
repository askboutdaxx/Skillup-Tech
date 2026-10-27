import React, { useState } from 'react';
import { LessonInteractive } from '../data/curriculum';
import { Play, RotateCcw, Check, Terminal, Sparkles, Code2 } from 'lucide-react';

interface PracticeSandboxProps {
  interactive: LessonInteractive;
}

export const PracticeSandbox: React.FC<PracticeSandboxProps> = ({ interactive }) => {
  const [inputVal, setInputVal] = useState<string>(interactive.defaultInput);
  const [outputVal, setOutputVal] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setOutputVal(interactive.simulatedOutput || 'Execution completed with 0 errors.');
    }, 300);
  };

  const handleReset = () => {
    setInputVal(interactive.defaultInput);
    setOutputVal(null);
  };

  return (
    <div className="my-6 rounded-2xl border border-[#D1E0FC] dark:border-[#233876] bg-white dark:bg-[#132044] overflow-hidden shadow-xs">
      <div className="flex items-center justify-between px-4 py-3 bg-[#EAF1FF] dark:bg-[#1C2E60] border-b border-[#D1E0FC] dark:border-[#233876]">
        <div className="flex items-center gap-2">
          {interactive.type === 'python' ? (
            <Code2 className="w-4 h-4 text-[#1E5EFF] dark:text-blue-300" />
          ) : interactive.type === 'prompt' ? (
            <Sparkles className="w-4 h-4 text-[#1E5EFF] dark:text-blue-300" />
          ) : (
            <Terminal className="w-4 h-4 text-[#1E5EFF] dark:text-blue-300" />
          )}
          <span className="text-xs font-bold text-[#0D1E4C] dark:text-white uppercase tracking-wide">
            {interactive.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#3B507D] dark:text-slate-300 hover:text-[#0D1E4C] dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-[#132044] transition-colors"
            title="Reset code"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#1E5EFF] hover:bg-[#164BD6] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs disabled:opacity-50"
          >
            {isRunning ? (
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3 h-3 fill-white" />
            )}
            <span>{interactive.type === 'prompt' ? 'Test Prompt' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 bg-[#F8FAFC] dark:bg-[#0A1128]">
        <p className="text-xs text-[#3B507D] dark:text-slate-400 mb-2 font-medium">
          {interactive.instruction}
        </p>
        <textarea
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          rows={Math.min(10, Math.max(4, inputVal.split('\n').length + 1))}
          className="w-full p-3 font-mono text-xs text-[#0D1E4C] dark:text-slate-200 bg-white dark:bg-[#132044] border border-[#D1E0FC] dark:border-[#233876] rounded-xl focus:outline-none focus:border-[#1E5EFF] transition-colors resize-y leading-relaxed"
          spellCheck={false}
        />
      </div>

      {outputVal !== null && (
        <div className="p-4 bg-[#0D1E4C] dark:bg-black text-white border-t border-[#D1E0FC] dark:border-[#233876]">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-1.5">
            <Check className="w-3.5 h-3.5 text-blue-400" />
            <span>Output Console</span>
          </div>
          <pre className="font-mono text-xs text-blue-50 dark:text-blue-200 whitespace-pre-wrap leading-relaxed">
            {outputVal}
          </pre>
        </div>
      )}
    </div>
  );
};
