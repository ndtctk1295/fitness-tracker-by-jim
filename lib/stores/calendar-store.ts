'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
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
  // Hydration state
  isHydrated: boolean;
  
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
  setHydrated: (hydrated: boolean) => void;
  
  // Navigation methods
  goToNextDate: () => void;
  goToPreviousDate: () => void;
  goToToday: () => void;
  
  // Utility methods
  getDateRange: () => { start: Date; end: Date };
  getCalendarDays: () => Date[];
  
  // Enhanced date range methods
  getFormattedDateRange: () => { startDate: string; endDate: string };
  getCurrentDateString: () => string;
  getSelectedDateString: () => string;
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
  isHydrated: false,
      
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
  setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
      
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
      },
      
      // Enhanced date range methods for easier integration
      getFormattedDateRange: () => {
        const { currentDate, calendarView } = get();
        const safeDate = currentDate || new Date();
        
        if (calendarView === 'month') {
          const startOfMonthDate = startOfMonth(safeDate);
          const endOfMonthDate = endOfMonth(safeDate);
          return {
            startDate: format(startOfMonthDate, 'yyyy-MM-dd'),
            endDate: format(endOfMonthDate, 'yyyy-MM-dd')
          };
        } else if (calendarView === 'week') {
          const startOfWeekDate = startOfWeek(safeDate, { weekStartsOn: 0 }); // Sunday
          const endOfWeekDate = endOfWeek(safeDate, { weekStartsOn: 0 });
          return {
            startDate: format(startOfWeekDate, 'yyyy-MM-dd'),
            endDate: format(endOfWeekDate, 'yyyy-MM-dd')
          };
        } else {
          // Default to current date for day view
          const dateStr = format(safeDate, 'yyyy-MM-dd');
          return { startDate: dateStr, endDate: dateStr };
        }
      },
      
      getCurrentDateString: () => {
        const { currentDate } = get();
        return format(currentDate || new Date(), 'yyyy-MM-dd');
      },
      
      getSelectedDateString: () => {
        const { selectedDate } = get();
        return format(selectedDate || new Date(), 'yyyy-MM-dd');
      },
    }),
    {
      name: 'calendar-store',
      partialize: (state) => ({
        currentDate: state.currentDate,
        selectedDate: state.selectedDate,
        calendarView: state.calendarView,
        calendarDisplayMode: state.calendarDisplayMode
      }),
      onRehydrateStorage: () => (state, error) => {
        // This runs after rehydration finishes
          if (state) {
            // Ensure dates are properly converted back to Date objects
            if (state.currentDate && !(state.currentDate instanceof Date)) {
              state.currentDate = new Date(state.currentDate);
            }
            if (state.selectedDate && !(state.selectedDate instanceof Date)) {
              state.selectedDate = new Date(state.selectedDate);
            }
          }
          // Mark hydration complete to allow dependent queries to enable
          state && (state as any).isHydrated !== undefined;
          // Since we cannot call set here directly, use a microtask to update after hydration
          queueMicrotask(() => {
            try {
              // Access store and set hydrated flag
              const store = useCalendarStore.getState();
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              useCalendarStore.setState({ isHydrated: true });
            } catch {}
          });
        
      },
    }
  )
);

export default useCalendarStore;
