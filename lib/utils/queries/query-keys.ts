// Centralized query key factories
export const queryKeys = {
  categories: {
    all: () => ['categories'] as const,
  },
  exercises: {
    all: () => ['exercises'] as const,
    lists: () => [...queryKeys.exercises.all(), 'list'] as const,
    list: (filters: any) => [...queryKeys.exercises.lists(), filters] as const,
  },
  workoutPlans: {
    all: () => ['workoutPlans'] as const,
    lists: () => [...queryKeys.workoutPlans.all(), 'list'] as const,
    list: () => [...queryKeys.workoutPlans.lists()] as const,
    details: () => [...queryKeys.workoutPlans.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.workoutPlans.details(), id] as const,
    active: () => [...queryKeys.workoutPlans.all(), 'active'] as const,
  },
  scheduledExercises: {
    all: () => ['scheduledExercises'] as const,
    lists: () => [...queryKeys.scheduledExercises.all(), 'list'] as const,
    list: (filters: { startDate?: string; endDate?: string; date?: string }) => [
      ...queryKeys.scheduledExercises.lists(),
      filters,
    ] as const,
    byDate: (date: string) => [...queryKeys.scheduledExercises.all(), 'date', date] as const,
    byRange: (startDate: string, endDate: string) => [
      ...queryKeys.scheduledExercises.all(),
      'range',
      startDate,
      endDate,
    ] as const,
  },
  exerciseGeneration: {
    all: () => ['exerciseGeneration'] as const,
    needsGeneration: () => [...queryKeys.exerciseGeneration.all(), 'needs'] as const,
  },
  userExercisePreferences: {
    all: () => ['userExercisePreferences'] as const,
    lists: () => [...queryKeys.userExercisePreferences.all(), 'list'] as const,
    list: () => [...queryKeys.userExercisePreferences.lists()] as const,
    byStatus: (status: string) => [...queryKeys.userExercisePreferences.all(), 'status', status] as const,
    byExerciseId: (exerciseId: string) => [...queryKeys.userExercisePreferences.all(), 'exercise', exerciseId] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
