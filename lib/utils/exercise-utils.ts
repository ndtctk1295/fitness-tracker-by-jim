// Generic interfaces that work with different exercise data shapes
interface CategoryWithId {
  id: string;
  [key: string]: any;
}

interface ExerciseWithDetails {
  id: string;
  categoryId: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  muscleGroups?: string[];
  equipment?: string[];
  isActive?: boolean;
  userStatus?: 'favorite' | string | null;
  [key: string]: any;
}

interface ExerciseFilters {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  muscleGroup?: string;
  equipment?: string;
  activeOnly?: boolean;
  userStatus?: 'favorite' | string | null;
}

/**
 * Pure utility functions for working with exercise and category data
 * These functions have no side effects and are easy to test
 * Uses generic types to work with different exercise data shapes
 */
export const exerciseUtils = {
  /**
   * Find a category by ID
   */
  getCategoryById: <T extends CategoryWithId>(categories: T[], id: string): T | undefined => {
    return categories?.find(category => category.id === id);
  },

  /**
   * Find an exercise by ID
   */
  getExerciseById: <T extends ExerciseWithDetails>(exercises: T[], id: string): T | undefined => {
    return exercises?.find(exercise => exercise.id === id);
  },

  /**
   * Get exercises by category ID
   */
  getExercisesByCategory: <T extends ExerciseWithDetails>(exercises: T[], categoryId: string): T[] => {
    return exercises?.filter(exercise => exercise.categoryId === categoryId) || [];
  },

  /**
   * Get filtered exercises based on provided filters
   */
  getFilteredExercises: <T extends ExerciseWithDetails>(exercises: T[], filters: ExerciseFilters): T[] => {
    if (!exercises) return [];
    
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
  },

  /**
   * Get favorite exercises
   */
  getFavoriteExercises: <T extends ExerciseWithDetails>(exercises: T[]): T[] => {
    return exercises?.filter(exercise => exercise.userStatus === 'favorite') || [];
  },

  /**
   * Get exercises by difficulty level
   */
  getExercisesByDifficulty: <T extends ExerciseWithDetails>(
    exercises: T[], 
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): T[] => {
    return exercises?.filter(exercise => exercise.difficulty === difficulty) || [];
  },

  /**
   * Get exercises by muscle group
   */
  getExercisesByMuscleGroup: <T extends ExerciseWithDetails>(exercises: T[], muscleGroup: string): T[] => {
    return exercises?.filter(exercise => exercise.muscleGroups?.includes(muscleGroup)) || [];
  },

  /**
   * Get exercises by equipment
   */
  getExercisesByEquipment: <T extends ExerciseWithDetails>(exercises: T[], equipment: string): T[] => {
    return exercises?.filter(exercise => exercise.equipment?.includes(equipment)) || [];
  },

  /**
   * Get active exercises only
   */
  getActiveExercises: <T extends ExerciseWithDetails>(exercises: T[]): T[] => {
    return exercises?.filter(exercise => exercise.isActive !== false) || [];
  },

  /**
   * Get exercise statistics
   */
  getExerciseStats: <T extends ExerciseWithDetails>(exercises: T[]) => {
    const total = exercises?.length || 0;
    const active = exercises?.filter(ex => ex.isActive !== false).length || 0;
    const inactive = total - active;
    const favorites = exercises?.filter(ex => ex.userStatus === 'favorite').length || 0;
    
    // Difficulty breakdown
    const beginner = exercises?.filter(ex => ex.difficulty === 'beginner').length || 0;
    const intermediate = exercises?.filter(ex => ex.difficulty === 'intermediate').length || 0;
    const advanced = exercises?.filter(ex => ex.difficulty === 'advanced').length || 0;
    
    return { 
      total, 
      active, 
      inactive, 
      favorites,
      difficulty: { beginner, intermediate, advanced }
    };
  },

  /**
   * Group exercises by category
   */
  groupExercisesByCategory: <T extends ExerciseWithDetails>(exercises: T[]): Record<string, T[]> => {
    return exercises.reduce((acc, exercise) => {
      const categoryId = exercise.categoryId;
      if (!acc[categoryId]) acc[categoryId] = [];
      acc[categoryId].push(exercise);
      return acc;
    }, {} as Record<string, T[]>);
  },

  /**
   * Group exercises by difficulty
   */
  groupExercisesByDifficulty: <T extends ExerciseWithDetails>(exercises: T[]): Record<string, T[]> => {
    return exercises.reduce((acc, exercise) => {
      const difficulty = exercise.difficulty || 'unknown';
      if (!acc[difficulty]) acc[difficulty] = [];
      acc[difficulty].push(exercise);
      return acc;
    }, {} as Record<string, T[]>);
  },

  /**
   * Get unique muscle groups from exercises
   */
  getUniqueMuscleGroups: <T extends ExerciseWithDetails>(exercises: T[]): string[] => {
    const muscleGroups = new Set<string>();
    exercises.forEach(exercise => {
      exercise.muscleGroups?.forEach(group => muscleGroups.add(group));
    });
    return Array.from(muscleGroups).sort();
  },

  /**
   * Get unique equipment from exercises
   */
  getUniqueEquipment: <T extends ExerciseWithDetails>(exercises: T[]): string[] => {
    const equipment = new Set<string>();
    exercises.forEach(exercise => {
      exercise.equipment?.forEach(item => equipment.add(item));
    });
    return Array.from(equipment).sort();
  },

  /**
   * Search exercises by name or description
   */
  searchExercises: <T extends ExerciseWithDetails & { name?: string; description?: string }>(
    exercises: T[], 
    searchTerm: string
  ): T[] => {
    if (!searchTerm.trim()) return exercises;
    
    const term = searchTerm.toLowerCase().trim();
    return exercises.filter(exercise => 
      exercise.name?.toLowerCase().includes(term) ||
      exercise.description?.toLowerCase().includes(term)
    );
  },

  /**
   * Sort exercises by name
   */
  sortExercisesByName: <T extends ExerciseWithDetails & { name?: string }>(
    exercises: T[], 
    ascending: boolean = true
  ): T[] => {
    return [...exercises].sort((a, b) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      return ascending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  },
};
