
// lib/queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService, exerciseService, workoutPlanService, scheduledExerciseService } from '@/lib/services/clients-service';
import { Category, Exercise, WorkoutPlan, ScheduledExercise } from '@/lib/types';

// Utility to convert API data to store format
const apiToStoreCategory = (category: Category) => ({
  id: category._id,
  name: category.name,
  color: category.color || '#6366F1',
  createdBy: category.createdBy,
  updatedBy: category.updatedBy,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});

const apiToStoreExercise = (exercise: Exercise) => ({
  id: exercise._id,
  name: exercise.name,
  categoryId: exercise.categoryId,
  description: exercise.description,
  imageUrl: exercise.imageUrl,
  difficulty: exercise.difficulty,
  muscleGroups: exercise.muscleGroups,
  equipment: exercise.equipment,
  instructions: exercise.instructions,
  tips: exercise.tips,
  isActive: exercise.isActive,
  userStatus: null,
  userNotes: undefined,
  userCustomSettings: undefined,
  lastUsed: undefined,
  createdBy: exercise.createdBy,
  updatedBy: exercise.updatedBy,
  createdAt: exercise.createdAt,
  updatedAt: exercise.updatedAt,
});

// Deep conversion for DayTemplate and ExerciseTemplate to ensure type compatibility
const apiToStoreExerciseTemplate = (et: any) => ({
  exerciseId: et.exerciseId,
  sets: et.sets,
  reps: et.reps,
  weight: et.weight,
  duration: et.duration,
  weightPlates: et.weightPlates,
  notes: et.notes,
  orderIndex: et.orderIndex ?? 0,
  categoryId: et.categoryId ?? '', // fallback for missing property
});

const apiToStoreDayTemplate = (dt: any) => ({
  dayOfWeek: dt.dayOfWeek,
  name: dt.name,
  exerciseTemplates: Array.isArray(dt.exerciseTemplates)
    ? dt.exerciseTemplates.map(apiToStoreExerciseTemplate)
    : [],
});

const apiToStoreWorkoutPlan = (plan: any) => ({
  id: plan._id || plan.id || '',
  userId: plan.userId,
  name: plan.name,
  description: plan.description,
  level: plan.level,
  duration: plan.duration,
  isActive: plan.isActive,
  mode: plan.mode,
  startDate: plan.startDate ? new Date(plan.startDate) : undefined,
  endDate: plan.endDate ? new Date(plan.endDate) : undefined,
  weeklyTemplate: Array.isArray(plan.weeklyTemplate)
    ? plan.weeklyTemplate.map(apiToStoreDayTemplate)
    : [],
  createdBy: plan.createdBy,
  updatedBy: plan.updatedBy,
  createdAt: plan.createdAt ? new Date(plan.createdAt) : undefined,
  updatedAt: plan.updatedAt ? new Date(plan.updatedAt) : undefined,
});

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

// Categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const categories = await categoryService.getAll();
      return categories.map(apiToStoreCategory);
    },
    staleTime: Infinity, // Never consider data stale
    gcTime: Infinity, // Never garbage collect
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    refetchOnReconnect: false,
    retry: 1,
  });
};

// Exercises
export const useExercises = (filters: {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  muscleGroup?: string;
  equipment?: string;
  activeOnly?: boolean;
} = { activeOnly: true }) => {
  // Create a stable query key by sorting and normalizing the filters
  const normalizedFilters = {
    difficulty: filters.difficulty || null,
    muscleGroup: filters.muscleGroup || null,
    equipment: filters.equipment || null,
    activeOnly: filters.activeOnly ?? true,
  };
  
  return useQuery({
    queryKey: ['exercises', normalizedFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.muscleGroup) params.append('muscleGroup', filters.muscleGroup);
      if (filters.equipment) params.append('equipment', filters.equipment);
      params.append('activeOnly', filters.activeOnly?.toString() || 'true');

      const response = await fetch(`/api/exercises/available?${params.toString()}`, {
        headers: {
          'x-client-auth': 'internal-request',
        },
      });
      if (!response.ok) {
        const basicResponse = await fetch('/api/exercises', {
          headers: {
            'x-client-auth': 'internal-request',
          },
        });
        if (!basicResponse.ok) {
          throw new Error(`Failed to fetch exercises: ${basicResponse.status}`);
        }
        const exercises = await basicResponse.json();
        return exercises.map(apiToStoreExercise);
      }
      const data = await response.json();
      return data.exercises.map(apiToStoreExercise);
    },
    staleTime: Infinity, // Never consider data stale
    gcTime: Infinity, // Never garbage collect
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    refetchOnReconnect: false,
    retry: 1,
  });
};

// Workout Plans
export const useWorkoutPlans = () => {
  return useQuery({
    queryKey: ['workoutPlans'],
    queryFn: async () => {
      const plans = await workoutPlanService.getAll();
      return plans.map(apiToStoreWorkoutPlan);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useActiveWorkoutPlan = () => {
  return useQuery({
    queryKey: ['workoutPlans', 'active'],
    queryFn: async () => {
      const plan = await workoutPlanService.getActive();
      return plan ? apiToStoreWorkoutPlan(plan) : null;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useWorkoutPlanById = (id: string) => {
  return useQuery({
    queryKey: ['workoutPlans', id],
    queryFn: async () => {
      const plan = await workoutPlanService.getById(id);
      return apiToStoreWorkoutPlan(plan);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Mutations for Workout Plans
export const useCreateWorkoutPlan = () => {
  const queryClient = useQueryClient();
  // Convert frontend planData to API/service format
  const toApiDayTemplate = (dt: any) => ({
    dayOfWeek: dt.dayOfWeek,
    name: dt.name,
    exerciseTemplates: Array.isArray(dt.exerciseTemplates)
      ? dt.exerciseTemplates.map((et: any) => ({
          exerciseId: et.exerciseId,
          sets: et.sets,
          reps: et.reps,
          weight: et.weight,
          duration: et.duration,
          weightPlates: et.weightPlates,
          notes: et.notes,
          orderIndex: et.orderIndex ?? 0,
        }))
      : [],
  });

  return useMutation({
    mutationFn: (planData: Omit<WorkoutPlan, '_id' | 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const apiPlanData = {
        ...planData,
        weeklyTemplate: Array.isArray(planData.weeklyTemplate)
          ? planData.weeklyTemplate.map(toApiDayTemplate)
          : [],
      };
      return workoutPlanService.create(apiPlanData);
    },
    onSuccess: (newPlan) => {
      queryClient.invalidateQueries({ queryKey: ['workoutPlans'] });
      queryClient.invalidateQueries({ queryKey: ['workoutPlans', 'active'] });
    },
  });
};

export const useUpdateWorkoutPlan = () => {
  const queryClient = useQueryClient();
  // Convert frontend update data to API/service format
  const toApiDayTemplate = (dt: any) => ({
    dayOfWeek: dt.dayOfWeek,
    name: dt.name,
    exerciseTemplates: Array.isArray(dt.exerciseTemplates)
      ? dt.exerciseTemplates.map((et: any) => ({
          exerciseId: et.exerciseId,
          sets: et.sets,
          reps: et.reps,
          weight: et.weight,
          duration: et.duration,
          weightPlates: et.weightPlates,
          notes: et.notes,
          orderIndex: et.orderIndex ?? 0,
        }))
      : [],
  });

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkoutPlan> }) => {
      const apiUpdateData = {
        ...data,
        weeklyTemplate: Array.isArray(data.weeklyTemplate)
          ? data.weeklyTemplate.map(toApiDayTemplate)
          : undefined,
      };
      return workoutPlanService.update(id, apiUpdateData);
    },
    onSuccess: (updatedPlan) => {
      queryClient.invalidateQueries({ queryKey: ['workoutPlans'] });
      queryClient.invalidateQueries({ queryKey: ['workoutPlans', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['workoutPlans', updatedPlan._id] });
    },
  });
};

export const useDeleteWorkoutPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutPlanService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutPlans'] });
      queryClient.invalidateQueries({ queryKey: ['workoutPlans', 'active'] });
    },
  });
};

export const useActivateWorkoutPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutPlanService.activate(id),
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ['workoutPlans'] });
      queryClient.invalidateQueries({ queryKey: ['workoutPlans', 'active'] });
      if (result.success && result.data) {
        await queryClient.invalidateQueries({ 
          queryKey: ['scheduledExercises'],
          exact: false 
        });
      }
    },
  });
};

export const useDeactivateWorkoutPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutPlanService.deactivate(id),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['workoutPlans'] });
      queryClient.invalidateQueries({ queryKey: ['workoutPlans', 'active'] });
      await queryClient.invalidateQueries({ 
        queryKey: ['scheduledExercises'],
        exact: false 
      });
    },
  });
};

// Scheduled Exercises
export const useScheduledExercises = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['scheduledExercises', { startDate, endDate }],
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
    queryKey: ['scheduledExercises', date],
    queryFn: async () => {
      const exercises = await scheduledExerciseService.getByDate(date);
      return exercises.map(apiToStoreScheduledExercise);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Mutations for Scheduled Exercises
export const useAddScheduledExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exercise: Omit<ScheduledExercise, '_id'>) => scheduledExerciseService.create(exercise),
    onSuccess: async (data, variables) => {
      console.log('🎯 useAddScheduledExercise - Exercise added successfully', { data, variables });
      
      try {
        // Strategy 1: Invalidate ALL scheduledExercises queries regardless of parameters
        await queryClient.invalidateQueries({ 
          queryKey: ['scheduledExercises'],
          exact: false
        });
        console.log('🔄 useAddScheduledExercise - Step 1: General invalidation completed');

        // Strategy 2: Find and manually refetch all active scheduledExercises queries
        const scheduledQueries = queryClient.getQueryCache().findAll({
          predicate: (query) => {
            const queryKey = query.queryKey as any[];
            return queryKey.length > 0 && queryKey[0] === 'scheduledExercises';
          }
        });
        
        console.log('🔄 useAddScheduledExercise - Found scheduledExercises queries:', scheduledQueries.length);
        
        // Strategy 3: Force refetch each found query
        for (const query of scheduledQueries) {
          console.log('🔄 useAddScheduledExercise - Refetching query:', query.queryKey);
          await queryClient.refetchQueries({ queryKey: query.queryKey, exact: true });
        }
        
        console.log('✅ useAddScheduledExercise - All cache operations completed');
        
      } catch (error) {
        console.error('❌ useAddScheduledExercise - Cache invalidation error:', error);
      }
    },
  });
};

export const useUpdateScheduledExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ScheduledExercise> }) =>
      scheduledExerciseService.update(id, data),
    onSuccess: () => {
      // Invalidate all scheduledExercises queries (including those with parameters)
      queryClient.invalidateQueries({ 
        queryKey: ['scheduledExercises'],
        exact: false 
      });
    },
  });
};

export const useDeleteScheduledExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scheduledExerciseService.delete(id),
    onSuccess: () => {
      // Invalidate all scheduledExercises queries (including those with parameters)
      queryClient.invalidateQueries({ 
        queryKey: ['scheduledExercises'],
        exact: false 
      });
    },
  });
};

export const useCheckExerciseGeneration = () => {
  return useQuery({
    queryKey: ['exerciseGeneration'],
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
    mutationFn: ({ workoutPlanId, minDaysInAdvance }: { workoutPlanId: string; minDaysInAdvance: number }) =>
      fetch('/api/workout-plans/ensure-exercises-generated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workoutPlanId, minDaysInAdvance }),
      }).then(res => res.json()),
    onSuccess: () => {
      // Invalidate all scheduledExercises queries (including those with parameters)
      queryClient.invalidateQueries({ 
        queryKey: ['scheduledExercises'],
        exact: false 
      });
    },
  });
};