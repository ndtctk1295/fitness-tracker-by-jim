import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutPlanService } from '@/lib/services/clients-service';
import { WorkoutPlan } from '@/lib/types';
import { queryKeys } from './query-keys';

const apiToStoreExerciseTemplate = (et: any) => ({
  exerciseId: et.exerciseId,
  sets: et.sets,
  reps: et.reps,
  weight: et.weight,
  duration: et.duration,
  weightPlates: et.weightPlates,
  notes: et.notes,
  orderIndex: et.orderIndex ?? 0,
  categoryId: et.categoryId ?? '',
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

export const useWorkoutPlans = () => {
  return useQuery({
    queryKey: queryKeys.workoutPlans.list(),
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
    queryKey: queryKeys.workoutPlans.active(),
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
    queryKey: queryKeys.workoutPlans.detail(id),
    queryFn: async () => {
      const plan = await workoutPlanService.getById(id);
      return apiToStoreWorkoutPlan(plan);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateWorkoutPlan = () => {
  const queryClient = useQueryClient();
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans.active() });
    },
  });
};

export const useUpdateWorkoutPlan = () => {
  const queryClient = useQueryClient();
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
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans.active() });
      if (updatedPlan && updatedPlan._id) {
        queryClient.setQueryData(
          queryKeys.workoutPlans.detail(updatedPlan._id),
          apiToStoreWorkoutPlan(updatedPlan)
        );
      }
    },
  });
};

export const useDeleteWorkoutPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutPlanService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: queryKeys.workoutPlans.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans.active() });
    },
  });
};

export const useDuplicateWorkoutPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName?: string }) => workoutPlanService.duplicate(id, newName),
    onSuccess: (duplicatedPlan) => {
      const storePlan = apiToStoreWorkoutPlan(duplicatedPlan);
      queryClient.setQueryData(queryKeys.workoutPlans.detail(storePlan.id!), storePlan);
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans.lists() });
    },
  });
};

export const useActivateWorkoutPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutPlanService.activate(id),
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans.active() });
      if (result.success && result.data) {
        queryClient.invalidateQueries({ queryKey: queryKeys.scheduledExercises.all(), exact: false });
      }
    },
  });
};

export const useDeactivateWorkoutPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutPlanService.deactivate(id),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans.active() });
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduledExercises.all(), exact: false });
    },
  });
};
