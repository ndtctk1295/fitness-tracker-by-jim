"use client";

import { create } from 'zustand';
import { useMemo } from 'react';
import { useCategories, useExercises } from '@/lib/queries';
import type { StoreCategory, StoreExercise } from '@/lib/types';

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

// Create Zustand store for filter state
const useExerciseFiltersStore = create<ExerciseState>((set) => ({
  filters: {
    activeOnly: true,
  },
  updateFilters: (newFilters) => {
    console.log('[ExerciseStore] Filter update:', newFilters);
    return set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },
  clearFilters: () => {
    console.log('[ExerciseStore] Clearing filters');
    return set({
      filters: { activeOnly: true },
    });
  },
}));

export const useExerciseStore = () => {
  // Get filters from Zustand store (shared across all components)
  const { filters, updateFilters, clearFilters } = useExerciseFiltersStore();
  
  // Memoize filters to ensure stable query keys - use JSON.stringify for deep comparison
  const stableFilters = useMemo(() => ({
    difficulty: filters.difficulty || undefined,
    muscleGroup: filters.muscleGroup || undefined,
    equipment: filters.equipment || undefined,
    activeOnly: filters.activeOnly ?? true,
  }), [
    filters.difficulty,
    filters.muscleGroup,
    filters.equipment,
    filters.activeOnly,
  ]);

  // Use stable filters in queries
  const categoriesQuery = useCategories();
  const exercisesQuery = useExercises(stableFilters);

  const categories: StoreCategory[] = categoriesQuery.data || [];
  const exercises: StoreExercise[] = exercisesQuery.data || [];
  const isLoading = categoriesQuery.isLoading || exercisesQuery.isLoading;
  const error = categoriesQuery.error || exercisesQuery.error;
  const initialized = !categoriesQuery.isLoading && !exercisesQuery.isLoading;

  const getCategoryById = useMemo(() => (id: string) => {
    return categories.find(category => category.id === id);
  }, [categories]);

  const getExerciseById = useMemo(() => (id: string) => {
    return exercises.find(exercise => exercise.id === id);
  }, [exercises]);

  const getExercisesByCategory = useMemo(() => (categoryId: string) => {
    return exercises.filter(exercise => exercise.categoryId === categoryId);
  }, [exercises]);

  const getFilteredExercises = useMemo(() => () => {
    let filtered = exercises;
    if (filters.difficulty) {
      filtered = filtered.filter(exercise => exercise.difficulty === filters.difficulty);
    }
    if (filters.muscleGroup) {
      filtered = filtered.filter(exercise => exercise.muscleGroups?.includes(filters.muscleGroup!));
    }
    if (filters.equipment) {
      filtered = filtered.filter(exercise => exercise.equipment?.includes(filters.equipment!));
    }
    if (filters.activeOnly) {
      filtered = filtered.filter(exercise => exercise.isActive);
    }
    if (filters.userStatus === 'favorite') {
      filtered = filtered.filter(exercise => exercise.userStatus === 'favorite');
    }
    return filtered;
  }, [exercises, filters]);

  const getFavoriteExercises = useMemo(() => () => {
    return exercises.filter(exercise => exercise.userStatus === 'favorite');
  }, [exercises]);

  const getExercisesByDifficulty = useMemo(() => (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    return exercises.filter(exercise => exercise.difficulty === difficulty);
  }, [exercises]);

  const getExercisesByMuscleGroup = useMemo(() => (muscleGroup: string) => {
    return exercises.filter(exercise => exercise.muscleGroups?.includes(muscleGroup));
  }, [exercises]);

  const clearErrors = () => {
    categoriesQuery.refetch();
    exercisesQuery.refetch();
  };

  const refreshCategories = () => categoriesQuery.refetch();
  const refreshExercises = () => exercisesQuery.refetch();
  
  // Simplified initialize function - just returns a resolved promise since
  // TanStack Query handles automatic fetching
  const initializeStore = () => Promise.resolve();

  const reset = () => {
    clearFilters();
    clearErrors();
  };

  return {
    categories,
    exercises,
    isLoading,
    error: error?.message || null,
    initialized,
    filters,
    clearErrors,
    initializeStore,
    refreshCategories,
    refreshExercises,
    setFilters: updateFilters,
    clearFilters,
    getCategoryById,
    getExerciseById,
    getExercisesByCategory,
    getFilteredExercises,
    getFavoriteExercises,
    getExercisesByDifficulty,
    getExercisesByMuscleGroup,
    reset,
  };
};

export default useExerciseStore;