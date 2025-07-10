'use client';

import { useEffect, useMemo } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useScheduledExerciseStore } from '@/lib/stores/scheduled-exercise-store';
import { useExerciseStore } from '@/lib/stores/exercise-store';
import { HistoryStatsCards } from '@/components/history/history-stats-cards';
import { HistoryDataTable } from '@/components/history/history-data-table';
import { createColumns } from '@/components/history/data-table-columns';
import { EnrichedScheduledExercise } from '@/components/history/types';

export default function HistoryPage() {  // Store state
  const {
    scheduledExercises,
    isLoading: scheduledLoading,
    error: scheduledError,
    fetchAll: fetchAllScheduled,
    initialized: scheduledInitialized,
    markExerciseCompleted
  } = useScheduledExerciseStore();

  const {
    exercises,
    categories,
    isLoading: exerciseLoading,
    error: exerciseError,
    getCategoryById,
    getExerciseById
  } = useExerciseStore();
    // Fetch all scheduled exercises on component mount
  useEffect(() => {
    console.debug('[HistoryPage] Component mounted, state:', {
      scheduledExercisesCount: scheduledExercises.length,
      scheduledLoading,
      scheduledError,
      scheduledInitialized
    });
    
    console.debug('[HistoryPage] Fetching all scheduled exercises on mount');
    fetchAllScheduled().catch(console.error);
  }, []); // Empty dependency array - runs only once on mount

  // Enrich scheduled exercises with exercise and category names using memoization
  const enrichedScheduledExercises = useMemo((): EnrichedScheduledExercise[] => {
    console.debug('[HistoryPage] Enriching scheduled exercises:', {
      scheduledExercisesCount: scheduledExercises.length,
      exercisesCount: exercises.length,
      categoriesCount: categories.length
    });
    
    return scheduledExercises.map(scheduled => {
      const exercise = getExerciseById(scheduled.exerciseId);
      const category = getCategoryById(scheduled.categoryId);
      
      return {
        ...scheduled,
        exerciseName: exercise?.name || 'Unknown Exercise',
        categoryName: category?.name || 'Unknown Category',
        categoryColor: category?.color || '#6b7280',
      };
    });
  }, [scheduledExercises, getExerciseById, getCategoryById]);
  // Create columns with store methods
  const columns = useMemo(() => createColumns({ 
    markExerciseCompleted 
  }), [markExerciseCompleted]);

  // Prepare categories for DataTable filtering
  const categoryOptions = categories.map(cat => ({
    label: cat.name,
    value: cat.name,
    color: cat.color
  }));

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

  // Derived state for loading and error handling
  const isLoading = scheduledLoading || exerciseLoading;
  const error = scheduledError || exerciseError;

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
