import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduledExerciseService } from '@/lib/services/clients-service';
import { ScheduledExercise } from '@/lib/types';
import { queryKeys } from './query-keys';

const apiToStoreScheduledExercise = (exercise: ScheduledExercise) => ({
  id: exercise._id,
  exerciseId: exercise.exerciseId,
  categoryId: exercise.categoryId,
  workoutPlanId: exercise.workoutPlanId ? exercise.workoutPlanId.toString() : undefined,
  date: exercise.date,
  sets: exercise.sets || 3,
  reps: exercise.reps || 10,
  weight: exercise.weight || 0,
  weightPlates: exercise.weightPlates || {},
  notes: exercise.notes || '',
  completed: exercise.completed || false,
  completedAt: exercise.completedAt,
  isHidden: exercise.isHidden || false,
});

export const useScheduledExercises = (startDate?: string, endDate?: string) => {
  const queryKey = startDate && endDate ? queryKeys.scheduledExercises.byRange(startDate, endDate) : queryKeys.scheduledExercises.list({});
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (startDate && endDate) {
        const exercises = await scheduledExerciseService.getByDateRange(startDate, endDate);
        return exercises.map(apiToStoreScheduledExercise);
      }
      const exercises = await scheduledExerciseService.getAll();
      return exercises.map(apiToStoreScheduledExercise);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useScheduledExercisesForDate = (date: string) => {
  return useQuery({
    queryKey: queryKeys.scheduledExercises.byDate(date),
    queryFn: async () => {
      const exercises = await scheduledExerciseService.getByDate(date);
      return exercises.map(apiToStoreScheduledExercise);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useAddScheduledExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exercise: Omit<ScheduledExercise, '_id'>) => scheduledExerciseService.create(exercise),
    onMutate: async (newExercise) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.scheduledExercises.all() });
      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.scheduledExercises.all() });
      const exerciseDate = newExercise.date;
      
      // Add optimistic update to byDate cache
      queryClient.setQueryData(queryKeys.scheduledExercises.byDate(exerciseDate), (old: any[]) => 
        old ? [...old, { ...newExercise, id: 'temp-' + Date.now() }] : [{ ...newExercise, id: 'temp-' + Date.now() }]
      );
      
      return { previousData };
    },
    onSuccess: (createdExercise, variables) => {
      const exerciseDate = variables.date;
      const normalizedExercise = apiToStoreScheduledExercise(createdExercise);
      
      // Update byDate cache with real exercise
      queryClient.setQueryData(queryKeys.scheduledExercises.byDate(exerciseDate), (old: any[]) => {
        if (!old) return [normalizedExercise];
        const filtered = old.filter(ex => !ex.id?.toString().startsWith('temp-'));
        return [...filtered, normalizedExercise];
      });
      
      // Update all list and range queries that might contain this exercise
      queryClient.getQueriesData({ queryKey: queryKeys.scheduledExercises.all() }).forEach(([key, data]) => {
        if (!Array.isArray(data)) return;
        
        const queryKey = key as readonly unknown[];
        const queryType = queryKey[1];
        
        // Handle list queries (no date range)
        if (queryType === 'list') {
          const existingExercise = data.find((ex: any) => ex.id === normalizedExercise.id);
          if (!existingExercise) {
            queryClient.setQueryData(key, [...data, normalizedExercise]);
          }
        }
        // Handle range queries (with start/end dates)
        else if (queryType === 'range' && queryKey.length >= 4) {
          const startDate = queryKey[2] as string;
          const endDate = queryKey[3] as string;
          
          if (exerciseDate >= startDate && exerciseDate <= endDate) {
            const existingExercise = data.find((ex: any) => ex.id === normalizedExercise.id);
            if (!existingExercise) {
              queryClient.setQueryData(key, [...data, normalizedExercise]);
            }
          }
        }
      });
      
      // Invalidate all scheduled exercise queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.scheduledExercises.all(),
        exact: false
      });
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });
};

export const useUpdateScheduledExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ScheduledExercise> }) => scheduledExerciseService.update(id, data),
    onSuccess: (updatedExercise, { id, data }) => {
      const exerciseDate = data.date || updatedExercise?.date;
      const normalizedExercise = updatedExercise ? apiToStoreScheduledExercise(updatedExercise) : null;
      
      if (normalizedExercise && exerciseDate) {
        // Update byDate cache
        queryClient.setQueryData(queryKeys.scheduledExercises.byDate(exerciseDate), (old: any[]) => {
          if (!old) return [normalizedExercise];
          return old.map(ex => ex.id === id ? normalizedExercise : ex);
        });
        
        // Update all list and range queries
        queryClient.getQueriesData({ queryKey: queryKeys.scheduledExercises.all() }).forEach(([key, data]) => {
          if (!Array.isArray(data)) return;
          
          const updatedData = data.map((ex: any) => ex.id === id ? normalizedExercise : ex);
          if (JSON.stringify(updatedData) !== JSON.stringify(data)) {
            queryClient.setQueryData(key, updatedData);
          }
        });
        
        // Handle date changes
        if (data.date && updatedExercise.date !== data.date) {
          queryClient.invalidateQueries({ queryKey: queryKeys.scheduledExercises.byDate(updatedExercise.date) });
        }
      }
      
      // Invalidate all to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.scheduledExercises.all(),
        exact: false
      });
    },
  });
};

export const useDeleteScheduledExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scheduledExerciseService.delete(id),
    onMutate: async (deletedId) => {
      let exerciseDate: string | null = null;
      queryClient.getQueriesData({ queryKey: queryKeys.scheduledExercises.all() }).forEach(([_, data]) => {
        if (Array.isArray(data)) {
          const exercise = data.find((ex: any) => ex.id === deletedId);
          if (exercise) exerciseDate = exercise.date;
        }
      });
      return { exerciseDate };
    },
    onSuccess: (_, deletedId, context) => {
      // Update byDate cache
      if (context?.exerciseDate) {
        queryClient.setQueryData(queryKeys.scheduledExercises.byDate(context.exerciseDate), (old: any[]) => 
          old ? old.filter(ex => ex.id !== deletedId) : []
        );
      }
      
      // Update all list and range queries
      queryClient.getQueriesData({ queryKey: queryKeys.scheduledExercises.all() }).forEach(([key, data]) => {
        if (!Array.isArray(data)) return;
        
        const filteredData = data.filter((ex: any) => ex.id !== deletedId);
        if (filteredData.length !== data.length) {
          queryClient.setQueryData(key, filteredData);
        }
      });
      
      // Invalidate all to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.scheduledExercises.all(),
        exact: false
      });
    },
  });
};

export const useRescheduleExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ exerciseId, newDate, scope = 'this-week', options }: { exerciseId: string; newDate: string; scope?: 'this-week' | 'whole-plan'; options?: { workoutPlanStore?: any; onTemplateUpdate?: () => Promise<void>; onCacheCleared?: () => void; }; }) => scheduledExerciseService.rescheduleExercise(exerciseId, newDate, scope, options),
    onSuccess: (_, { exerciseId, newDate, scope, options }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledExercises.all(), exact: false });
      if (scope === 'whole-plan') {
        queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans.all() });
      }
      if (options?.onCacheCleared) options.onCacheCleared();
    },
  });
};

export const useCheckExerciseGeneration = () => {
  return useQuery({
    queryKey: queryKeys.exerciseGeneration.needsGeneration(),
    queryFn: async () => {
      const response = await fetch('/api/scheduled-exercises/needs-generation');
      if (!response.ok) throw new Error('Failed to check exercise generation');
      return await response.json();
    },
    enabled: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useGenerateExercises = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workoutPlanId, minDaysInAdvance }: { workoutPlanId: string; minDaysInAdvance: number }) => fetch('/api/workout-plans/ensure-exercises-generated', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workoutPlanId, minDaysInAdvance }), }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exerciseGeneration.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledExercises.all(), exact: false });
    },
  });
};
