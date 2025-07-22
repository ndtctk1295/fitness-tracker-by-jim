'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';
import { workoutPlanService, WorkoutPlan, DayTemplate, ExerciseTemplate, ConflictDetectionResult, PlanActivationResult } from '@/lib/services/clients-service/workout-plan-service';

// Store-specific types that use 'id' instead of '_id' for frontend compatibility
interface StoreWorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  isActive: boolean;
  mode: 'ongoing' | 'dated';
  startDate?: string; // ISO string for frontend
  endDate?: string; // ISO string for frontend
  weeklyTemplate: DayTemplate[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string; // ISO string for frontend
  updatedAt?: string; // ISO string for frontend
}

// Cache structure for optimized data fetching
interface FetchCache {
  allPlans: {
    timestamp: number;
  };
  activePlan: {
    timestamp: number;
  };
  individual: {
    [key: string]: {
      timestamp: number;
    }
  };
}

// Workout plan store state interface
interface WorkoutPlanStoreState {
  // Data
  workoutPlans: StoreWorkoutPlan[];
  activePlan: StoreWorkoutPlan | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Initialization state
  initialized: boolean;
  
  // Cache management
  cache: FetchCache;
  cacheTimeout: number; // 5 minutes default
  
  // Modal and UI state
  selectedPlanId: string | null;
  showCreateDialog: boolean;
  showEditDialog: boolean;
  showDeleteDialog: boolean;
  showConflictDialog: boolean;
  conflictData: ConflictDetectionResult | null;
    // Actions - Data operations
  initializeStore: () => Promise<void>;
  loadAllPlans: () => Promise<void>;
  loadActivePlan: () => Promise<void>;
  loadPlanById: (id: string) => Promise<StoreWorkoutPlan | null>;
  createPlan: (planData: Omit<WorkoutPlan, '_id' | 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<StoreWorkoutPlan | null>;
  updatePlan: (id: string, updateData: Partial<WorkoutPlan>) => Promise<StoreWorkoutPlan | null>;
  deletePlan: (id: string) => Promise<boolean>;
  duplicatePlan: (id: string, newName?: string) => Promise<StoreWorkoutPlan | null>;
  
  // Actions - Plan management
  activatePlan: (id: string) => Promise<PlanActivationResult>;
  deactivatePlan: (id: string) => Promise<StoreWorkoutPlan | null>;
  checkConflicts: (startDate: Date, endDate: Date, excludeId?: string) => Promise<ConflictDetectionResult>;
  resolveConflicts: (newPlanId: string, conflictingPlanIds: string[]) => Promise<boolean>;
  
  // Actions - Filtering and searching
  getPlansByMode: (mode: 'ongoing' | 'dated') => StoreWorkoutPlan[];
  getPlansByLevel: (level: 'beginner' | 'intermediate' | 'advanced') => StoreWorkoutPlan[];
  searchPlans: (query: string) => StoreWorkoutPlan[];
  
  // Actions - Exercise generation
  generateScheduledExercises: (startDate: Date, endDate: Date) => Promise<{ success: boolean; count: number; message?: string }>;
  getExercisesForDate: (date: string) => Promise<ExerciseTemplate[]>;
  
  // Actions - UI state management
  setSelectedPlan: (id: string | null) => void;
  setShowCreateDialog: (show: boolean) => void;
  setShowEditDialog: (show: boolean) => void;
  setShowDeleteDialog: (show: boolean) => void;
  setShowConflictDialog: (show: boolean) => void;
  setConflictData: (data: ConflictDetectionResult | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Actions - Cache management
  invalidateCache: () => void;
  invalidatePlanCache: (id: string) => void;
  isCacheValid: (cacheKey: keyof FetchCache | string) => boolean;
  
  // Actions - Reset
  reset: () => void;
}

// Helper function to convert API response to store format
const convertToStoreFormat = (plan: WorkoutPlan): StoreWorkoutPlan => ({
  ...plan,
  id: plan._id || plan.id || '',
  startDate: formatDateToISOString(plan.startDate),
  endDate: formatDateToISOString(plan.endDate),
  createdAt: formatDateToISOString(plan.createdAt),
  updatedAt: formatDateToISOString(plan.updatedAt),
});

// Helper function to safely format dates to ISO string
const formatDateToISOString = (date: Date | string | undefined | null): string | undefined => {
  if (!date) return undefined;
  
  // If it's already a string, check if it's a valid ISO string
  if (typeof date === 'string') {
    // If it looks like an ISO string already, return it as is
    if (date.includes('T') && date.includes('Z') || date.includes('+')) {
      return date;
    }
    // Otherwise try to parse it as a date
    try {
      return new Date(date).toISOString();
    } catch (e) {
      console.warn('Invalid date string:', date);
      return undefined;
    }
  }
  
  // If it's a Date object
  if (date instanceof Date) {
    return date.toISOString();
  }
  
  return undefined;
};

// Helper function to convert store format to API format
const convertToApiFormat = (plan: Partial<StoreWorkoutPlan>): Partial<WorkoutPlan> => {
  const { startDate, endDate, createdAt, updatedAt, ...restPlan } = plan;
  const apiPlan: Partial<WorkoutPlan> = { ...restPlan };
  
  if (startDate) {
    try {
      apiPlan.startDate = new Date(startDate);
    } catch (e) {
      console.warn('Invalid startDate:', startDate);
    }
  }
  
  if (endDate) {
    try {
      apiPlan.endDate = new Date(endDate);
    } catch (e) {
      console.warn('Invalid endDate:', endDate);
    }
  }
  
  if (createdAt) {
    try {
      apiPlan.createdAt = new Date(createdAt);
    } catch (e) {
      console.warn('Invalid createdAt:', createdAt);
    }
  }
  
  if (updatedAt) {
    try {
      apiPlan.updatedAt = new Date(updatedAt);
    } catch (e) {
      console.warn('Invalid updatedAt:', updatedAt);
    }
  }
  
  return apiPlan;
};

export const useWorkoutPlanStore = create<WorkoutPlanStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      workoutPlans: [],
      activePlan: null,
      isLoading: false,
      error: null,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      initialized: false,
      cache: {
        allPlans: { timestamp: 0 },
        activePlan: { timestamp: 0 },
        individual: {}
      },
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      selectedPlanId: null,
      showCreateDialog: false,
      showEditDialog: false,
      showDeleteDialog: false,
      showConflictDialog: false,
      conflictData: null,

      // Data operations
      initializeStore: async () => {
        const state = get();
        
        // Skip initialization if already initialized and has data
        if (state.initialized && !state.error && state.workoutPlans.length > 0) {
          console.debug('[workout-plan-store] Store already initialized, skipping fetch');
          return;
        }
        
        console.debug('[workout-plan-store] Initializing workout plan store...');
        set({ isLoading: true, error: null });
        
        try {
          // Fetch plans and active plan in parallel
          await Promise.all([
            get().loadAllPlans(),
            get().loadActivePlan()
          ]);
          
          set({ initialized: true });
          console.debug('[workout-plan-store] Store initialization complete');
        } catch (error: any) {
          console.error('[workout-plan-store] Failed to initialize store:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to initialize workout plans',
            isLoading: false 
          });
        } finally {
          set({ isLoading: false });
        }
      },

      loadAllPlans: async () => {
        const state = get();
        
        // Check cache validity
        if (state.isCacheValid('allPlans')) {
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const plans = await workoutPlanService.getAll();
          const storePlans = plans.map(convertToStoreFormat);
          
          // Update the state with new plans and timestamp
          set({ 
            workoutPlans: storePlans,
            isLoading: false,
            cache: {
              ...state.cache,
              allPlans: { timestamp: Date.now() }
            }
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load workout plans',
            isLoading: false 
          });
        }
      },

      loadActivePlan: async () => {
        const state = get();
        
        // Check cache validity
        if (state.isCacheValid('activePlan')) {
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const plan = await workoutPlanService.getActive();
          const storePlan = plan ? convertToStoreFormat(plan) : null;
          
          set({ 
            activePlan: storePlan,
            isLoading: false,
            cache: {
              ...state.cache,
              activePlan: { timestamp: Date.now() }
            }
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load active workout plan',
            isLoading: false 
          });
        }
      },

      loadPlanById: async (id: string) => {
        const state = get();
        
        // Check cache validity for individual plan
        if (state.isCacheValid(id)) {
          const existingPlan = state.workoutPlans.find(p => p.id === id);
          if (existingPlan) {
            return existingPlan;
          }
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const plan = await workoutPlanService.getById(id);
          const storePlan = convertToStoreFormat(plan);
          
          // Update the plan in the list if it exists, otherwise add it
          const updatedPlans = state.workoutPlans.filter(p => p.id !== id);
          updatedPlans.push(storePlan);
          
          set({ 
            workoutPlans: updatedPlans,
            isLoading: false,
            cache: {
              ...state.cache,
              individual: {
                ...state.cache.individual,
                [id]: { timestamp: Date.now() }
              }
            }
          });
          
          return storePlan;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load workout plan',
            isLoading: false 
          });
          return null;
        }
      },

      createPlan: async (planData) => {
        set({ isCreating: true, error: null });
        
        try {
          const newPlan = await workoutPlanService.create(planData);
          const storePlan = convertToStoreFormat(newPlan);
          const state = get();
          
          set({ 
            workoutPlans: [...state.workoutPlans, storePlan],
            isCreating: false,
            showCreateDialog: false
          });
          
          // Invalidate cache
          get().invalidateCache();
          
          return storePlan;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create workout plan',
            isCreating: false 
          });
          return null;
        }
      },      updatePlan: async (id, updateData) => {
        set({ isUpdating: true, error: null });
        
        try {
          // Ensure date fields are properly formatted
          const sanitizedData = { ...updateData };
          if (sanitizedData.startDate && !(sanitizedData.startDate instanceof Date)) {
            try {
              sanitizedData.startDate = new Date(sanitizedData.startDate);
            } catch (e) {
              console.warn('Invalid startDate in updatePlan:', sanitizedData.startDate);
            }
          }
          if (sanitizedData.endDate && !(sanitizedData.endDate instanceof Date)) {
            try {
              sanitizedData.endDate = new Date(sanitizedData.endDate);
            } catch (e) {
              console.warn('Invalid endDate in updatePlan:', sanitizedData.endDate);
            }
          }
          
          const updatedPlan = await workoutPlanService.update(id, sanitizedData);
          const storePlan = convertToStoreFormat(updatedPlan);
          const state = get();
          
          const updatedPlans = state.workoutPlans.map(p => 
            p.id === id ? storePlan : p
          );
          
          // Update active plan if this was the active one
          const updatedActivePlan = state.activePlan?.id === id ? storePlan : state.activePlan;
          
          set({ 
            workoutPlans: updatedPlans,
            activePlan: updatedActivePlan,
            isUpdating: false,
            showEditDialog: false
          });
          
          // Invalidate cache
          get().invalidatePlanCache(id);
          
          return storePlan;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update workout plan',
            isUpdating: false 
          });
          return null;
        }
      },

      deletePlan: async (id) => {
        set({ isDeleting: true, error: null });
        
        try {
          await workoutPlanService.delete(id);
          const state = get();
          
          const updatedPlans = state.workoutPlans.filter(p => p.id !== id);
          const updatedActivePlan = state.activePlan?.id === id ? null : state.activePlan;
          
          set({ 
            workoutPlans: updatedPlans,
            activePlan: updatedActivePlan,
            isDeleting: false,
            showDeleteDialog: false,
            selectedPlanId: null
          });
          
          // Invalidate cache
          get().invalidateCache();
          
          return true;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete workout plan',
            isDeleting: false 
          });
          return false;
        }
      },

      duplicatePlan: async (id, newName) => {
        set({ isLoading: true, error: null });
        
        try {
          const duplicatedPlan = await workoutPlanService.duplicate(id, newName);
          const storePlan = convertToStoreFormat(duplicatedPlan);
          const state = get();
          
          set({ 
            workoutPlans: [...state.workoutPlans, storePlan],
            isLoading: false
          });
          
          // Invalidate cache
          get().invalidateCache();
          
          return storePlan;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to duplicate workout plan',
            isLoading: false 
          });
          return null;
        }
      },      
      activatePlan: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await workoutPlanService.activate(id);
          
          // Fix: API returns { success, data, message } but we were expecting { success, plan, message }
          if (result.success && result.data) {
            const storePlan = convertToStoreFormat(result.data);
            const state = get();
            
            // Deactivate all other plans and activate the selected one
            const updatedPlans = state.workoutPlans.map(p => ({
              ...p,
              isActive: p.id === id
            }));
            
            set({ 
              workoutPlans: updatedPlans,
              activePlan: storePlan,
              isLoading: false
            });
            
            // Invalidate cache
            get().invalidateCache();

            // Automatically generate scheduled exercises for the next 7 days
            try {
              const startDate = new Date();
              const endDate = new Date();
              endDate.setDate(startDate.getDate() + 7);
                const generateResult = await get().generateScheduledExercises(startDate, endDate);
              console.log('[workout-plan-store] Exercise generation result:', generateResult);
              
              // Refresh scheduled exercise store to show new exercises
              if (typeof window !== 'undefined') {
                try {
                  const { useScheduledExerciseStore } = await import('@/lib/stores/scheduled-exercise-store');
                  const scheduledStore = useScheduledExerciseStore.getState();
                  
                  // Clear cache and re-fetch exercises for the date range
                  scheduledStore.clearCache();
                  await scheduledStore.fetchExercisesForDateRange(
                    startDate.toISOString().split('T')[0],
                    endDate.toISOString().split('T')[0]
                  );
                  
                  console.log('[workout-plan-store] Scheduled exercise store refreshed after activation');
                } catch (refreshError) {
                  console.warn('Failed to refresh scheduled exercise store:', refreshError);
                }
              }
            } catch (exerciseError) {
              console.warn('Failed to auto-generate exercises after activation:', exerciseError);
              // Don't fail the activation if exercise generation fails
            }
          }
          
          return result;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to activate workout plan',
            isLoading: false 
          });
          return { success: false, message: 'Failed to activate workout plan' };
        }
      },

      deactivatePlan: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          const deactivatedPlan = await workoutPlanService.deactivate(id);
          const storePlan = convertToStoreFormat(deactivatedPlan);
          const state = get();
          
          const updatedPlans = state.workoutPlans.map(p => 
            p.id === id ? storePlan : p
          );
          
          const updatedActivePlan = state.activePlan?.id === id ? null : state.activePlan;
          
          set({ 
            workoutPlans: updatedPlans,
            activePlan: updatedActivePlan,
            isLoading: false
          });
          
          // Invalidate cache
          get().invalidateCache();
          
          return storePlan;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to deactivate workout plan',
            isLoading: false 
          });
          return null;
        }
      },      checkConflicts: async (startDate, endDate, workoutPlanId) => {
        try {
          const result = await workoutPlanService.checkConflicts(startDate, endDate, workoutPlanId || '');
          set({ conflictData: result });
          return result;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to check conflicts' });
          return { hasConflicts: false, conflictingPlans: [] };
        }
      },

      resolveConflicts: async (newPlanId, conflictingPlanIds) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await workoutPlanService.resolveConflicts(newPlanId, conflictingPlanIds);
          
          if (result.success) {
            // Reload plans to reflect changes
            await get().loadAllPlans();
            await get().loadActivePlan();
            
            set({ 
              showConflictDialog: false,
              conflictData: null,
              isLoading: false
            });
          }
          
          return result.success;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to resolve conflicts',
            isLoading: false 
          });
          return false;
        }
      },

      generateScheduledExercises: async (startDate, endDate) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await workoutPlanService.generateScheduledExercises(startDate, endDate);
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to generate scheduled exercises',
            isLoading: false 
          });
          return { success: false, count: 0, message: 'Failed to generate exercises' };
        }
      },

      getExercisesForDate: async (date) => {
        try {
          return await workoutPlanService.getExercisesForDate(date);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to get exercises for date' });
          return [];
        }
      },

      // Filtering and searching
      getPlansByMode: (mode) => {
        return get().workoutPlans.filter(plan => plan.mode === mode);
      },

      getPlansByLevel: (level) => {
        return get().workoutPlans.filter(plan => plan.level === level);
      },

      searchPlans: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().workoutPlans.filter(plan => 
          plan.name.toLowerCase().includes(lowerQuery) ||
          plan.description?.toLowerCase().includes(lowerQuery)
        );
      },

      // UI state management
      setSelectedPlan: (id) => set({ selectedPlanId: id }),
      setShowCreateDialog: (show) => set({ showCreateDialog: show }),
      setShowEditDialog: (show) => set({ showEditDialog: show }),
      setShowDeleteDialog: (show) => set({ showDeleteDialog: show }),
      setShowConflictDialog: (show) => set({ showConflictDialog: show }),
      setConflictData: (data) => set({ conflictData: data }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Cache management
      invalidateCache: () => {
        set({
          cache: {
            allPlans: { timestamp: 0 },
            activePlan: { timestamp: 0 },
            individual: {}
          }
        });
      },

      invalidatePlanCache: (id) => {
        const state = get();
        const { [id]: _, ...restIndividual } = state.cache.individual;
        set({
          cache: {
            ...state.cache,
            individual: restIndividual
          }        });
      },
      
      isCacheValid: (cacheKey) => {
        const state = get();
        const now = Date.now();
        const cacheTimeout = state.cacheTimeout; // Use the state's cacheTimeout value
        
        if (cacheKey === 'allPlans' || cacheKey === 'activePlan') {
          const cache = state.cache[cacheKey as keyof FetchCache];
          const timestamp = Number(cache?.timestamp || 0);
          return (now - timestamp) < cacheTimeout;
        } else {
          const cache = state.cache.individual[cacheKey];
          const timestamp = Number(cache?.timestamp || 0);
          return cache ? (now - timestamp) < cacheTimeout : false;
        }
      },

      // Reset
      reset: () => {
        set({
          workoutPlans: [],
          activePlan: null,
          isLoading: false,
          error: null,
          isCreating: false,
          isUpdating: false,
          isDeleting: false,
          cache: {
            allPlans: { timestamp: 0 },
            activePlan: { timestamp: 0 },
            individual: {}
          },
          selectedPlanId: null,
          showCreateDialog: false,
          showEditDialog: false,
          showDeleteDialog: false,
          showConflictDialog: false,
          conflictData: null,
        });
      }
    }),    {
      name: 'workout-plan-store',
      partialize: (state) => {
        // Get current user ID to add to storage key
        const userId = typeof window !== 'undefined' && window.localStorage 
          ? window.localStorage.getItem('current-user-id') 
          : null;
        
        // Add userId to localStorage for verification on next load
        if (userId) {
          window.localStorage.setItem('workout-plan-user-id', userId);
        }
        
        return {
          // Only persist essential data, not UI state
          workoutPlans: state.workoutPlans,
          activePlan: state.activePlan,
          initialized: state.initialized,
          // Add storage version for future migrations
          _storageVersion: '1.0.0',
          // Add userId for verification
          _userId: userId,
          // Do not persist cache to prevent timestamp-related issues
        };
      },
      onRehydrateStorage: () => (state) => {
        // Reset cache on rehydration to ensure fresh data loading
        if (state) {
          // Reset cache
          state.cache = {
            allPlans: { timestamp: 0 },
            activePlan: { timestamp: 0 },
            individual: {}
          };
          
          // Verify user ID matches to prevent data leakage
          const currentUserId = typeof window !== 'undefined' && window.localStorage 
            ? window.localStorage.getItem('current-user-id') 
            : null;
          
          // If user IDs don't match, will trigger store reset
          if (currentUserId && (state as any)._userId && currentUserId !== (state as any)._userId) {
            console.log('[workout-plan-store] User ID mismatch, triggering reset');
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

// Hook for initializing the workout plan store
export const useWorkoutPlanStoreInit = () => {
  const { initializeStore, isLoading, error } = useWorkoutPlanStore();
  
  // Run once when the hook is called
  useEffect(() => {
    initializeStore();
  }, []); // Empty dependency array - only run once on mount
  
  return { isLoading, error };
};
