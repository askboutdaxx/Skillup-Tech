import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, limit, query, orderBy } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { evaluateDailyStreak, getTodayDateString } from '../lib/streak';
import { TRACKS } from '../data/curriculum';
import confetti from 'canvas-confetti';

export interface LastLessonViewed {
  trackId: string;
  moduleId: string;
  lessonId: string;
  title: string;
  timestamp: number;
}

export interface Certificate {
  id: string;
  trackId: string;
  trackTitle: string;
  learnerName: string;
  issueDate: string;
  certificateCode: string;
}

export interface UserProgressData {
  uid: string;
  name: string;
  email: string;
  streakCount: number;
  longestStreak: number;
  lastActiveDate: string;
  activeDays: string[];
  completedLessons: string[];
  quizScores: Record<string, number>;
  certificates: Certificate[];
  lastLessonViewed: LastLessonViewed | null;
  theme?: 'light' | 'dark';
  updatedAt: string;
}

export interface PublicLeaderboardItem {
  uid: string;
  name: string;
  streakCount: number;
  longestStreak: number;
  completedCount: number;
  points: number;
  certificatesCount: number;
  lastActiveDate?: string;
}

interface AuthProgressContextType {
  user: User | null;
  profile: UserProgressData;
  isLoading: boolean;
  isSaving: boolean;
  isGuest: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: (guestName?: string) => void;
  markLessonComplete: (lessonId: string, trackId: string, moduleId: string, lessonTitle: string) => Promise<boolean>;
  recordLastViewedLesson: (trackId: string, moduleId: string, lessonId: string, lessonTitle: string) => Promise<void>;
  saveQuizScore: (moduleId: string, scorePercentage: number) => Promise<void>;
  claimCertificate: (trackId: string) => Promise<Certificate | null>;
  triggerConfetti: () => void;
  checkAndBumpDailyStreak: () => Promise<void>;
  fetchLeaderboard: () => Promise<PublicLeaderboardItem[]>;
}

const LOCAL_STORAGE_KEY = 'skillup_tech_learner_progress_v2';
const THEME_STORAGE_KEY = 'theme';

const defaultGuestProfile: UserProgressData = {
  uid: 'guest_user',
  name: 'Emmanuel',
  email: 'emmanuel@skillup.tech',
  streakCount: 1,
  longestStreak: 1,
  lastActiveDate: getTodayDateString(),
  activeDays: [getTodayDateString()],
  completedLessons: [],
  quizScores: {},
  certificates: [],
  lastLessonViewed: {
    trackId: 'data-analytics',
    moduleId: 'data-m1',
    lessonId: 'data-m1-l1',
    title: 'The Modern Analytics Lifecycle',
    timestamp: Date.now(),
  },
  updatedAt: new Date().toISOString(),
};

export function calculatePoints(data: UserProgressData): number {
  const lessonPts = (data.completedLessons?.length || 0) * 50;
  const quizScoresList = Object.values(data.quizScores || {});
  const quizPts = quizScoresList.reduce((acc, score) => acc + score, 0);
  const streakPts = (data.streakCount || 1) * 30;
  const certPts = (data.certificates?.length || 0) * 200;
  return lessonPts + quizPts + streakPts + certPts;
}

const AuthProgressContext = createContext<AuthProgressContextType | null>(null);

export const AuthProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark') return 'dark';
    } catch {
      // fallback
    }
    return 'light';
  });

  const [profile, setProfile] = useState<UserProgressData>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // fallback
    }
    return defaultGuestProfile;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(true);

  // Apply dark mode class to root document element and sync localStorage
  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      try {
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        // ignore
      }

      // Optionally save to Firestore profile if authenticated
      if (auth.currentUser && !auth.currentUser.isAnonymous) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        setDoc(userRef, { theme: nextTheme }, { merge: true }).catch((err) => {
          console.warn('Could not persist theme to Firestore:', err);
        });
      }

      return nextTheme;
    });
  }, []);

  // Trigger celebratory confetti
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#1E5EFF', '#60A5FA', '#93C5FD', '#FFFFFF', '#F59E0B'],
      });
    } catch (e) {
      console.warn('Confetti animation error: ', e);
    }
  }, []);

  // Save profile state to Firestore and localStorage, and sync public leaderboard projection
  const persistProfile = useCallback(async (data: UserProgressData, targetUid?: string) => {
    setIsSaving(true);
    const uid = targetUid || data.uid;

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore localStorage quota
    }

    if (uid && !uid.startsWith('guest_')) {
      const docPath = `users/${uid}`;
      try {
        const docRef = doc(db, 'users', uid);
        await setDoc(docRef, {
          ...data,
          uid,
          updatedAt: new Date().toISOString(),
        }, { merge: true });

        // Sync public leaderboard projection (No PII)
        const leaderRef = doc(db, 'leaderboard', uid);
        const points = calculatePoints(data);

        await setDoc(leaderRef, {
          uid,
          name: data.name || 'Anonymous Learner',
          streakCount: data.streakCount || 1,
          longestStreak: data.longestStreak || 1,
          completedCount: data.completedLessons?.length || 0,
          points,
          certificatesCount: data.certificates?.length || 0,
          lastActiveDate: data.lastActiveDate,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsSaving(false);
    }
  }, []);

  // Load user profile from Firestore upon login
  const loadProfileFromFirestore = useCallback(async (authUserData: User, explicitName?: string) => {
    const uid = authUserData.uid;
    const docPath = `users/${uid}`;
    let loadedData: UserProgressData | null = null;

    try {
      const docRef = doc(db, 'users', uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        loadedData = snap.data() as UserProgressData;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, docPath);
    }

    const displayName = explicitName || authUserData.displayName || loadedData?.name || authUserData.email?.split('@')[0] || 'Emmanuel';
    const email = authUserData.email || loadedData?.email || '';

    // Evaluate streak for today
    const currentStreak = loadedData?.streakCount ?? profile.streakCount ?? 1;
    const longestStreak = loadedData?.longestStreak ?? profile.longestStreak ?? 1;
    const lastActive = loadedData?.lastActiveDate ?? profile.lastActiveDate;
    const existingActiveDays = loadedData?.activeDays ?? profile.activeDays ?? [];

    const evalResult = evaluateDailyStreak(currentStreak, longestStreak, lastActive, existingActiveDays);

    if (loadedData?.theme === 'dark' || loadedData?.theme === 'light') {
      const remoteTheme = loadedData.theme;
      setTheme(remoteTheme);
      try {
        if (remoteTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        localStorage.setItem(THEME_STORAGE_KEY, remoteTheme);
      } catch {
        // ignore
      }
    }

    const mergedData: UserProgressData = {
      uid,
      name: displayName,
      email,
      streakCount: evalResult.newStreak,
      longestStreak: evalResult.newLongest,
      lastActiveDate: evalResult.newLastActiveDate,
      activeDays: evalResult.newActiveDays,
      completedLessons: loadedData?.completedLessons || profile.completedLessons || [],
      quizScores: loadedData?.quizScores || profile.quizScores || {},
      certificates: loadedData?.certificates || profile.certificates || [],
      lastLessonViewed: loadedData?.lastLessonViewed || profile.lastLessonViewed || defaultGuestProfile.lastLessonViewed,
      theme: loadedData?.theme || theme,
      updatedAt: new Date().toISOString(),
    };

    setProfile(mergedData);
    setIsGuest(false);
    await persistProfile(mergedData, uid);
  }, [persistProfile, profile, theme]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuest(false);
        await loadProfileFromFirestore(currentUser);
      } else {
        setIsGuest(true);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [loadProfileFromFirestore]);

  // Google sign in
  const signInWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        await loadProfileFromFirestore(cred.user);
      }
    } catch (error) {
      console.error('Google Sign In failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadProfileFromFirestore]);

  // Email sign up
  const signUpWithEmail = useCallback(async (name: string, email: string, pass: string) => {
    try {
      setIsLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
        await loadProfileFromFirestore(cred.user, name);
      }
    } catch (error) {
      console.error('Email sign up failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadProfileFromFirestore]);

  // Email login
  const loginWithEmail = useCallback(async (email: string, pass: string) => {
    try {
      setIsLoading(true);
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await loadProfileFromFirestore(cred.user);
      }
    } catch (error) {
      console.error('Email login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadProfileFromFirestore]);

  // Sign out
  const logout = useCallback(async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      setIsGuest(true);
      setProfile(prev => ({
        ...prev,
        uid: 'guest_user',
      }));
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, []);

  // Continue as guest
  const continueAsGuest = useCallback((guestName: string = 'Emmanuel') => {
    const today = getTodayDateString();
    const guestData: UserProgressData = {
      ...profile,
      uid: 'guest_' + Math.random().toString(36).substring(2, 9),
      name: guestName.trim() || 'Emmanuel',
      lastActiveDate: today,
      activeDays: profile.activeDays.includes(today) ? profile.activeDays : [...profile.activeDays, today],
    };
    setProfile(guestData);
    setIsGuest(true);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(guestData));
  }, [profile]);

  // Check if track is completed
  const checkTrackCompletion = useCallback((trackId: string, currentCompleted: string[]): boolean => {
    const track = TRACKS.find(t => t.id === trackId || t.slug === trackId);
    if (!track) return false;
    let allCompleted = true;
    for (const mod of track.modules) {
      for (const les of mod.lessons) {
        if (!currentCompleted.includes(les.id)) {
          allCompleted = false;
          break;
        }
      }
      if (!allCompleted) break;
    }
    return allCompleted;
  }, []);

  // Claim or get certificate for completed track
  const claimCertificate = useCallback(async (trackId: string): Promise<Certificate | null> => {
    const track = TRACKS.find(t => t.id === trackId || t.slug === trackId);
    if (!track) return null;

    const existing = profile.certificates?.find(c => c.trackId === trackId);
    if (existing) return existing;

    const isEligible = checkTrackCompletion(trackId, profile.completedLessons);
    if (!isEligible) return null;

    const certId = `cert_${trackId}_${Date.now().toString(36)}`;
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    const code = `SKILLUP-${track.slug.toUpperCase().slice(0, 4)}-${new Date().getFullYear()}-${randomHex}`;

    const newCert: Certificate = {
      id: certId,
      trackId,
      trackTitle: track.title,
      learnerName: profile.name || 'Emmanuel',
      issueDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      certificateCode: code,
    };

    const updatedProfile: UserProgressData = {
      ...profile,
      certificates: [...(profile.certificates || []), newCert],
      updatedAt: new Date().toISOString(),
    };

    setProfile(updatedProfile);
    triggerConfetti();
    await persistProfile(updatedProfile);
    return newCert;
  }, [checkTrackCompletion, persistProfile, profile, triggerConfetti]);

  // Mark lesson as complete, update streak, check certificate
  const markLessonComplete = useCallback(async (
    lessonId: string,
    trackId: string,
    moduleId: string,
    lessonTitle: string
  ): Promise<boolean> => {
    const isAlreadyCompleted = profile.completedLessons.includes(lessonId);
    const newCompleted = isAlreadyCompleted
      ? profile.completedLessons
      : [...profile.completedLessons, lessonId];

    const evalResult = evaluateDailyStreak(
      profile.streakCount,
      profile.longestStreak,
      profile.lastActiveDate,
      profile.activeDays
    );

    let updatedCertificates = [...(profile.certificates || [])];
    const isTrackFinished = checkTrackCompletion(trackId, newCompleted);
    const hasCert = updatedCertificates.some(c => c.trackId === trackId);

    if (isTrackFinished && !hasCert) {
      const track = TRACKS.find(t => t.id === trackId);
      if (track) {
        const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
        updatedCertificates.push({
          id: `cert_${trackId}_${Date.now().toString(36)}`,
          trackId,
          trackTitle: track.title,
          learnerName: profile.name || 'Emmanuel',
          issueDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          certificateCode: `SKILLUP-${track.slug.toUpperCase().slice(0, 4)}-${new Date().getFullYear()}-${randomHex}`,
        });
      }
    }

    const updatedProfile: UserProgressData = {
      ...profile,
      completedLessons: newCompleted,
      streakCount: evalResult.newStreak,
      longestStreak: evalResult.newLongest,
      lastActiveDate: evalResult.newLastActiveDate,
      activeDays: evalResult.newActiveDays,
      certificates: updatedCertificates,
      lastLessonViewed: {
        trackId,
        moduleId,
        lessonId,
        title: lessonTitle,
        timestamp: Date.now(),
      },
      updatedAt: new Date().toISOString(),
    };

    setProfile(updatedProfile);
    triggerConfetti();
    await persistProfile(updatedProfile);
    return !isAlreadyCompleted;
  }, [checkTrackCompletion, persistProfile, profile, triggerConfetti]);

  // Save last viewed lesson
  const recordLastViewedLesson = useCallback(async (
    trackId: string,
    moduleId: string,
    lessonId: string,
    lessonTitle: string
  ) => {
    if (
      profile.lastLessonViewed?.lessonId === lessonId &&
      profile.lastLessonViewed?.trackId === trackId
    ) {
      return;
    }

    const updatedProfile: UserProgressData = {
      ...profile,
      lastLessonViewed: {
        trackId,
        moduleId,
        lessonId,
        title: lessonTitle,
        timestamp: Date.now(),
      },
      updatedAt: new Date().toISOString(),
    };

    setProfile(updatedProfile);
    await persistProfile(updatedProfile);
  }, [persistProfile, profile]);

  // Save quiz score
  const saveQuizScore = useCallback(async (moduleId: string, scorePercentage: number) => {
    const existingScore = profile.quizScores[moduleId] || 0;
    const bestScore = Math.max(existingScore, scorePercentage);

    const evalResult = evaluateDailyStreak(
      profile.streakCount,
      profile.longestStreak,
      profile.lastActiveDate,
      profile.activeDays
    );

    const updatedProfile: UserProgressData = {
      ...profile,
      quizScores: {
        ...profile.quizScores,
        [moduleId]: bestScore,
      },
      streakCount: evalResult.newStreak,
      longestStreak: evalResult.newLongest,
      lastActiveDate: evalResult.newLastActiveDate,
      activeDays: evalResult.newActiveDays,
      updatedAt: new Date().toISOString(),
    };

    setProfile(updatedProfile);
    if (scorePercentage >= 70) {
      triggerConfetti();
    }
    await persistProfile(updatedProfile);
  }, [persistProfile, profile, triggerConfetti]);

  // Check and bump daily streak on initial daily visit
  const checkAndBumpDailyStreak = useCallback(async () => {
    const today = getTodayDateString();
    if (profile.lastActiveDate !== today) {
      const evalResult = evaluateDailyStreak(
        profile.streakCount,
        profile.longestStreak,
        profile.lastActiveDate,
        profile.activeDays
      );
      const updatedProfile: UserProgressData = {
        ...profile,
        streakCount: evalResult.newStreak,
        longestStreak: evalResult.newLongest,
        lastActiveDate: evalResult.newLastActiveDate,
        activeDays: evalResult.newActiveDays,
        updatedAt: new Date().toISOString(),
      };
      setProfile(updatedProfile);
      await persistProfile(updatedProfile);
    }
  }, [persistProfile, profile]);

  // Fetch live Firestore leaderboard with realistic peer learners
  const fetchLeaderboard = useCallback(async (): Promise<PublicLeaderboardItem[]> => {
    const defaultPeers: PublicLeaderboardItem[] = [
      {
        uid: 'peer_1',
        name: 'Amina Bello',
        streakCount: 14,
        longestStreak: 18,
        completedCount: 22,
        points: 2150,
        certificatesCount: 2,
        lastActiveDate: getTodayDateString(),
      },
      {
        uid: 'peer_2',
        name: 'Chidi Okafor',
        streakCount: 9,
        longestStreak: 12,
        completedCount: 17,
        points: 1720,
        certificatesCount: 1,
        lastActiveDate: getTodayDateString(),
      },
      {
        uid: 'peer_3',
        name: 'Fatima Al-Mansoor',
        streakCount: 8,
        longestStreak: 10,
        completedCount: 15,
        points: 1490,
        certificatesCount: 1,
        lastActiveDate: getTodayDateString(),
      },
      {
        uid: 'peer_4',
        name: 'Liam Chen',
        streakCount: 6,
        longestStreak: 8,
        completedCount: 11,
        points: 1180,
        certificatesCount: 0,
        lastActiveDate: getTodayDateString(),
      },
      {
        uid: 'peer_5',
        name: 'Zainab Idris',
        streakCount: 4,
        longestStreak: 7,
        completedCount: 8,
        points: 920,
        certificatesCount: 0,
        lastActiveDate: getTodayDateString(),
      },
    ];

    try {
      const leaderCol = collection(db, 'leaderboard');
      const q = query(leaderCol, orderBy('points', 'desc'), limit(25));
      const snap = await getDocs(q);

      const firestoreItems: PublicLeaderboardItem[] = [];
      snap.forEach((d) => {
        firestoreItems.push(d.data() as PublicLeaderboardItem);
      });

      const currentUserEntry: PublicLeaderboardItem = {
        uid: profile.uid,
        name: profile.name || 'Emmanuel',
        streakCount: profile.streakCount || 1,
        longestStreak: profile.longestStreak || 1,
        completedCount: profile.completedLessons?.length || 0,
        points: calculatePoints(profile),
        certificatesCount: profile.certificates?.length || 0,
        lastActiveDate: profile.lastActiveDate,
      };

      const combinedMap = new Map<string, PublicLeaderboardItem>();
      defaultPeers.forEach(p => combinedMap.set(p.uid, p));
      firestoreItems.forEach(p => combinedMap.set(p.uid, p));
      combinedMap.set(currentUserEntry.uid, currentUserEntry);

      const sorted = Array.from(combinedMap.values()).sort((a, b) => b.points - a.points);
      return sorted;
    } catch {
      const currentUserEntry: PublicLeaderboardItem = {
        uid: profile.uid,
        name: profile.name || 'Emmanuel',
        streakCount: profile.streakCount || 1,
        longestStreak: profile.longestStreak || 1,
        completedCount: profile.completedLessons?.length || 0,
        points: calculatePoints(profile),
        certificatesCount: profile.certificates?.length || 0,
        lastActiveDate: profile.lastActiveDate,
      };

      const list = [currentUserEntry, ...defaultPeers].sort((a, b) => b.points - a.points);
      return list;
    }
  }, [profile]);

  const value = useMemo(() => ({
    user,
    profile,
    isLoading,
    isSaving,
    isGuest,
    theme,
    toggleTheme,
    signInWithGoogle,
    signUpWithEmail,
    loginWithEmail,
    logout,
    continueAsGuest,
    markLessonComplete,
    recordLastViewedLesson,
    saveQuizScore,
    claimCertificate,
    triggerConfetti,
    checkAndBumpDailyStreak,
    fetchLeaderboard,
  }), [
    user,
    profile,
    isLoading,
    isSaving,
    isGuest,
    theme,
    toggleTheme,
    signInWithGoogle,
    signUpWithEmail,
    loginWithEmail,
    logout,
    continueAsGuest,
    markLessonComplete,
    recordLastViewedLesson,
    saveQuizScore,
    claimCertificate,
    triggerConfetti,
    checkAndBumpDailyStreak,
    fetchLeaderboard,
  ]);

  return (
    <AuthProgressContext.Provider value={value}>
      {children}
    </AuthProgressContext.Provider>
  );
};

export function useAuthProgress() {
  const context = useContext(AuthProgressContext);
  if (!context) {
    throw new Error('useAuthProgress must be used within an AuthProgressProvider');
  }
  return context;
}
