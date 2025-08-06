'use client';

import { useMemo, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  useScheduledExercises,
  useScheduledExercisesForDate,
  useAddScheduledExercise,
  useUpdateScheduledExercise,
  useDeleteScheduledExercise,
  useCheckExerciseGeneration,
  useGenerateExercises
} from '@/lib/queries';
import { scheduledExerciseService } from '@/lib/services/clients-service/scheduled-exercise-service';

// Calendar view types
type CalendarViewType = 'day' | 'week' | 'month';

// UI state interface
interface ScheduledExerciseUIState {
  calendarView: CalendarViewType;
  selectedDate: string | null;
  hasCheckedGeneration: boolean;
}

// React Query-based scheduled exercise store hook
export const useScheduledExerciseStore = () => {
  // UI state
  const [uiState, setUIState] = useState<ScheduledExerciseUIState>({
    calendarView: 'month',
    selectedDate: null,
    hasCheckedGeneration: false,
  });

  // Date range for current view (you'd calculate this based on calendar view)
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});

  // Use React Query hooks for data fetching
  const scheduledExercisesQuery = useScheduledExercises(dateRange.startDate, dateRange.endDate);
  const checkGenerationQuery = useCheckExerciseGeneration();

  // Mutations
  const addExerciseMutation = useAddScheduledExercise();
  const updateExerciseMutation = useUpdateScheduledExercise();
  const deleteExerciseMutation = useDeleteScheduledExercise();
  const generateExercisesMutation = useGenerateExercises();

  // Computed values
  const scheduledExercises = scheduledExercisesQuery.data || [];
  
  // Debug when query data changes (simplified)
  useEffect(() => {
    if (scheduledExercisesQuery.data) {
      const aug8Count = scheduledExercisesQuery.data.filter((ex: any) => ex.date === '2025-08-08').length;
      console.log('🏪 [ScheduledStore] Query updated - Total:', scheduledExercisesQuery.data.length, 'Aug8:', aug8Count);
    }
  }, [scheduledExercisesQuery.data]);
  
  const isLoading = scheduledExercisesQuery.isLoading;
  const error = scheduledExercisesQuery.error;
  const initialized = !scheduledExercisesQuery.isLoading;

  // Utility functions
  const getExercisesForDate = useMemo(() => (date: Date | string) => {
    const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
    return scheduledExercises.filter((exercise: any) => exercise.date === dateStr);
  }, [scheduledExercises]);

  const getCompletedExercises = useMemo(() => () => {
    return scheduledExercises.filter((exercise: any) => exercise.completed);
  }, [scheduledExercises]);

  const getPendingExercises = useMemo(() => () => {
    return scheduledExercises.filter((exercise: any) => !exercise.completed);
  }, [scheduledExercises]);

  const getExercisesByCategory = useMemo(() => (categoryId: string) => {
    return scheduledExercises.filter((exercise: any) => exercise.categoryId === categoryId);
  }, [scheduledExercises]);

  const getExercisesByDateRange = useMemo(() => (startDate: string, endDate: string) => {
    return scheduledExercises.filter((exercise: any) => 
      exercise.date >= startDate && exercise.date <= endDate
    );
  }, [scheduledExercises]);

  // Calendar view management
  const setCalendarView = (view: CalendarViewType) => {
    setUIState(prev => ({ ...prev, calendarView: view }));
  };

  const setSelectedDate = (date: string | null) => {
    setUIState(prev => ({ ...prev, selectedDate: date }));
  };

  // Data fetching functions
  const fetchAll = () => scheduledExercisesQuery.refetch();

  const fetchExercisesForDate = async (date: string) => {
    // This would use useScheduledExercisesForDate hook
    return Promise.resolve([]);
  };

  const fetchExercisesForDateRange = async (startDate: string, endDate: string) => {
    console.log('🗓️ [Store] Fetching exercises for date range:', { startDate, endDate });
    setDateRange({ startDate, endDate });
    const result = await scheduledExercisesQuery.refetch();
    console.log('🗓️ [Store] Refetch result:', result.data?.length, 'exercises');
    return result;
  };

  // CRUD operations
  const addScheduledExercise = async (exercise: any) => {
    console.log('🏪 [Store] addScheduledExercise called with:', exercise);
    try {
      const result = await addExerciseMutation.mutateAsync(exercise);
      console.log('🏪 [Store] addScheduledExercise mutation completed:', result);
      return result;
    } catch (error) {
      console.error('🏪 [Store] addScheduledExercise mutation failed:', error);
      throw error;
    }
  };

  const updateScheduledExercise = async (id: string, exercise: any) => {
    return updateExerciseMutation.mutateAsync({ id, data: exercise });
  };

  const deleteScheduledExercise = async (id: string) => {
    return deleteExerciseMutation.mutateAsync(id);
  };

  const toggleExerciseCompletion = async (id: string) => {
    const exercise = scheduledExercises.find((ex: any) => ex.id === id);
    if (exercise) {
      return updateScheduledExercise(id, { completed: !exercise.completed });
    }
  };

  const markExerciseCompleted = async (id: string) => {
    return updateScheduledExercise(id, { completed: true, completedAt: new Date().toISOString() });
  };

  const markExerciseIncomplete = async (id: string) => {
    return updateScheduledExercise(id, { completed: false, completedAt: undefined });
  };

  // Exercise generation
  const ensureExercisesGeneratedIfNeeded = async () => {
    if (!uiState.hasCheckedGeneration) {
      setUIState(prev => ({ ...prev, hasCheckedGeneration: true }));
      // Check if generation is needed and generate if so
      // This would be implemented based on your business logic
    }
  };

  // Utility functions
  const clearErrors = () => {
    // React Query handles error clearing automatically
  };

  const clearCache = () => {
    scheduledExercisesQuery.refetch();
  };

  const initializeStore = async () => {
    await scheduledExercisesQuery.refetch();
    await ensureExercisesGeneratedIfNeeded();
  };

  const reset = () => {
    setUIState({
      calendarView: 'month',
      selectedDate: null,
      hasCheckedGeneration: false,
    });
    setDateRange({});
  };

  return {
    // Data
    scheduledExercises,
    
    // UI state
    isLoading,
    error: error?.message || null,
    initialized,
    calendarView: uiState.calendarView,
    selectedDate: uiState.selectedDate,
    hasCheckedGeneration: uiState.hasCheckedGeneration,
    
    // Actions
    initializeStore,
    fetchAll,
    fetchExercisesForDate,
    fetchExercisesForDateRange,
    addScheduledExercise,
    updateScheduledExercise,
    deleteScheduledExercise,
    toggleExerciseCompletion,
    markExerciseCompleted,
    markExerciseIncomplete,
    ensureExercisesGeneratedIfNeeded,
    
    // Calendar management
    setCalendarView,
    setSelectedDate,
    
    // Utility functions
    getExercisesForDate,
    getCompletedExercises,
    getPendingExercises,
    getExercisesByCategory,
    getExercisesByDateRange,
    clearErrors,
    clearCache,
    
    // Reset
    reset,
  };
};

// Enhanced hook with generation checking
export const useScheduledExerciseStoreWithGeneration = () => {
  const store = useScheduledExerciseStore();
  
  return {
    ...store,
    rescheduleExercise: scheduledExerciseService.rescheduleExercise,
  };
};

export default useScheduledExerciseStore;
