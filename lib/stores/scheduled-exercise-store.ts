'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { scheduledExerciseService } from '@/lib/services/clients-service/scheduled-exercise-service';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import React from 'react';
import { ScheduledExercise } from '@/lib/types';

// Store-specific types that use 'id' instead of '_id' for frontend compatibility
interface StoreScheduledExercise {
  id: string;
  exerciseId: string;
  categoryId: string;
  workoutPlanId?: string;
  date: string;
  sets: number;
  reps: number;
  weight: number;
  weightPlates?: Record<string, number>;
  notes?: string;
  completed?: boolean;
  completedAt?: string;
  isHidden?: boolean;
}

// Cache structure with date ranges
interface FetchCache {
  dates: {
    [key: string]: {
      timestamp: number;
    }
  };
  dateRanges: {
    [key: string]: {
      timestamp: number;
    }
  };
}

// View types for calendar
type CalendarViewType = 'day' | 'week' | 'month';

// Scheduled exercise store state interface
interface ScheduledExerciseStoreState {
  // Data
  scheduledExercises: StoreScheduledExercise[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Cache
  cache: FetchCache;
  
  // View state
  calendarView: CalendarViewType;
  selectedDate: Date | null;
  
  // Generation tracking
  hasCheckedGeneration: boolean;
  
  // Methods
  setCalendarView: (view: CalendarViewType) => void;
  clearErrors: () => void;
  clearCache: () => void;

  // Data fetching methods
  initializeStore: () => Promise<void>;
  fetchAll: () => Promise<void>;
  fetchExercisesForDate: (date: string) => Promise<void>;
  fetchScheduledExercisesByDate: (date: Date) => Promise<void>;
  fetchExercisesForDateRange: (startDate: string, endDate: string) => Promise<void>;
  getExercisesForDate: (date: Date) => StoreScheduledExercise[];
  
  // CRUD operations
  addScheduledExercise: (exercise: Omit<StoreScheduledExercise, 'id'>) => Promise<StoreScheduledExercise>;
  updateScheduledExercise: (id: string, exercise: Partial<StoreScheduledExercise>) => Promise<StoreScheduledExercise>;  deleteScheduledExercise: (id: string) => Promise<void>;
  deleteScheduledExercisesByDate: (date: Date) => Promise<void>;
  toggleExerciseCompletion: (id: string) => Promise<void>;
  markExerciseCompleted: (id: string) => Promise<void>;
  markExerciseIncomplete: (id: string) => Promise<void>;
  // Drag-and-drop rescheduling methods
  rescheduleExercise: (exerciseId: string, newDate: string, scope?: 'this-week' | 'whole-plan') => Promise<void>;
  
  // Filter and utility methods
  getCompletedExercises: () => StoreScheduledExercise[];
  getPendingExercises: () => StoreScheduledExercise[];
  getExercisesByCategory: (categoryId: string) => StoreScheduledExercise[];
  getExercisesByDateRange: (startDate: string, endDate: string) => StoreScheduledExercise[];
  getScheduledExercisesForWeek: (date: Date | string) => Promise<StoreScheduledExercise[]>;
      
      // Reset the store to initial state
      reset: () => void;
}

// Utility function to convert API response to store type
const apiToStoreScheduledExercise = (scheduledExercise: ScheduledExercise): StoreScheduledExercise => ({
  id: scheduledExercise._id,
  exerciseId: scheduledExercise.exerciseId,
  categoryId: scheduledExercise.categoryId,
  // Ensure workoutPlanId is properly converted to string format to match workout plan store ID format
  workoutPlanId: scheduledExercise.workoutPlanId ? scheduledExercise.workoutPlanId.toString() : undefined,
  date: scheduledExercise.date,
  sets: scheduledExercise.sets || 3,
  reps: scheduledExercise.reps || 10,
  weight: scheduledExercise.weight || 0,
  weightPlates: scheduledExercise.weightPlates || {},
  notes: scheduledExercise.notes || '',
  completed: scheduledExercise.completed || false,
  completedAt: scheduledExercise.completedAt,
  isHidden: scheduledExercise.isHidden || false,
});

// Create the scheduled exercise store with Zustand
export const useScheduledExerciseStore = create<ScheduledExerciseStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      scheduledExercises: [],
      isLoading: false,
      error: null,
      calendarView: 'month',
      initialized: false,
      cache: {
        dates: {},
        dateRanges: {},
      },
      selectedDate: null,
      hasCheckedGeneration: false,

      // UI state setters
      setCalendarView: (view: CalendarViewType) => {
        set({ calendarView: view });
      },
        // Initialize the store with all scheduled exercises
      initializeStore: async () => {
        // Skip initialization if already initialized or loading
        if (get().initialized || get().isLoading) {
          console.debug('[scheduled-exercise-store] Store already initialized or initializing');
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          console.debug('[scheduled-exercise-store] Initializing store...');
          
          // Fetch all scheduled exercises for proper dashboard statistics
          const scheduledExercisesResponse = await scheduledExerciseService.getAll();
          
          set({ 
            scheduledExercises: scheduledExercisesResponse.map(apiToStoreScheduledExercise),
            isLoading: false,
            initialized: true
          });
          
          console.debug('[scheduled-exercise-store] Store initialized successfully', {
            scheduledExercisesCount: scheduledExercisesResponse.length
          });
        } catch (error) {
          console.error('[scheduled-exercise-store] Failed to initialize store:', error);
          set({ 
            error: 'Failed to initialize scheduled exercise data', 
            isLoading: false 
          });
        }
      },

      // Fetch all scheduled exercises
      fetchAll: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const scheduledExercisesResponse = await scheduledExerciseService.getAll();
          
          set({ 
            scheduledExercises: scheduledExercisesResponse.map(apiToStoreScheduledExercise),
            isLoading: false
          });
          
          console.debug('[scheduled-exercise-store] Fetched all scheduled exercises', {
            count: scheduledExercisesResponse.length
          });
        } catch (error) {
          console.error('[scheduled-exercise-store] Failed to fetch all scheduled exercises:', error);
          set({ 
            error: 'Failed to fetch scheduled exercises', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Fetch exercises for a specific date
      fetchExercisesForDate: async (date: string) => {
        // Check cache first (cache valid for 5 minutes)
        const cache = get().cache.dates[date];
        const now = Date.now();
        if (cache && now - cache.timestamp < 5 * 60 * 1000) {
          console.debug(`[scheduled-exercise-store] Using cached exercises for date ${date}`);
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const scheduledExercises = await scheduledExerciseService.getByDate(date);
          
          // Update cache
          set({
            cache: {
              ...get().cache,
              dates: {
                ...get().cache.dates,
                [date]: { timestamp: now }
              }
            }
          });
          
          // Merge with existing exercises (replace exercises for this date)
          const otherExercises = get().scheduledExercises.filter(ex => ex.date !== date);
          const newExercises = scheduledExercises.map(apiToStoreScheduledExercise);
          
          set({ 
            scheduledExercises: [...otherExercises, ...newExercises],
            isLoading: false
          });
          
          console.debug(`[scheduled-exercise-store] Fetched ${scheduledExercises.length} exercises for date ${date}`);
        } catch (error) {
          console.error(`[scheduled-exercise-store] Failed to fetch exercises for date ${date}:`, error);
          set({ 
            error: `Failed to fetch exercises for date ${date}`, 
            isLoading: false 
          });
          throw error;
        }
      },

      // Fetch exercises for a date range
      fetchExercisesForDateRange: async (startDate: string, endDate: string) => {
        const cacheKey = `${startDate}-${endDate}`;
        const cache = get().cache.dateRanges[cacheKey];
        const now = Date.now();
        
        // Check cache first (cache valid for 5 minutes)
        if (cache && now - cache.timestamp < 5 * 60 * 1000) {
          console.debug(`[scheduled-exercise-store] Using cached exercises for range ${startDate} to ${endDate}`);
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const scheduledExercises = await scheduledExerciseService.getByDateRange(startDate, endDate);
          
          // Update cache
          set({
            cache: {
              ...get().cache,
              dateRanges: {
                ...get().cache.dateRanges,
                [cacheKey]: { timestamp: now }
              }
            }
          });
          
          // For date ranges, we replace all exercises in that range
          const existingExercises = get().scheduledExercises.filter(ex => 
            ex.date < startDate || ex.date > endDate
          );
          const newExercises = scheduledExercises.map(apiToStoreScheduledExercise);
          
          set({ 
            scheduledExercises: [...existingExercises, ...newExercises],
            isLoading: false
          });
          
          console.debug(`[scheduled-exercise-store] Fetched ${scheduledExercises.length} exercises for range ${startDate} to ${endDate}`);
        } catch (error) {
          console.error(`[scheduled-exercise-store] Failed to fetch exercises for range ${startDate} to ${endDate}:`, error);
          set({ 
            error: `Failed to fetch exercises for date range`, 
            isLoading: false 
          });
          throw error;
        }      },

      // Add a new scheduled exercise
      addScheduledExercise: async (exercise: Omit<StoreScheduledExercise, 'id'>) => {
        set({ isLoading: true, error: null });
        
        try {
          const newExercise = await scheduledExerciseService.create({
            exerciseId: exercise.exerciseId,
            categoryId: exercise.categoryId,
            workoutPlanId: exercise.workoutPlanId,
            date: exercise.date,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            weightPlates: exercise.weightPlates,
            notes: exercise.notes,
            isHidden: exercise.isHidden,
          });
            const storeExercise = apiToStoreScheduledExercise(newExercise);
          set({ 
            scheduledExercises: [...get().scheduledExercises, storeExercise],
            isLoading: false
          });
          
          // Clear cache to ensure fresh data on next fetch
          get().clearCache();
          
          return storeExercise;
        } catch (error) {
          console.error('[scheduled-exercise-store] Failed to add scheduled exercise:', error);
          set({ 
            error: 'Failed to add scheduled exercise', 
            isLoading: false 
          });
          throw error;
        }
      },

      // Update an existing scheduled exercise
      updateScheduledExercise: async (id: string, exercise: Partial<StoreScheduledExercise>) => {
        set({ isLoading: true, error: null });
        
        try {
          const updatedExercise = await scheduledExerciseService.update(id, {
            exerciseId: exercise.exerciseId,
            categoryId: exercise.categoryId,
            date: exercise.date,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            weightPlates: exercise.weightPlates,
            notes: exercise.notes,
            completed: exercise.completed,
            completedAt: exercise.completedAt,
          });
            const storeExercise = apiToStoreScheduledExercise(updatedExercise);
          set({ 
            scheduledExercises: get().scheduledExercises.map(ex => 
              ex.id === id ? storeExercise : ex
            ),
            isLoading: false
          });
          
          // Clear cache to ensure fresh data on next fetch
          get().clearCache();
          
          return storeExercise;
        } catch (error) {
          console.error(`[scheduled-exercise-store] Failed to update scheduled exercise ${id}:`, error);
          set({ 
            error: 'Failed to update scheduled exercise', 
            isLoading: false 
          });
          throw error;
        }
      },

      // Delete a scheduled exercise
      deleteScheduledExercise: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {          await scheduledExerciseService.delete(id);
          set({ 
            scheduledExercises: get().scheduledExercises.filter(ex => ex.id !== id),
            isLoading: false
          });
          
          // Clear cache to ensure fresh data on next fetch
          get().clearCache();
        } catch (error) {
          console.error(`[scheduled-exercise-store] Failed to delete scheduled exercise ${id}:`, error);
          set({ 
            error: 'Failed to delete scheduled exercise', 
            isLoading: false 
          });
          throw error;
        }
      },

      // Toggle exercise completion
      toggleExerciseCompletion: async (id: string) => {
        const exercise = get().scheduledExercises.find(ex => ex.id === id);
        if (!exercise) {
          console.error(`[scheduled-exercise-store] Cannot find exercise with id ${id}`);
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const updatedExercise = await scheduledExerciseService.update(id, { 
            completed: !exercise.completed 
          });
          
          set({ 
            scheduledExercises: get().scheduledExercises.map(ex => 
              ex.id === id ? apiToStoreScheduledExercise(updatedExercise) : ex
            ),
            isLoading: false
          });
        } catch (error) {
          console.error(`[scheduled-exercise-store] Failed to toggle completion of exercise ${id}:`, error);
          set({ 
            error: 'Failed to toggle exercise completion', 
            isLoading: false 
          });
        }
      },

      // Mark exercise as completed with timestamp
      markExerciseCompleted: async (id: string) => {
        const exercise = get().scheduledExercises.find(ex => ex.id === id);
        if (!exercise) {
          console.error(`[scheduled-exercise-store] Cannot find exercise with id ${id}`);
          return;
        }
        
        if (exercise.completed) {
          console.debug(`[scheduled-exercise-store] Exercise ${id} is already completed`);
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const now = new Date().toISOString();
          const updatedExercise = await scheduledExerciseService.update(id, { 
            completed: true,
            completedAt: now
          });
          
          set({ 
            scheduledExercises: get().scheduledExercises.map(ex => 
              ex.id === id ? apiToStoreScheduledExercise(updatedExercise) : ex
            ),
            isLoading: false
          });
          
          console.debug(`[scheduled-exercise-store] Exercise ${id} marked as completed at ${now}`);
        } catch (error) {
          console.error(`[scheduled-exercise-store] Failed to mark exercise ${id} as completed:`, error);
          set({ 
            error: 'Failed to mark exercise as completed', 
            isLoading: false 
          });
          throw error;
        }
      },

      // Mark exercise as incomplete and clear completion timestamp
      markExerciseIncomplete: async (id: string) => {
        const exercise = get().scheduledExercises.find(ex => ex.id === id);
        if (!exercise) {
          console.error(`[scheduled-exercise-store] Cannot find exercise with id ${id}`);
          return;
        }
        
        if (!exercise.completed) {
          console.debug(`[scheduled-exercise-store] Exercise ${id} is already incomplete`);
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const updatedExercise = await scheduledExerciseService.update(id, { 
            completed: false,
            completedAt: undefined
          });
          
          set({ 
            scheduledExercises: get().scheduledExercises.map(ex => 
              ex.id === id ? apiToStoreScheduledExercise(updatedExercise) : ex
            ),
            isLoading: false
          });
          
          console.debug(`[scheduled-exercise-store] Exercise ${id} marked as incomplete`);
        } catch (error) {
          console.error(`[scheduled-exercise-store] Failed to mark exercise ${id} as incomplete:`, error);
          set({ 
            error: 'Failed to mark exercise as incomplete', 
            isLoading: false 
          });
          throw error;
        }
      },

      // Clear errors
      clearErrors: () => {
        set({ error: null });
      },
      
      // Clear cache - useful for forcing fresh data after operations
      clearCache: () => {
        set({ 
          cache: {
            dates: {},
            dateRanges: {}
          }
        });
        console.debug('[scheduled-exercise-store] Cache cleared');
      },
      
      // Get exercises for a specific date
      getExercisesForDate: (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return get().scheduledExercises.filter(ex => ex.date === dateStr);
      },
      
      // Fetch scheduled exercises by date (alias for fetchExercisesForDate with date conversion)
      fetchScheduledExercisesByDate: async (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return get().fetchExercisesForDate(dateStr);
      },
      
      // Delete all scheduled exercises for a specific date
      deleteScheduledExercisesByDate: async (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        set({ isLoading: true, error: null });
        
        try {
          const exercisesToDelete = get().scheduledExercises.filter(ex => ex.date === dateStr);
          
          // Delete all exercises for this date one by one
          await Promise.all(exercisesToDelete.map(ex => 
            scheduledExerciseService.delete(ex.id)
          ));
          
          // Update the store
          set({ 
            scheduledExercises: get().scheduledExercises.filter(ex => ex.date !== dateStr),
            isLoading: false
          });
        } catch (error) {
          console.error(`[scheduled-exercise-store] Failed to delete exercises for date ${dateStr}:`, error);
          set({ 
            error: `Failed to delete exercises for date ${dateStr}`, 
            isLoading: false 
          });
          throw error;
        }
      },

      // Get completed exercises
      getCompletedExercises: () => {
        return get().scheduledExercises.filter(ex => ex.completed === true);
      },

      // Get pending exercises
      getPendingExercises: () => {
        return get().scheduledExercises.filter(ex => ex.completed !== true);
      },

      // Get exercises by category
      getExercisesByCategory: (categoryId: string) => {
        return get().scheduledExercises.filter(ex => ex.categoryId === categoryId);
      },      // Get exercises by date range
      getExercisesByDateRange: (startDate: string, endDate: string) => {
        return get().scheduledExercises.filter(ex => 
          ex.date >= startDate && ex.date <= endDate
        );
      },

      // Get scheduled exercises for a week
      getScheduledExercisesForWeek: async (date: Date | string) => {
        const targetDate = typeof date === 'string' ? new Date(date) : date;
        const weekStart = format(startOfWeek(targetDate), 'yyyy-MM-dd');
        const weekEnd = format(endOfWeek(targetDate), 'yyyy-MM-dd');
        
        // Check if we need to fetch data
        await get().fetchExercisesForDateRange(weekStart, weekEnd);
        
        // Return filtered exercises for the week
        return get().scheduledExercises.filter(ex => 
          ex.date >= weekStart && ex.date <= weekEnd
        );
      },
      
      // Reschedule exercise using drag-and-drop
      rescheduleExercise: async (exerciseId: string, newDate: string, scope: 'this-week' | 'whole-plan' = 'this-week') => {
        const exercise = get().scheduledExercises.find(ex => ex.id === exerciseId);
        if (!exercise) {
          console.error(`[scheduled-exercise-store] Cannot find exercise with id ${exerciseId}`);
          throw new Error('Exercise not found');
        }

        set({ isLoading: true, error: null });

        try {
          // Delegate business logic to the service layer
          await scheduledExerciseService.rescheduleExercise(exerciseId, newDate, scope, {
            workoutPlanStore: scope === 'whole-plan' ? await import('@/lib/stores/workout-plan-store').then(m => m.useWorkoutPlanStore.getState()) : undefined,
            onTemplateUpdate: scope === 'whole-plan' ? async () => {
              // Refresh the active plan after template update
              const { useWorkoutPlanStore } = await import('@/lib/stores/workout-plan-store');
              const workoutPlanStore = useWorkoutPlanStore.getState();
              await workoutPlanStore.loadActivePlan();
            } : undefined,
            onCacheCleared: () => {
              get().clearCache();
            }
          });

          // For this-week scope, update the local state
          if (scope === 'this-week') {
            const updatedExercise = await scheduledExerciseService.getById(exerciseId);
            set({
              scheduledExercises: get().scheduledExercises.map(ex =>
                ex.id === exerciseId ? apiToStoreScheduledExercise(updatedExercise) : ex
              )
            });
          } else {
            // For whole-plan scope, refresh all scheduled exercises to get the updated state
            await get().fetchAll();
          }
          
          set({ isLoading: false });
          
          console.debug(`[scheduled-exercise-store] Exercise ${exerciseId} rescheduled to ${newDate} with scope ${scope}`);
        } catch (error: any) {
          console.error(`[scheduled-exercise-store] Failed to reschedule exercise ${exerciseId}:`, error);
          
          let errorMessage = 'Failed to reschedule exercise';
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({
            error: errorMessage,
            isLoading: false
          });
          
          throw error;
        }
      },

      // Reset the store to initial state
      reset: () => {
        set({
          scheduledExercises: [],
          isLoading: false,
          error: null,
          initialized: false,
          calendarView: 'month',
          selectedDate: null,
          cache: {
            dates: {},
            dateRanges: {}
          },
          hasCheckedGeneration: false,
        });
      }
    }),
    {
      name: 'scheduled-exercise-store',
      partialize: (state) => {
        // Get current user ID to add to storage key
        const userId = typeof window !== 'undefined' && window.localStorage 
          ? window.localStorage.getItem('current-user-id') 
          : null;
          
        return {
          calendarView: state.calendarView,
          hasCheckedGeneration: state.hasCheckedGeneration,
          // Add storage version for future migrations
          _storageVersion: '1.0.0',
          // Add userId for verification
          _userId: userId,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Verify user ID matches to prevent data leakage
          const currentUserId = typeof window !== 'undefined' && window.localStorage 
            ? window.localStorage.getItem('current-user-id') 
            : null;
          
          // If user IDs don't match, will trigger store reset
          if (currentUserId && (state as any)._userId && currentUserId !== (state as any)._userId) {
            console.log('[scheduled-exercise-store] User ID mismatch, triggering reset');
            setTimeout(() => {
              if (window.localStorage) {
                // Trigger storage event to reset stores in StoreResetHandler
                window.localStorage.setItem('store-user-changed', Date.now().toString());
              }
            }, 0);
          }
        }
      },
    }
  )
);

// Add generation checking functionality
export const useScheduledExerciseStoreWithGeneration = () => {
  const store = useScheduledExerciseStore();
  
  // Add generation checking method
  const ensureExercisesGeneratedIfNeeded = React.useCallback(async () => {
    // Only check once per session
    if (store.hasCheckedGeneration) return;
    
    try {
      // Mark as checked to prevent multiple checks
      useScheduledExerciseStore.setState({ hasCheckedGeneration: true });
      
      // Lightweight API call to check if user needs more exercises
      const response = await fetch('/api/scheduled-exercises/needs-generation');
      if (!response.ok) return;
      
      const { needsGeneration, planId } = await response.json();
      
      // If needed, trigger generation in the background
      if (needsGeneration && planId) {
        // Fire and forget - don't wait for response
        fetch('/api/workout-plans/ensure-exercises-generated', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workoutPlanId: planId,
            minDaysInAdvance: 14,
          })
        }).catch(err => console.error('Background generation failed:', err));
      }
    } catch (error) {
      console.error('Error checking exercise generation:', error);
    }
  }, [store.hasCheckedGeneration]);
  
  return {
    ...store,
    ensureExercisesGeneratedIfNeeded,
  };
};
// Utility functions 
export const kgToLbs = (kg: number): number => {
  return kg * 2.20462;
};

export const lbsToKg = (lbs: number): number => {
  return lbs * 0.453592;
};
