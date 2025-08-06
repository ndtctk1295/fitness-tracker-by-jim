/**
 * Date utility functions for E2E tests
 * Provides dynamic dates relative to current date for consistent testing
 */

/**
 * Get date string in YYYY-MM-DD format
 * @param daysOffset - Number of days to offset from today (0 = today, 1 = tomorrow, -1 = yesterday)
 * @returns Date string in YYYY-MM-DD format
 */
export function getDateString(daysOffset: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
export function getTodayString(): string {
  return getDateString(0);
}

/**
 * Get yesterday's date string in YYYY-MM-DD format
 */
export function getYesterdayString(): string {
  return getDateString(-1);
}

/**
 * Get tomorrow's date string in YYYY-MM-DD format
 */
export function getTomorrowString(): string {
  return getDateString(1);
}

/**
 * Get date string for N days from today
 * @param days - Number of days from today
 */
export function getDateStringFromToday(days: number): string {
  return getDateString(days);
}

/**
 * Get formatted date for display (e.g., "August 6, 2025")
 * @param daysOffset - Number of days to offset from today
 */
export function getFormattedDate(daysOffset: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Get month and year string (e.g., "August 2025")
 * @param monthsOffset - Number of months to offset from current month
 */
export function getMonthYearString(monthsOffset: number = 0): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsOffset);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });
}

/**
 * Generate relative dates for test fixtures
 * Returns an object with common relative dates
 */
export function getRelativeDates() {
  return {
    yesterday: getYesterdayString(),
    today: getTodayString(),
    tomorrow: getTomorrowString(),
    twoDaysAgo: getDateString(-2),
    twoDaysFromNow: getDateString(2),
    oneWeekAgo: getDateString(-7),
    oneWeekFromNow: getDateString(7)
  };
}
