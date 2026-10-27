import React, { useState } from 'react';
import { useAuthProgress } from '../context/AuthProgressContext';
import { X, Sparkles, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'signup',
}) => {
  const { user, signInWithGoogle, signUpWithEmail, loginWithEmail, continueAsGuest } = useAuthProgress();
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setErrorMsg('Please enter your name.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password should be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }
        await signUpWithEmail(name.trim(), email.trim(), password);
      } else {
        await loginWithEmail(email.trim(), password);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth/email-already-in-use')) {
        setErrorMsg('An account with this email already exists. Please log in.');
      } else if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        setErrorMsg('Invalid email or password. Please check your credentials.');
      } else if (msg.includes('auth/weak-password')) {
        setErrorMsg('Password is too weak. Please use at least 6 characters.');
      } else {
        setErrorMsg('Authentication error. Please try again or use Google sign-in.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('popup-closed-by-user')) {
        setErrorMsg('Google sign-in was interrupted. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuest = () => {
    const chosenName = name.trim() || 'Emmanuel';
    continueAsGuest(chosenName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1E4C]/50 dark:bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-[#132044] rounded-2xl border border-[#D1E0FC] dark:border-[#233876] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-[#3B507D] dark:text-slate-400 hover:text-[#0D1E4C] dark:hover:text-white hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EAF1FF] dark:bg-[#1C2E60] text-[#1E5EFF] dark:text-blue-300 rounded-lg text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SkillUp Tech Account</span>
          </div>
          <h2 className="text-2xl font-bold text-[#0D1E4C] dark:text-white tracking-tight">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-[#3B507D] dark:text-slate-400 mt-1">
            {mode === 'signup'
              ? 'Save your daily streaks and sync lessons across any device.'
              : 'Log in to continue your learning streak right where you left off.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Google One-Click Auth */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#D1E0FC] dark:border-[#233876] bg-white dark:bg-[#0A1128] hover:bg-[#EAF1FF] dark:hover:bg-[#1C2E60] text-sm font-semibold text-[#0D1E4C] dark:text-white transition-colors shadow-2xs mb-4 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px bg-[#D1E0FC] dark:bg-[#233876] flex-1" />
          <span className="text-xs text-[#3B507D] dark:text-slate-400 font-medium">or continue with email</span>
          <div className="h-px bg-[#D1E0FC] dark:bg-[#233876] flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#0D1E4C] dark:text-slate-200 mb-1">
                Your Name (for personalized greeting)
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-3 text-[#3B507D] dark:text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Emmanuel"
                  className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] dark:bg-[#0A1128] border border-[#D1E0FC] dark:border-[#233876] rounded-xl text-sm text-[#0D1E4C] dark:text-white placeholder-[#3B507D]/60 dark:placeholder-slate-500 focus:outline-none focus:border-[#1E5EFF] focus:bg-white dark:focus:bg-[#132044] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#0D1E4C] dark:text-slate-200 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#3B507D] dark:text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] dark:bg-[#0A1128] border border-[#D1E0FC] dark:border-[#233876] rounded-xl text-sm text-[#0D1E4C] dark:text-white placeholder-[#3B507D]/60 dark:placeholder-slate-500 focus:outline-none focus:border-[#1E5EFF] focus:bg-white dark:focus:bg-[#132044] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0D1E4C] dark:text-slate-200 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-[#3B507D] dark:text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] dark:bg-[#0A1128] border border-[#D1E0FC] dark:border-[#233876] rounded-xl text-sm text-[#0D1E4C] dark:text-white placeholder-[#3B507D]/60 dark:placeholder-slate-500 focus:outline-none focus:border-[#1E5EFF] focus:bg-white dark:focus:bg-[#132044] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-[#1E5EFF] hover:bg-[#164BD6] text-white font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Account' : 'Log In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[#D1E0FC]/60 dark:border-[#233876]/60 flex flex-col gap-2.5 text-center">
          <div className="text-xs text-[#3B507D] dark:text-slate-400">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setMode(mode === 'signup' ? 'login' : 'signup');
              }}
              className="text-[#1E5EFF] dark:text-blue-400 font-semibold hover:underline"
            >
              {mode === 'signup' ? 'Log in' : 'Sign up'}
            </button>
          </div>

          {!user && (
            <button
              type="button"
              onClick={handleGuest}
              className="text-xs text-[#3B507D] dark:text-slate-400 hover:text-[#0D1E4C] dark:hover:text-white font-medium transition-colors"
            >
              Or explore instantly as guest (saves locally)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
