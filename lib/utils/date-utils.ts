'use client';

import { format, parse, parseISO, addDays, subDays, eachDayOfInterval, isWithinInterval } from 'date-fns';

/**
 * Format a date to yyyy-MM-dd
 */
export const formatDateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Get today's date in yyyy-MM-dd format
 * Using a fixed time (noon) to avoid timezone issues between server and client
 */
export const getTodayString = (): string => {
  const now = new Date();
  // Create a new date with just the year, month, and day
  // Use noon to avoid any timezone issues
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  return formatDateString(today);
};

/**
 * Extract date part from ISO string or return original string if already in yyyy-MM-dd format
 */
export const extractDatePart = (dateString: string): string => {
  if (!dateString) return '';
  try {
    // Extract the yyyy-MM-dd part from ISO date string or return as is if already in that format
    return dateString.includes('T') ? dateString.split('T')[0] : dateString;
  } catch (error) {
    console.error('Error processing date string:', error);
    return dateString;
  }
};

/**
 * Check if a date string matches a specific date (with format yyyy-MM-dd)
 */
export const matchesDate = (dateString: string, targetDate: string): boolean => {
  if (!dateString || !targetDate) return false;
  try {
    const extractedDate = extractDatePart(dateString);
    const extractedTarget = extractDatePart(targetDate);
    const result = extractedDate === extractedTarget;
    
    // Add some debug output to help diagnose date comparison issues
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      // Only log on client-side in non-production environments

    }
    
    return result;
  } catch (error) {
    console.error('Error comparing dates:', error);
    return false;
  }
};

/**
 * Parse a date string in YYYY-MM-DD format
 * @param dateString Date string to parse
 * @returns Date object
 */
export const parseDateString = (dateString: string): Date => {
  return parse(dateString, 'yyyy-MM-dd', new Date());
};

/**
 * Safely parse an ISO date string, with fallback to current date
 * @param dateString ISO date string
 * @returns Date object
 */
export const safeParseISO = (dateString: string): Date => {
  try {
    return parseISO(dateString);
  } catch (error) {
    console.error('Invalid date string:', dateString);
    return new Date();
  }
};

/**
 * Get date range for the calendar view
 * @param date Base date
 * @param view Calendar view ('month' or 'week')
 * @returns Object with start and end dates
 */
export const getCalendarDateRange = (
  date: Date,
  view: 'month' | 'week'
): { start: Date; end: Date } => {
  if (view === 'month') {
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start: startDate, end: endDate };
  } else {
    // Week view
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - day);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return { start: startDate, end: endDate };
  }
};

/**
 * Gets the dates for this week
 * @param baseDate The reference date
 * @param weekStartsOn Day to start the week on (0 = Sunday)
 * @returns Array of dates for the week
 */
export const getDatesForWeek = (baseDate: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0): Date[] => {
  const day = baseDate.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  
  const firstDay = subDays(baseDate, diff);
  const lastDay = addDays(firstDay, 6);
  
  return eachDayOfInterval({ start: firstDay, end: lastDay });
};

/**
 * Check if a date falls within a given range
 * @param date Date to check
 * @param startDate Start of range
 * @param endDate End of range
 * @returns Boolean indicating if date is within range
 */
export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return isWithinInterval(date, { start: startDate, end: endDate });
};

/**
 * Get an array of dates between two dates
 * @param startDate Start of range
 * @param endDate End of range
 * @returns Array of dates
 */
export const getDatesBetween = (startDate: Date, endDate: Date): Date[] => {
  return eachDayOfInterval({ start: startDate, end: endDate });
};

/**
 * Format a date range as a string
 * @param startDate Start of range
 * @param endDate End of range
 * @returns Formatted date range string
 */
export const formatDateRange = (startDate: Date, endDate: Date): string => {
  // If dates are in the same month
  if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
    return `${format(startDate, 'MMM d')}-${format(endDate, 'd, yyyy')}`;
  } 
  // If dates are in the same year
  else if (startDate.getFullYear() === endDate.getFullYear()) {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  } 
  // Different years
  else {
    return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
  }
};

/**
 * Add leading zeros to a number
 * @param num Number to pad
 * @param size Desired string length
 * @returns Padded number string
 */
export const padNumber = (num: number, size: number): string => {
  let s = String(num);
  while (s.length < size) s = '0' + s;
  return s;
};
