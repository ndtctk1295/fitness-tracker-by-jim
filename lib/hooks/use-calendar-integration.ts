import { useMemo } from 'react';
import { useCalendarStore } from '@/lib/stores/calendar-store';
import { useScheduledExerciseStore } from '@/lib/stores/scheduled-exercise-store';
import { format } from 'date-fns';

/**
 * Unified hook that integrates calendar UI state with exercise UI state
 * Provides clean interface for components that need both
 * Eliminates manual date range calculations in components
 */
export const useCalendarIntegration = () => {
  // Calendar UI state
  const {
    currentDate,
    selectedDate,
    calendarView,
    calendarDisplayMode,
    dialogOpen,
    scopeDialogOpen,
    draggedExercise,
    pendingReschedule,
    isRescheduling,
    getFormattedDateRange,
    getCurrentDateString,
    getSelectedDateString,
    ...calendarActions
  } = useCalendarStore();

  // Exercise UI state
  const {
    hasCheckedGeneration,
    isGenerating,
    showTemplateModal,
    showExerciseModal,
    selectedExerciseId,
    ...exerciseActions
  } = useScheduledExerciseStore();

  // Computed values with memoization
  const dateRange = useMemo(() => getFormattedDateRange(), [
    currentDate, 
    calendarView, 
    getFormattedDateRange
  ]);

  const currentDateString = useMemo(() => getCurrentDateString(), [
    currentDate, 
    getCurrentDateString
  ]);

  const selectedDateString = useMemo(() => getSelectedDateString(), [
    selectedDate, 
    getSelectedDateString
  ]);

  return {
    // Calendar state
    currentDate,
    selectedDate,
    calendarView,
    calendarDisplayMode,
    
    // Dialog and interaction states
    dialogOpen,
    scopeDialogOpen,
    draggedExercise,
    pendingReschedule,
    isRescheduling,
    
    // Exercise UI state
    hasCheckedGeneration,
    isGenerating,
    showTemplateModal,
    showExerciseModal,
    selectedExerciseId,
    
    // Computed values (memoized)
    dateRange,
    currentDateString,
    selectedDateString,
    
    // All actions from both stores
    ...calendarActions,
    ...exerciseActions,
  };
};

/**
 * Simple hook for just date range calculation
 * Useful when you only need the date range without other UI state
 */
export const useDateRange = () => {
  const { getFormattedDateRange, currentDate, calendarView } = useCalendarStore();
  
  return useMemo(() => getFormattedDateRange(), [
    currentDate, 
    calendarView, 
    getFormattedDateRange
  ]);
};

/**
 * Hook for calendar navigation actions
 * Useful when you only need navigation without full state
 */
export const useCalendarNavigation = () => {
  const {
    goToNextDate,
    goToPreviousDate,
    goToToday,
    setCalendarView,
    calendarView,
    currentDate,
  } = useCalendarStore();

  return {
    goToNextDate,
    goToPreviousDate,
    goToToday,
    setCalendarView,
    toggleView: () => setCalendarView(calendarView === 'month' ? 'week' : 'month'),
    calendarView,
    currentDate,
  };
};

export default useCalendarIntegration;
