'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { adminScheduledExerciseService, AdminScheduledExercise } from '@/lib/services/clients-service/admin-scheduled-exercise-service';
import { useToast } from '@/lib/hooks/use-toast';

interface UseAdminScheduledExercisesOptions {
  initialLoad?: boolean;
  userId?: string;
  date?: Date;
  dateRange?: { start: Date; end: Date };
}

export function useAdminScheduledExercises(options: UseAdminScheduledExercisesOptions = {}) {
  const { initialLoad = true, userId, date, dateRange } = options;
  
  const [exercises, setExercises] = useState<AdminScheduledExercise[]>([]);
  const [isLoading, setIsLoading] = useState(initialLoad);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Load exercises based on provided options
  useEffect(() => {
    if (!initialLoad) return;
    
    const loadExercises = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let result: AdminScheduledExercise[];
        
        if (userId) {
          // Load exercises for a specific user
          result = await adminScheduledExerciseService.getByUserId(userId);
        } else if (date) {
          // Load exercises for a specific date across all users
          const formattedDate = format(date, 'yyyy-MM-dd');
          result = await adminScheduledExerciseService.getByDate(formattedDate);
        } else {
          // Load all exercises
          result = await adminScheduledExerciseService.getAll();
        }
        
        setExercises(result);
      } catch (error) {
        const errorMessage = 'Failed to load scheduled exercises';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        console.error(errorMessage, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExercises();
  }, [initialLoad, userId, date, toast]);
  
  /**
   * Reload all exercises
   */
  const reloadExercises = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminScheduledExerciseService.getAll();
      setExercises(result);
    } catch (error) {
      const errorMessage = 'Failed to reload exercises';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error(errorMessage, error);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Get exercises for a specific user
   */
  const getExercisesForUser = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminScheduledExerciseService.getByUserId(userId);
      setExercises(result);
      return result;
    } catch (error) {
      const errorMessage = `Failed to get exercises for user ${userId}`;
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error(errorMessage, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Get exercises for a specific date
   */
  const getExercisesForDate = async (date: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const result = await adminScheduledExerciseService.getByDate(formattedDate);
      setExercises(result);
      return result;
    } catch (error) {
      const errorMessage = `Failed to get exercises for date ${format(date, 'MMM d, yyyy')}`;
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error(errorMessage, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Create exercise for a user
   */
  const createExercise = async (exercise: Parameters<typeof adminScheduledExerciseService.create>[0]) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminScheduledExerciseService.create(exercise);
      setExercises(prev => [...prev, result]);
      toast({
        title: 'Success',
        description: 'Exercise created successfully',
      });
      return result;
    } catch (error) {
      const errorMessage = 'Failed to create exercise';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error(errorMessage, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Create multiple exercises for a user
   */
  const createMultipleExercises = async (
    userId: string,
    date: Date,
    exercisesData: Parameters<typeof adminScheduledExerciseService.createMultiple>[2]
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const result = await adminScheduledExerciseService.createMultiple(
        userId,
        formattedDate,
        exercisesData
      );
      
      setExercises(prev => [...prev, ...result]);
      toast({
        title: 'Success',
        description: `${result.length} exercises created successfully`,
      });
      return result;
    } catch (error) {
      const errorMessage = 'Failed to create multiple exercises';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error(errorMessage, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Update an exercise
   */
  const updateExercise = async (id: string, data: Parameters<typeof adminScheduledExerciseService.update>[1]) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminScheduledExerciseService.update(id, data);
      setExercises(prev => 
        prev.map(exercise => exercise._id === id ? result : exercise)
      );
      toast({
        title: 'Success',
        description: 'Exercise updated successfully',
      });
      return result;
    } catch (error) {
      const errorMessage = 'Failed to update exercise';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error(errorMessage, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Delete an exercise
   */
  const deleteExercise = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await adminScheduledExerciseService.delete(id);
      setExercises(prev => prev.filter(exercise => exercise._id !== id));
      toast({
        title: 'Success',
        description: 'Exercise deleted successfully',
      });
    } catch (error) {
      const errorMessage = 'Failed to delete exercise';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error(errorMessage, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Batch update exercise status
   */
  const updateExercisesStatus = async (ids: string[], completed: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      await adminScheduledExerciseService.batchUpdateStatus(ids, completed);
      setExercises(prev => 
        prev.map(exercise => 
          ids.includes(exercise._id) ? { ...exercise, completed } : exercise
        )
      );
      toast({
        title: 'Success',
        description: `Updated status for ${ids.length} exercises`,
      });
    } catch (error) {
      const errorMessage = 'Failed to update exercise status';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error(errorMessage, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Copy exercises between users
   */
  const copyExercisesBetweenUsers = async (
    fromUserId: string,
    toUserId: string,
    date: Date,
    targetDate?: Date
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const formattedTargetDate = targetDate ? format(targetDate, 'yyyy-MM-dd') : undefined;
      
      const result = await adminScheduledExerciseService.copyExercisesBetweenUsers(
        fromUserId,
        toUserId,
        formattedDate,
        formattedTargetDate
      );
      
      setExercises(prev => [...prev, ...result]);
      toast({
        title: 'Success',
        description: `Copied ${result.length} exercises between users`,
      });
      return result;
    } catch (error) {
      const errorMessage = 'Failed to copy exercises between users';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error(errorMessage, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Generate usage report
   */
  const generateUsageReport = async (options?: Parameters<typeof adminScheduledExerciseService.generateUsageReport>[0]) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminScheduledExerciseService.generateUsageReport(options);
      toast({
        title: 'Success',
        description: 'Usage report generated successfully',
      });
      return result;
    } catch (error) {
      const errorMessage = 'Failed to generate usage report';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error(errorMessage, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Clear exercises for user
   */
  const clearExercisesForUser = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await adminScheduledExerciseService.deleteByUserId(userId);
      setExercises(prev => prev.filter(exercise => exercise.userId !== userId));
      toast({
        title: 'Success',
        description: 'All exercises for this user have been cleared',
      });
    } catch (error) {
      const errorMessage = `Failed to clear exercises for user ${userId}`;
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error(errorMessage, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Clear exercises for date
   */
  const clearExercisesForDate = async (date: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      await adminScheduledExerciseService.deleteByDate(formattedDate);
      setExercises(prev => prev.filter(exercise => exercise.date !== formattedDate));
      toast({
        title: 'Success',
        description: `All exercises for ${format(date, 'MMM d, yyyy')} have been cleared`,
      });
    } catch (error) {
      const errorMessage = `Failed to clear exercises for date ${format(date, 'MMM d, yyyy')}`;
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error(errorMessage, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exercises,
    isLoading,
    error,
    reloadExercises,
    getExercisesForUser,
    getExercisesForDate,
    createExercise,
    createMultipleExercises,
    updateExercise,
    deleteExercise,
    updateExercisesStatus,
    copyExercisesBetweenUsers,
    generateUsageReport,
    clearExercisesForUser,
    clearExercisesForDate
  };
}
