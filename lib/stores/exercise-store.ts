'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { categoryService } from '@/lib/services/clients-service/category-service';
import { exerciseService } from '@/lib/services/clients-service/exercise-service';
import React from 'react';
import { Category, Exercise, StoreCategory, StoreExercise } from '@/lib/types';

// Store-specific types that use 'id' instead of '_id' for frontend compatibility
interface ExerciseStoreState {
  // Data
  categories: StoreCategory[];
  exercises: StoreExercise[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Filters
  filters: {
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    muscleGroup?: string;
    equipment?: string;
    activeOnly: boolean;
    userStatus?: 'favorite';
  };
  
  // Initialization state
  initialized: boolean;

  // Methods
  clearErrors: () => void;
  
  // Data fetching methods
  initializeStore: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshExercises: () => Promise<void>;
  
  // Filter methods
  setFilters: (filters: Partial<ExerciseStoreState['filters']>) => void;
  clearFilters: () => void;
    // Utility methods
  getCategoryById: (id: string) => StoreCategory | undefined;
  getExerciseById: (id: string) => StoreExercise | undefined;
  getExercisesByCategory: (categoryId: string) => StoreExercise[];
  getFilteredExercises: () => StoreExercise[];
  getFavoriteExercises: () => StoreExercise[];
  getExercisesByDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced') => StoreExercise[];
  getExercisesByMuscleGroup: (muscleGroup: string) => StoreExercise[];
  
  // Reset the store to initial state
  reset: () => void;
}

// Utility functions to convert API responses to store types
const apiToStoreCategory = (category: Category): StoreCategory => ({
  id: category._id,
  name: category.name,
  color: category.color || '#6366F1', // Default indigo color
  createdBy: category.createdBy,
  updatedBy: category.updatedBy,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});

const apiToStoreExercise = (exercise: Exercise): StoreExercise => ({
  id: exercise._id,
  name: exercise.name,
  categoryId: exercise.categoryId,
  description: exercise.description,
  imageUrl: exercise.imageUrl,
  difficulty: exercise.difficulty,
  muscleGroups: exercise.muscleGroups,
  equipment: exercise.equipment,
  instructions: exercise.instructions,
  tips: exercise.tips,
  isActive: exercise.isActive,
  userStatus: null, // Will be populated by merging with user preferences
  userNotes: undefined,
  userCustomSettings: undefined,
  lastUsed: undefined,
  createdBy: exercise.createdBy,
  updatedBy: exercise.updatedBy,
  createdAt: exercise.createdAt,
  updatedAt: exercise.updatedAt,
});

// Create the exercise store
export const useExerciseStore = create<ExerciseStoreState>()(
  persist(    (set, get) => ({
      // Initial state
      categories: [],
      exercises: [],
      isLoading: false,
      error: null,
      filters: {
        activeOnly: true,
      },
      initialized: false,

      // Clear errors
      clearErrors: () => set({ error: null }),      // Initialize store
      initializeStore: async () => {
        const state = get();
        // Only skip initialization if we have both categories and exercises data AND no error
        if (state.initialized && !state.error && state.categories.length > 0 && state.exercises.length > 0) {
          console.log('Store already initialized with data, skipping fetch');
          return;
        }

        console.log('Initializing exercise store...');
        set({ isLoading: true, error: null });
        
        try {
          // Fetch categories and exercises in parallel
          await Promise.all([
            get().refreshCategories(),
            get().refreshExercises()
          ]);
          set({ initialized: true });
          console.log('Exercise store initialization complete');
        } catch (error: any) {
          console.error('Failed to initialize exercise store:', error);
          set({ error: error.message || 'Failed to initialize exercises' });
        } finally {
          set({ isLoading: false });
        }
      },      // Refresh categories from API
      refreshCategories: async () => {
        console.log('Refreshing categories...');
        set({ isLoading: true, error: null });
        
        try {
          const categoriesResponse = await categoryService.getAll();
          console.log('Categories fetched:', categoriesResponse.length);
          set({ 
            categories: categoriesResponse.map(apiToStoreCategory),
            isLoading: false
          });
        } catch (error: any) {
          console.error('Failed to refresh categories:', error);
          set({ 
            error: 'Failed to refresh categories', 
            isLoading: false 
          });
        }
      },      // Refresh exercises from API
      refreshExercises: async () => {
        console.log('Refreshing exercises...');
        set({ isLoading: true, error: null });
        
        try {
          const filters = get().filters;
          const params = new URLSearchParams();
          
          if (filters.difficulty) params.append('difficulty', filters.difficulty);
          if (filters.muscleGroup) params.append('muscleGroup', filters.muscleGroup);
          if (filters.equipment) params.append('equipment', filters.equipment);
          params.append('activeOnly', filters.activeOnly.toString());

          console.log('Fetching exercises from /api/exercises/available...');
          let response = await fetch(`/api/exercises/available?${params.toString()}`);
          
          // If the authenticated route fails, try the basic route
          if (!response.ok) {
            console.warn('Available endpoint failed, trying basic exercises endpoint');
            response = await fetch('/api/exercises');
            
            if (!response.ok) {
              throw new Error(`Both API endpoints failed. Available: ${response.status}, Basic: ${response.status}`);
            }
            
            // Handle basic exercises response (different format)
            const basicExercises = await response.json();
            console.log('Basic exercises received:', basicExercises.length);
            const storeExercises: StoreExercise[] = basicExercises.map(apiToStoreExercise);
            set({ exercises: storeExercises });
          } else {
            // Handle available exercises response
            const data = await response.json();
            console.log('Available exercises received:', data);
            
            // Transform exercises to store format
            const storeExercises: StoreExercise[] = data.exercises.map(apiToStoreExercise);
            console.log('Transformed exercises:', storeExercises.length);
            set({ exercises: storeExercises });
          }
        } catch (error: any) {
          console.error('Failed to refresh exercises:', error);
          set({ error: error.message || 'Failed to refresh exercises' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Set filters
      setFilters: (newFilters: Partial<ExerciseStoreState['filters']>) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters }
        }));
          // Refresh exercises with new filters
        get().refreshExercises();
      },

      // Clear filters
      clearFilters: () => {
        set({
          filters: {
            activeOnly: true,
          }
        });
        
        // Refresh exercises        
        get().refreshExercises();
      },

      // Get category by ID
      getCategoryById: (id: string) => {
        return get().categories.find(category => category.id === id);
      },

      // Get exercise by ID
      getExerciseById: (id: string) => {
        return get().exercises.find((exercise: StoreExercise) => exercise.id === id);
      },

      // Get exercises by category
      getExercisesByCategory: (categoryId: string) => {
        return get().exercises.filter((exercise: StoreExercise) => exercise.categoryId === categoryId);
      },

      // Utility methods
      getFilteredExercises: () => {        const { exercises, filters } = get();
        
        return exercises.filter((exercise: StoreExercise) => {
          if (filters.difficulty && exercise.difficulty !== filters.difficulty) {
            return false;
          }
          
          if (filters.muscleGroup && (!exercise.muscleGroups || !exercise.muscleGroups.includes(filters.muscleGroup))) {
            return false;
          }
          
          if (filters.equipment && (!exercise.equipment || !exercise.equipment.includes(filters.equipment))) {
            return false;
          }
          
          if (filters.activeOnly && exercise.isActive === false) {
            return false;
          }
          
          if (filters.userStatus && exercise.userStatus !== filters.userStatus) {
            return false;
          }
          
          return true;
        });      },

      getFavoriteExercises: () => {const { exercises } = get();
        return exercises.filter((exercise: StoreExercise) => exercise.userStatus === 'favorite');
      },

      getExercisesByDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced') => {        const { exercises } = get();
        return exercises.filter((exercise: StoreExercise) => exercise.difficulty === difficulty);
      },      getExercisesByMuscleGroup: (muscleGroup: string) => {
        const { exercises } = get();
        return exercises.filter((exercise: StoreExercise) => 
          exercise.muscleGroups && exercise.muscleGroups.includes(muscleGroup)
        );
      },

      // Reset the store to initial state
      reset: () => {
        set({
          categories: [],
          exercises: [],
          isLoading: false,
          error: null,
          filters: {
            activeOnly: true,
          },
          initialized: false,
        });
      },
    }),
    {
      name: 'exercise-store',
      partialize: (state) => {
        // Get current user ID to add to storage key
        const userId = typeof window !== 'undefined' && window.localStorage 
          ? window.localStorage.getItem('current-user-id') 
          : null;
        
        return {
          categories: state.categories,
          exercises: state.exercises,
          filters: state.filters,
          initialized: state.initialized,
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
            console.log('[exercise-store] User ID mismatch, triggering reset');
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


export default useExerciseStore;