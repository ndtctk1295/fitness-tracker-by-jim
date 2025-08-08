'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useScheduledExerciseData } from '@/lib/hooks/data-hook/use-scheduled-exercise-data';
import { exerciseUtils } from '@/lib/utils/exercise-utils';
import { HistoryStatsCards } from '@/components/history/history-stats-cards';
import { HistoryDataTable } from '@/components/history/history-data-table';
import { createColumns } from '@/components/history/data-table-columns';
import { EnrichedScheduledExercise } from '@/components/history/types';
import { useExerciseData } from '@/lib/hooks/data-hook/use-exercise-data';
export default function HistoryPage() {
  // Store state for scheduled exercises

    const { 
    exercises, 
    categories, 
    isLoading, 
    filters, 
    error,
    setFilters 
  } = useExerciseData();

  const {
    exercises: scheduledExercises,
    isLoading: scheduledLoading,
    error: scheduledError,
    markExerciseCompleted: _markExerciseCompleted
  } = useScheduledExerciseData();

  // Wrap the function to match expected signature
  const markExerciseCompleted = useCallback(async (id: string): Promise<void> => {
    await _markExerciseCompleted(id);
  }, [_markExerciseCompleted]);

  // Enrich scheduled exercises with exercise and category names using memoization
  const enrichedScheduledExercises = useMemo((): EnrichedScheduledExercise[] => {
    console.debug('[HistoryPage] Enriching scheduled exercises:', {
      scheduledExercisesCount: scheduledExercises.length,
      exercisesCount: exercises?.length || 0,
      categoriesCount: categories?.length || 0
    });
    
    return scheduledExercises.map(scheduled => {
      const exercise = exerciseUtils.getExerciseById(exercises || [], scheduled.exerciseId);
      const category = exerciseUtils.getCategoryById(categories || [], scheduled.categoryId);
      
      return {
        ...scheduled,
        exerciseName: exercise?.name || 'Unknown Exercise',
        categoryName: category?.name || 'Unknown Category',
        categoryColor: category?.color || '#6b7280',
      };
    });
  }, [scheduledExercises, exercises, categories]);

  // Create columns with store methods
  const columns = useMemo(() => createColumns({ 
    markExerciseCompleted 
  }), [markExerciseCompleted]);

  // Prepare categories for DataTable filtering
  const categoryOptions = useMemo(() => 
    (categories || []).map(cat => ({
      label: cat.name,
      value: cat.name,
      color: cat.color
    })), [categories]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = enrichedScheduledExercises.length;
    const completed = enrichedScheduledExercises.filter(ex => ex.completed).length;
    const pending = total - completed;
    const uniqueCategories = new Set(enrichedScheduledExercises.map(ex => ex.categoryId)).size;

    return {
      total,
      completed,
      pending,
      categories: uniqueCategories,
    };
  }, [enrichedScheduledExercises]);


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading exercise history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <HistoryStatsCards stats={stats} />

      {/* Exercise History DataTable */}
      <HistoryDataTable
        columns={columns}
        data={enrichedScheduledExercises}
        categories={categoryOptions}
      />
    </div>
  );
}
