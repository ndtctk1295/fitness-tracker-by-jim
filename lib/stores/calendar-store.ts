'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import { useApiToast } from '@/lib/hooks/use-api-toast';

import {
  getCalendarDays,
  getCalendarDateRange,
  getNextDate,
  getPreviousDate,
  isDateInSameWeek
} from '@/lib/utils/calendar/date-utils';
import { categorizeExercises } from '@/lib/utils/calendar/exercise-utils';

// Calendar view types
type CalendarViewType = 'month' | 'week';
type CalendarDisplayMode = 'simple' | 'detailed';

// Reschedule pending data interface
interface PendingReschedule {
  exerciseId: string;
  newDate: string;
  exercise: any;
}

// Fetch information tracking
interface LastFetchInfo {
  year: number;
  month: number;
  date: number;
  view: 'month' | 'week';
}

// Calendar store state interface
interface CalendarStoreState {
  // UI state
  currentDate: Date;
  selectedDate: Date;
  calendarView: CalendarViewType;
  calendarDisplayMode: CalendarDisplayMode;
  dialogOpen: boolean;
  isRescheduling: boolean;
  scopeDialogOpen: boolean;
  draggedExercise: any | null;
  pendingReschedule: PendingReschedule | null;
  lastFetchInfo: LastFetchInfo;
  
  // Methods
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  setCalendarView: (view: CalendarViewType) => void;
  setCalendarDisplayMode: (mode: CalendarDisplayMode) => void;
  setDialogOpen: (open: boolean) => void;
  setScopeDialogOpen: (open: boolean) => void;
  setDraggedExercise: (exercise: any | null) => void;
  setPendingReschedule: (data: PendingReschedule | null) => void;
  setIsRescheduling: (isRescheduling: boolean) => void;
  
  // Navigation methods
  goToNextDate: () => void;
  goToPreviousDate: () => void;
  goToToday: () => void;
  
  // Utility methods
  getDateRange: () => { start: Date; end: Date };
  getCalendarDays: () => Date[];
}

// Create calendar store
export const useCalendarStore = create<CalendarStoreState>()(
  persist(
    (set, get) => ({
      // Initial UI state
      currentDate: new Date(),
      selectedDate: new Date(),
      calendarView: 'month',
      calendarDisplayMode: 'detailed',
      dialogOpen: false,
      isRescheduling: false,
      scopeDialogOpen: false,
      draggedExercise: null,
      pendingReschedule: null,
      lastFetchInfo: {
        year: 0,
        month: 0,
        date: 0,
        view: 'month'
      },
      
      // State setters
      setCurrentDate: (date: Date) => set({ currentDate: date }),
      setSelectedDate: (date: Date) => set({ selectedDate: date }),
      setCalendarView: (view: CalendarViewType) => set({ calendarView: view }),
      setCalendarDisplayMode: (mode: CalendarDisplayMode) => set({ calendarDisplayMode: mode }),
      setDialogOpen: (open: boolean) => set({ dialogOpen: open }),
      setScopeDialogOpen: (open: boolean) => set({ scopeDialogOpen: open }),
      setDraggedExercise: (exercise: any | null) => set({ draggedExercise: exercise }),
      setPendingReschedule: (data: PendingReschedule | null) => set({ pendingReschedule: data }),
      setIsRescheduling: (isRescheduling: boolean) => set({ isRescheduling }),
      
      // Navigation methods
      goToNextDate: () => {
        const { currentDate, calendarView } = get();
        const nextDate = getNextDate(currentDate, calendarView);
        set({ currentDate: nextDate });
      },
      
      goToPreviousDate: () => {
        const { currentDate, calendarView } = get();
        const prevDate = getPreviousDate(currentDate, calendarView);
        set({ currentDate: prevDate });
      },
      
      goToToday: () => {
        set({ currentDate: new Date() });
      },
      
      // Utility methods
      getDateRange: () => {
        const { currentDate, calendarView } = get();
        return getCalendarDateRange(currentDate, calendarView);
      },
      
      getCalendarDays: () => {
        const { currentDate, calendarView } = get();
        return getCalendarDays(currentDate, calendarView);
      }
    }),
    {
      name: 'calendar-store',
      partialize: (state) => ({
        currentDate: state.currentDate,
        selectedDate: state.selectedDate,
        calendarView: state.calendarView,
        calendarDisplayMode: state.calendarDisplayMode
      }),
    }
  )
);

// Hook for quick calendar data access
export const useCalendarData = () => {
  const { 
    currentDate, 
    calendarView, 
    getDateRange, 
    getCalendarDays 
  } = useCalendarStore();
  
  const dateRange = getDateRange();
  const days = getCalendarDays();
  
  return {
    currentDate,
    calendarView,
    dateRange,
    days,
    formattedStartDate: format(dateRange.start, 'yyyy-MM-dd'),
    formattedEndDate: format(dateRange.end, 'yyyy-MM-dd')
  };
};

export default useCalendarStore;
