import { useCallback, useMemo } from 'react';
import { 
  useScheduledExercises, 
  useScheduledExercisesForDate, 
  useAddScheduledExercise, 
  useUpdateScheduledExercise, 
  useDeleteScheduledExercise, 
  useRescheduleExercise,
  useGenerateExercises,
  useCheckExerciseGeneration
} from '@/lib/utils/queries/scheduled-exercises-queries';
import { scheduledExerciseUtils } from '@/lib/utils/scheduled-exercise-utils';
import { format } from 'date-fns';

// Enhanced selector interface for better TypeScript support
interface ExerciseSelectors {
  // Date-based selectors
  byDate: (date: Date | string) => any[];
  byDateRange: (startDate: string, endDate: string) => any[];
  today: any[];
  thisWeek: any[];
  thisMonth: any[];
  
  // Status-based selectors
  completed: any[];
  pending: any[];
  byCategory: (categoryId: string) => any[];
  
  // Utility selectors
  findById: (id: string) => any | undefined;
  sortedByDate: (ascending?: boolean) => any[];
  
  // Advanced selectors
  completedToday: any[];
  pendingToday: any[];
  completedThisWeek: any[];
  pendingThisWeek: any[];
  
  // Stats with breakdown
  stats: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
    // Extended stats
    todayStats: {
      total: number;
      completed: number;
      pending: number;
      completionRate: number;
    };
    weekStats: {
      total: number;
      completed: number;
      pending: number;
      completionRate: number;
    };
    categoryBreakdown: Record<string, {
      total: number;
      completed: number;
      completionRate: number;
    }>;
  };
}

/**
 * Core hook for scheduled exercise data with comprehensive selector patterns
 * Eliminates manual memoization in components through optimized, cached selectors
 * 
 * @param dateRange - Optional date range to filter exercises
 * @returns Complete data interface with exercises, selectors, and actions
 */
export function useScheduledExerciseData(dateRange?: { startDate?: string; endDate?: string }) {
  // Direct React Query usage - no store wrapper needed
  const { 
    data: exercises = [], 
    isLoading, 
    error, 
    refetch 
  } = useScheduledExercises(dateRange?.startDate, dateRange?.endDate);

  // Mutations
  const addMutation = useAddScheduledExercise();
  const updateMutation = useUpdateScheduledExercise();
  const deleteMutation = useDeleteScheduledExercise();

  // Enhanced selectors with comprehensive memoization
  // const selectors: ExerciseSelectors = useMemo(() => {
  //   // Get current date strings
  //   const today = format(new Date(), 'yyyy-MM-dd');
  //   const todayExercises = scheduledExerciseUtils.getExercisesForDate(exercises, today);
  //   const thisWeekExercises = scheduledExerciseUtils.getThisWeekExercises(exercises);
  //   const thisMonthExercises = scheduledExerciseUtils.getThisMonthExercises(exercises);
    
  //   // Status-based data
  //   const completed = scheduledExerciseUtils.getCompletedExercises(exercises);
  //   const pending = scheduledExerciseUtils.getPendingExercises(exercises);
    
  //   // Today-specific status
  //   const completedToday = scheduledExerciseUtils.getCompletedExercises(todayExercises);
  //   const pendingToday = scheduledExerciseUtils.getPendingExercises(todayExercises);
    
  //   // Week-specific status  
  //   const completedThisWeek = scheduledExerciseUtils.getCompletedExercises(thisWeekExercises);
  //   const pendingThisWeek = scheduledExerciseUtils.getPendingExercises(thisWeekExercises);
    
  //   // Category breakdown
  //   const categoryBreakdown = exercises.reduce((acc, exercise) => {
  //     const categoryId = exercise.categoryId || 'uncategorized';
  //     if (!acc[categoryId]) {
  //       acc[categoryId] = { total: 0, completed: 0, completionRate: 0 };
  //     }
  //     acc[categoryId].total++;
  //     if (exercise.completed) {
  //       acc[categoryId].completed++;
  //     }
  //     acc[categoryId].completionRate = acc[categoryId].total > 0 
  //       ? (acc[categoryId].completed / acc[categoryId].total) * 100 
  //       : 0;
  //     return acc;
  //   }, {} as Record<string, { total: number; completed: number; completionRate: number; }>);

  //   return {
  //     // Date-based selectors (functions for dynamic date queries)
  //     byDate: (date: Date | string) => scheduledExerciseUtils.getExercisesForDate(exercises, date),
  //     byDateRange: (startDate: string, endDate: string) => 
  //       scheduledExerciseUtils.getExercisesByDateRange(exercises, startDate, endDate),
      
  //     // Pre-computed date selectors (cached for performance)
  //     today: todayExercises,
  //     thisWeek: thisWeekExercises,
  //     thisMonth: thisMonthExercises,
      
  //     // Status-based selectors
  //     completed,
  //     pending,
  //     byCategory: (categoryId: string) => 
  //       scheduledExerciseUtils.getExercisesByCategory(exercises, categoryId),
      
  //     // Utility selectors
  //     findById: (id: string) => scheduledExerciseUtils.findExerciseById(exercises, id),
  //     sortedByDate: (ascending = false) => 
  //       scheduledExerciseUtils.sortExercisesByDate(exercises, ascending),
      
  //     // Advanced combined selectors
  //     completedToday,
  //     pendingToday,
  //     completedThisWeek,
  //     pendingThisWeek,
      
  //     // Comprehensive stats
  //     stats: {
  //       // Overall stats
  //       total: exercises.length,
  //       completed: completed.length,
  //       pending: pending.length,
  //       completionRate: exercises.length > 0 ? (completed.length / exercises.length) * 100 : 0,
        
  //       // Today stats
  //       todayStats: {
  //         total: todayExercises.length,
  //         completed: completedToday.length,
  //         pending: pendingToday.length,
  //         completionRate: todayExercises.length > 0 
  //           ? (completedToday.length / todayExercises.length) * 100 
  //           : 0,
  //       },
        
  //       // Week stats
  //       weekStats: {
  //         total: thisWeekExercises.length,
  //         completed: completedThisWeek.length,
  //         pending: pendingThisWeek.length,
  //         completionRate: thisWeekExercises.length > 0 
  //           ? (completedThisWeek.length / thisWeekExercises.length) * 100 
  //           : 0,
  //       },
        
  //       // Category breakdown
  //       categoryBreakdown,
  //     },
  //   };
  // }, [exercises]);
   const selectors = {
    byDate: useCallback((date: Date) => {
      return exercises.filter(ex => ex.date === format(date, 'yyyy-MM-dd'))
    }, [exercises]) // This makes it reactive to exercises changes
  }

  // Legacy computed values for backward compatibility
  // const stats = selectors.stats;
  const exercisesByDate = useMemo(() => 
    scheduledExerciseUtils.groupExercisesByDate(exercises), 
    [exercises]
  );

  return {
    // Core data
    exercises,
    isLoading,
    error: error?.message || null,
    
    // Enhanced selectors (main feature)
    selectors,
    
    // Legacy API (backward compatibility)
    // stats,
    exercisesByDate,
    
    // Actions
    refetch,
    addExercise: addMutation.mutateAsync,
    updateExercise: (id: string, data: any) => updateMutation.mutateAsync({ id, data }),
    deleteExercise: deleteMutation.mutateAsync,
    
    // Utility functions (legacy - use selectors instead)
    getExercisesForDate: (date: Date | string) => 
      scheduledExerciseUtils.getExercisesForDate(exercises, date),
    getCompletedExercises: () => 
      scheduledExerciseUtils.getCompletedExercises(exercises),
    getPendingExercises: () => 
      scheduledExerciseUtils.getPendingExercises(exercises),
    findExerciseById: (id: string) =>
      scheduledExerciseUtils.findExerciseById(exercises, id),

    // Common async actions
    toggleExerciseCompletion: async (id: string) => {
      const exercise = scheduledExerciseUtils.findExerciseById(exercises, id);
      if (exercise) {
        return updateMutation.mutateAsync({ 
          id, 
          data: { completed: !exercise.completed } 
        });
      }
    },
    
    markExerciseCompleted: async (id: string) => {
      return updateMutation.mutateAsync({ 
        id, 
        data: { completed: true, completedAt: new Date().toISOString() }
      });
    },
    
    markExerciseIncomplete: async (id: string) => {
      return updateMutation.mutateAsync({ 
        id, 
        data: { completed: false, completedAt: undefined }
      });
    },
  };
}

/**
 * Hook for exercise mutations only
 * Useful when you only need to modify exercises without fetching data
 * 
 * @returns Mutation functions and their loading states
 */
export function useScheduledExerciseMutations() {
  const addMutation = useAddScheduledExercise();
  const updateMutation = useUpdateScheduledExercise();
  const deleteMutation = useDeleteScheduledExercise();

  return {
    // Core mutations
    addExercise: addMutation.mutateAsync,
    updateExercise: (id: string, data: any) => updateMutation.mutateAsync({ id, data }),
    deleteExercise: deleteMutation.mutateAsync,
    
    // Mutation states
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Common patterns
    markCompleted: (id: string) => updateMutation.mutateAsync({ 
      id, 
      data: { completed: true, completedAt: new Date().toISOString() }
    }),
    
    markIncomplete: (id: string) => updateMutation.mutateAsync({ 
      id, 
      data: { completed: false, completedAt: undefined }
    }),
  };
}
