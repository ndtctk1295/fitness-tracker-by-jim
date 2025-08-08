// hooks/useExerciseData.ts
import { useMemo } from 'react';
import { useExercises } from '@/lib/utils/queries/exercises-queries';
import { useCategories } from '@/lib/utils/queries/categories-queries';
import { useExerciseFiltersStore } from '@/lib/stores/exercise-store';
import { exerciseUtils } from '@/lib/utils/exercise-utils';
import type { StoreCategory, StoreExercise } from '@/lib/types';

export function useExerciseData() {
  // Get filters from store
  const { filters, updateFilters, clearFilters } = useExerciseFiltersStore();
  
  // Convert filters to stable format for React Query
  const stableFilters = useMemo(() => ({
    difficulty: filters.difficulty || undefined,
    muscleGroup: filters.muscleGroup || undefined,
    equipment: filters.equipment || undefined,
    activeOnly: filters.activeOnly ?? true,
  }), [filters.difficulty, filters.muscleGroup, filters.equipment, filters.activeOnly]);

  // Fetch data with React Query
  const categoriesQuery = useCategories();
  const exercisesQuery = useExercises(stableFilters);
  const categories: StoreCategory[] = categoriesQuery.data || [];
  const exercises: StoreExercise[] = exercisesQuery.data || [];
  const isLoading = categoriesQuery.isLoading || exercisesQuery.isLoading;
  const error = categoriesQuery.error || exercisesQuery.error;
  const initialized = !categoriesQuery.isLoading && !exercisesQuery.isLoading;

  // Utility functions using the new pattern
  const getCategoryById = (id: string) => exerciseUtils.getCategoryById(categories, id);
  const getExerciseById = (id: string) => exerciseUtils.getExerciseById(exercises, id);
  const getExercisesByCategory = (categoryId: string) => exerciseUtils.getExercisesByCategory(exercises, categoryId);
  const getFilteredExercises = () => exerciseUtils.getFilteredExercises(exercises, filters);
  const getFavoriteExercises = () => exerciseUtils.getFavoriteExercises(exercises);
  const getExercisesByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced') => 
    exerciseUtils.getExercisesByDifficulty(exercises, difficulty);
  const getExercisesByMuscleGroup = (muscleGroup: string) => 
    exerciseUtils.getExercisesByMuscleGroup(exercises, muscleGroup);

  const refreshData = () => {
    categoriesQuery.refetch();
    exercisesQuery.refetch();
  };

  return {
    // Data
    categories,
    exercises,
    isLoading,
    error: error?.message || null,
    initialized,
    
    // Filters
    filters,
    setFilters: updateFilters,
    clearFilters,
    
    // Utility functions
    getCategoryById,
    getExerciseById,
    getExercisesByCategory,
    getFilteredExercises,
    getFavoriteExercises,
    getExercisesByDifficulty,
    getExercisesByMuscleGroup,
    
    // Actions
    refreshData,
    refreshCategories: categoriesQuery.refetch,
    refreshExercises: exercisesQuery.refetch,
  };
}

// Example usage:
// const { exercises, categories, isLoading, filters, setFilters } = useExerciseData();
