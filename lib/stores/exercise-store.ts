"use client";

import { create } from 'zustand';
import type { StoreCategory, StoreExercise } from '@/lib/types';
import { exerciseUtils } from '@/lib/utils/exercise-utils';

interface ExerciseFilters {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  muscleGroup?: string;
  equipment?: string;
  activeOnly: boolean;
  userStatus?: 'favorite';
}

interface ExerciseState {
  filters: ExerciseFilters;
  updateFilters: (newFilters: Partial<ExerciseFilters>) => void;
  clearFilters: () => void;
}

// Simplified Zustand store that only handles filter state
export const useExerciseFiltersStore = create<ExerciseState>((set) => ({
  filters: {
    activeOnly: true,
  },
  updateFilters: (newFilters) => {
    console.log('[ExerciseFiltersStore] Filter update:', newFilters);
    return set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },
  clearFilters: () => {
    console.log('[ExerciseFiltersStore] Clearing filters');
    return set({
      filters: { activeOnly: true },
    });
  },
}));

// Re-export exercise utilities for convenience (imported from utils)
export { exerciseUtils } from '@/lib/utils/exercise-utils';

// Legacy hook for backward compatibility (deprecated - use queries directly)
export const useExerciseStore = () => {
  console.warn('[DEPRECATED] useExerciseStore is deprecated. Use useExercises and useCategories queries directly with useExerciseFiltersStore for filters.');
  
  const { filters, updateFilters, clearFilters } = useExerciseFiltersStore();
  
  return {
    filters,
    setFilters: updateFilters,
    clearFilters,
    getCategoryById: () => undefined,
    getExerciseById: () => undefined,
    getExercisesByCategory: () => [],
    getFilteredExercises: () => [],
    getFavoriteExercises: () => [],
    getExercisesByDifficulty: () => [],
    getExercisesByMuscleGroup: () => [],
    clearErrors: () => {},
    initializeStore: () => Promise.resolve(),
    refreshCategories: () => {},
    refreshExercises: () => {},
    reset: clearFilters,
  };
};

export default useExerciseFiltersStore;