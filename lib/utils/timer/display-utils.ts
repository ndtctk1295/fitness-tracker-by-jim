import { formatTime } from '@/lib/stores/timer-store';

/**
 * Display utility functions for timer UI
 */

/**
 * Format and display the current timer time
 * @param minutes - Current minutes remaining
 * @param seconds - Current seconds remaining
 * @returns Formatted time string
 */
export const displayTime = (minutes: number, seconds: number): string => {
  return formatTime(minutes * 60 + seconds);
};

/**
 * Calculate the percentage of timer completion
 * @param activeTimer - Current active timer state
 * @param currentStrategy - Current timer strategy
 * @param minutes - Current minutes remaining
 * @param seconds - Current seconds remaining
 * @returns Percentage complete (0-100)
 */
export const calculatePercentComplete = (
  activeTimer: { isActive: boolean; isRest: boolean },
  currentStrategy: { restDuration: number; activeDuration: number } | null,
  minutes: number,
  seconds: number
): number => {
  if (!activeTimer.isActive || !currentStrategy) return 0;

  const totalDuration = activeTimer.isRest
    ? currentStrategy.restDuration
    : currentStrategy.activeDuration;

  if (totalDuration <= 0) return 0;

  // For a countdown timer, we need to calculate how much time has elapsed
  // React-timer-hook gives us the remaining time, so we subtract from total
  const remainingTime = minutes * 60 + seconds;
  const elapsedTime = totalDuration - remainingTime;

  return Math.min(100, (elapsedTime / totalDuration) * 100);
};
