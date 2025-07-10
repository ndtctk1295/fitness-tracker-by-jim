import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
} from "date-fns";

/**
 * Calculate date range for month or week view
 */
export function getCalendarDateRange(currentDate: Date, view: 'month' | 'week') {
  if (view === 'month') {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return { start: monthStart, end: monthEnd };
  } else {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    return { start: weekStart, end: weekEnd };
  }
}

/**
 * Format days for calendar display
 */
export function getCalendarDays(currentDate: Date, calendarView: 'month' | 'week') {
  const start = calendarView === 'month'
    ? startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
    : startOfWeek(currentDate, { weekStartsOn: 0 });

  const end = calendarView === 'month'
    ? endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
    : endOfWeek(currentDate, { weekStartsOn: 0 });

  return eachDayOfInterval({ start, end });
}

/**
 * Navigation functions for calendar
 */
export function getNextDate(currentDate: Date, view: 'month' | 'week') {
  return view === 'month' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1);
}

export function getPreviousDate(currentDate: Date, view: 'month' | 'week') {
  return view === 'month' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1);
}

/**
 * Check if a date is in the same week
 */
export function isDateInSameWeek(date1: Date, date2: Date) {
  const date1WeekStart = startOfWeek(date1, { weekStartsOn: 0 });
  const date2WeekStart = startOfWeek(date2, { weekStartsOn: 0 });
  
  return format(date1WeekStart, 'yyyy-MM-dd') === format(date2WeekStart, 'yyyy-MM-dd');
}

/**
 * Format header text based on view
 */
export function getCalendarHeaderText(currentDate: Date, view: 'month' | 'week') {
  if (view === 'month') {
    return format(currentDate, 'MMMM yyyy');
  } else {
    return `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d')} - ${format(endOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}`;
  }
}

/**
 * Check if a date should be highlighted as today
 */
export function isToday(date: Date) {
  return isSameDay(date, new Date());
}

/**
 * Check if a date is in the current month
 */
export function isCurrentMonth(date: Date, currentMonthDate: Date) {
  return isSameMonth(date, currentMonthDate);
}
