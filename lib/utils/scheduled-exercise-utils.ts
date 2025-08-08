import { format } from 'date-fns';

// Generic exercise interface that works with both API responses and ScheduledExercise types
interface ExerciseWithDate {
  date: string;
  completed: boolean;
  categoryId?: string;
  _id?: string;
  id?: string;
}

/**
 * Pure utility functions for working with scheduled exercise data
 * These functions have no side effects and are easy to test
 * Uses generic types to work with different exercise data shapes
 */
export const scheduledExerciseUtils = {
  /**
   * Get exercises for a specific date
   */
  getExercisesForDate: <T extends ExerciseWithDate>(exercises: T[], date: Date | string): T[] => {
    const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
    return exercises?.filter(exercise => exercise.date === dateStr) || [];
  },

  /**
   * Get completed exercises
   */
  getCompletedExercises: <T extends ExerciseWithDate>(exercises: T[]): T[] => {
    return exercises?.filter(exercise => exercise.completed) || [];
  },

  /**
   * Get pending (not completed) exercises
   */
  getPendingExercises: <T extends ExerciseWithDate>(exercises: T[]): T[] => {
    return exercises?.filter(exercise => !exercise.completed) || [];
  },

  /**
   * Get exercises by category
   */
  getExercisesByCategory: <T extends ExerciseWithDate>(exercises: T[], categoryId: string): T[] => {
    return exercises?.filter(exercise => exercise.categoryId === categoryId) || [];
  },

  /**
   * Get exercises within a date range
   */
  getExercisesByDateRange: <T extends ExerciseWithDate>(exercises: T[], startDate: string, endDate: string): T[] => {
    return exercises?.filter(exercise => 
      exercise.date >= startDate && exercise.date <= endDate
    ) || [];
  },

  /**
   * Get exercise statistics
   */
  getExerciseStats: <T extends ExerciseWithDate>(exercises: T[]) => {
    const total = exercises?.length || 0;
    const completed = exercises?.filter(ex => ex.completed).length || 0;
    const pending = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    return { total, completed, pending, completionRate };
  },

  /**
   * Group exercises by date
   */
  groupExercisesByDate: <T extends ExerciseWithDate>(exercises: T[]): Record<string, T[]> => {
    return exercises.reduce((acc, exercise) => {
      const date = exercise.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(exercise);
      return acc;
    }, {} as Record<string, T[]>);
  },

  /**
   * Get exercises for current week
   */
  getThisWeekExercises: <T extends ExerciseWithDate>(exercises: T[]): T[] => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6));
    
    const startDate = format(startOfWeek, 'yyyy-MM-dd');
    const endDate = format(endOfWeek, 'yyyy-MM-dd');
    
    return scheduledExerciseUtils.getExercisesByDateRange(exercises, startDate, endDate);
  },

  /**
   * Get exercises for current month
   */
  getThisMonthExercises: <T extends ExerciseWithDate>(exercises: T[]): T[] => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const startDate = format(startOfMonth, 'yyyy-MM-dd');
    const endDate = format(endOfMonth, 'yyyy-MM-dd');
    
    return scheduledExerciseUtils.getExercisesByDateRange(exercises, startDate, endDate);
  },

  /**
   * Find an exercise by ID (works with both _id and id fields)
   */
  findExerciseById: <T extends ExerciseWithDate>(exercises: T[], id: string): T | undefined => {
    return exercises?.find(exercise => exercise._id === id || (exercise as any).id === id);
  },

  /**
   * Sort exercises by date (newest first by default)
   */
  sortExercisesByDate: <T extends ExerciseWithDate>(exercises: T[], ascending: boolean = false): T[] => {
    return [...exercises].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  },
};
