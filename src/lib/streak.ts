export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(d: Date = new Date()): string {
  const yesterday = new Date(d);
  yesterday.setDate(yesterday.getDate() - 1);
  return getTodayDateString(yesterday);
}

export function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function calculateDayDifference(dateStr1: string, dateStr2: string): number {
  const d1 = parseDateString(dateStr1);
  const d2 = parseDateString(dateStr2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export interface StreakEvaluation {
  newStreak: number;
  newLongest: number;
  newLastActiveDate: string;
  newActiveDays: string[];
  isNewDay: boolean;
}

export function evaluateDailyStreak(
  currentStreak: number,
  longestStreak: number,
  lastActiveDate: string | null | undefined,
  activeDays: string[] = []
): StreakEvaluation {
  const today = getTodayDateString();
  const daysList = Array.isArray(activeDays) ? [...activeDays] : [];

  if (!daysList.includes(today)) {
    daysList.push(today);
  }

  // Brand new user or first activity
  if (!lastActiveDate) {
    const streak = 1;
    return {
      newStreak: streak,
      newLongest: Math.max(longestStreak || 0, streak),
      newLastActiveDate: today,
      newActiveDays: daysList,
      isNewDay: true,
    };
  }

  // Already logged active today
  if (lastActiveDate === today) {
    return {
      newStreak: Math.max(currentStreak, 1),
      newLongest: Math.max(longestStreak, currentStreak, 1),
      newLastActiveDate: today,
      newActiveDays: daysList,
      isNewDay: false,
    };
  }

  const yesterday = getYesterdayDateString();
  if (lastActiveDate === yesterday) {
    // Consecutive day activity!
    const newStreak = currentStreak + 1;
    return {
      newStreak,
      newLongest: Math.max(longestStreak, newStreak),
      newLastActiveDate: today,
      newActiveDays: daysList,
      isNewDay: true,
    };
  }

  // Missed one or more days -> reset to 1
  const resetStreak = 1;
  return {
    newStreak: resetStreak,
    newLongest: Math.max(longestStreak, resetStreak),
    newLastActiveDate: today,
    newActiveDays: daysList,
    isNewDay: true,
  };
}

export interface WeekDayStatus {
  dayName: string; // 'Mon', 'Tue', ...
  fullDayName: string; // 'Monday', ...
  dateString: string; // 'YYYY-MM-DD'
  dayNumber: number; // 1-31
  isActive: boolean;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

/**
 * Generates the 7 days of the current week (Monday to Sunday).
 */
export function getCurrentWeekDays(activeDays: string[] = []): WeekDayStatus[] {
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
  // Normalize so Monday is index 0
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const todayStr = getTodayDateString(now);
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const week: WeekDayStatus[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = getTodayDateString(d);
    
    const isToday = dateStr === todayStr;
    const isPast = dateStr < todayStr;
    const isFuture = dateStr > todayStr;
    const isActive = activeDays.includes(dateStr);

    week.push({
      dayName: dayLabels[i],
      fullDayName: fullLabels[i],
      dateString: dateStr,
      dayNumber: d.getDate(),
      isActive,
      isToday,
      isPast,
      isFuture,
    });
  }

  return week;
}
