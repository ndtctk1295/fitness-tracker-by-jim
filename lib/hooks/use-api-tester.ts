'use client';

import { useState } from 'react';
import { scheduledExerciseService } from '@/lib/services/clients-service/scheduled-exercise-service';
import { useToast } from '@/lib/hooks/use-toast';

/**
 * Hook for testing API integration with scheduled exercises
 * This is useful for debugging and testing the API endpoints
 */
export function useApiTester() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Clear previous results and errors
  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  // Test fetching all exercises
  const testFetchAll = async () => {
    clearResults();
    setIsLoading(true);
    try {
      const response = await scheduledExerciseService.getAll();
      setResults(response);
      toast({
        title: 'Success',
        description: `Retrieved ${response.length} scheduled exercises`,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch all scheduled exercises');
      toast({
        title: 'Error',
        description: 'Failed to fetch all scheduled exercises',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test fetching by date
  const testFetchByDate = async (date: string) => {
    clearResults();
    setIsLoading(true);
    try {
      const response = await scheduledExerciseService.getByDate(date);
      setResults(response);
      toast({
        title: 'Success',
        description: `Retrieved ${response.length} scheduled exercises for date ${date}`,
      });
    } catch (err: any) {
      setError(err.message || `Failed to fetch scheduled exercises for date ${date}`);
      toast({
        title: 'Error',
        description: `Failed to fetch scheduled exercises for date ${date}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test fetching by date range
  const testFetchByDateRange = async (startDate: string, endDate: string) => {
    clearResults();
    setIsLoading(true);
    try {
      const response = await scheduledExerciseService.getByDateRange(startDate, endDate);
      setResults(response);
      toast({
        title: 'Success',
        description: `Retrieved ${response.length} scheduled exercises between ${startDate} and ${endDate}`,
      });
    } catch (err: any) {
      setError(err.message || `Failed to fetch scheduled exercises for date range`);
      toast({
        title: 'Error',
        description: `Failed to fetch scheduled exercises for date range`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test creating a new scheduled exercise
  const testCreate = async (exerciseData: Parameters<typeof scheduledExerciseService.create>[0]) => {
    clearResults();
    setIsLoading(true);
    try {
      const response = await scheduledExerciseService.create(exerciseData);
      setResults(response);
      toast({
        title: 'Success',
        description: 'Created new scheduled exercise',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create scheduled exercise');
      toast({
        title: 'Error',
        description: 'Failed to create scheduled exercise',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test updating an existing scheduled exercise
  const testUpdate = async (id: string, exerciseData: Parameters<typeof scheduledExerciseService.update>[1]) => {
    clearResults();
    setIsLoading(true);
    try {
      const response = await scheduledExerciseService.update(id, exerciseData);
      setResults(response);
      toast({
        title: 'Success',
        description: `Updated scheduled exercise ${id}`,
      });
    } catch (err: any) {
      setError(err.message || `Failed to update scheduled exercise ${id}`);
      toast({
        title: 'Error',
        description: `Failed to update scheduled exercise ${id}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test deleting a scheduled exercise
  const testDelete = async (id: string) => {
    clearResults();
    setIsLoading(true);
    try {
      await scheduledExerciseService.delete(id);
      setResults({ success: true, message: `Deleted scheduled exercise ${id}` });
      toast({
        title: 'Success',
        description: `Deleted scheduled exercise ${id}`,
      });
    } catch (err: any) {
      setError(err.message || `Failed to delete scheduled exercise ${id}`);
      toast({
        title: 'Error',
        description: `Failed to delete scheduled exercise ${id}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test deleting all scheduled exercises for a date
  const testDeleteByDate = async (date: string) => {
    clearResults();
    setIsLoading(true);
    try {
      await scheduledExerciseService.deleteByDate(date);
      setResults({ success: true, message: `Deleted all scheduled exercises for date ${date}` });
      toast({
        title: 'Success',
        description: `Deleted all scheduled exercises for date ${date}`,
      });
    } catch (err: any) {
      setError(err.message || `Failed to delete scheduled exercises for date ${date}`);
      toast({
        title: 'Error',
        description: `Failed to delete scheduled exercises for date ${date}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test batch creation of scheduled exercises
  const testCreateMultiple = async (date: string, exercises: Parameters<typeof scheduledExerciseService.createMultiple>[1]) => {
    clearResults();
    setIsLoading(true);
    try {
      const response = await scheduledExerciseService.createMultiple(date, exercises);
      setResults(response);
      toast({
        title: 'Success',
        description: `Created ${response.length} scheduled exercises for date ${date}`,
      });
    } catch (err: any) {
      setError(err.message || `Failed to create scheduled exercises for date ${date}`);
      toast({
        title: 'Error',
        description: `Failed to create scheduled exercises for date ${date}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    results,
    error,
    clearResults,
    testFetchAll,
    testFetchByDate,
    testFetchByDateRange,
    testCreate,
    testUpdate,
    testDelete,
    testDeleteByDate,
    testCreateMultiple,
  };
}
