import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userExercisePreferenceService } from '@/lib/services/clients-service/user-exercise-preference-service';
import { queryKeys } from './query-keys';

const apiToStoreUserExercisePreference = (preference: any) => ({
  id: preference._id || preference.id,
  userId: preference.userId,
  exerciseId: preference.exerciseId._id || preference.exerciseId,
  status: preference.status,
  notes: preference.notes,
  customSettings: preference.customSettings,
  addedAt: preference.addedAt,
  lastUsed: preference.lastUsed,
  exercise: preference.exerciseId && typeof preference.exerciseId === 'object' ? {
    id: preference.exerciseId._id || preference.exerciseId.id,
    name: preference.exerciseId.name,
    description: preference.exerciseId.description,
    imageUrl: preference.exerciseId.imageUrl,
    difficulty: preference.exerciseId.difficulty,
    muscleGroups: preference.exerciseId.muscleGroups,
    equipment: preference.exerciseId.equipment,
  } : undefined,
});

export const useUserExercisePreferences = () => {
  return useQuery({
    queryKey: queryKeys.userExercisePreferences.list(),
    queryFn: async () => {
      const preferences = await userExercisePreferenceService.getAll();
      return preferences.map(apiToStoreUserExercisePreference);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useUserExercisePreferenceByExerciseId = (exerciseId: string) => {
  return useQuery({
    queryKey: queryKeys.userExercisePreferences.byExerciseId(exerciseId),
    queryFn: async () => {
      try {
        const preference = await userExercisePreferenceService.getByExerciseId(exerciseId);
        return preference ? apiToStoreUserExercisePreference(preference) : null;
      } catch (error: any) {
        if (error.status === 404) return null;
        throw error;
      }
    },
    enabled: !!exerciseId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateUserExercisePreference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (preferenceData: { exerciseId: string; status: 'favorite'; notes?: string; customSettings?: any; }) => userExercisePreferenceService.create(preferenceData),
    onSuccess: (createdPreference) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userExercisePreferences.all() });
      if (createdPreference) {
        const exerciseId = typeof createdPreference.exerciseId === 'string' ? createdPreference.exerciseId : createdPreference.exerciseId._id;
        queryClient.setQueryData(queryKeys.userExercisePreferences.byExerciseId(exerciseId), apiToStoreUserExercisePreference(createdPreference));
      }
    },
  });
};

export const useUpdateUserExercisePreference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ exerciseId, data }: { exerciseId: string; data: { status?: 'favorite'; notes?: string; customSettings?: any; } }) => userExercisePreferenceService.update(exerciseId, data),
    onSuccess: (updatedPreference, { exerciseId }) => {
      if (updatedPreference) {
        queryClient.setQueryData(queryKeys.userExercisePreferences.byExerciseId(exerciseId), apiToStoreUserExercisePreference(updatedPreference));
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.userExercisePreferences.all() });
    },
  });
};

export const useDeleteUserExercisePreference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exerciseId: string) => userExercisePreferenceService.delete(exerciseId),
    onSuccess: (_, exerciseId) => {
      queryClient.setQueryData(queryKeys.userExercisePreferences.byExerciseId(exerciseId), null);
      queryClient.invalidateQueries({ queryKey: queryKeys.userExercisePreferences.all() });
    },
  });
};

export const useToggleUserExerciseFavorite = () => {
  const queryClient = useQueryClient();
  const createMutation = useCreateUserExercisePreference();
  const deleteMutation = useDeleteUserExercisePreference();
  return useMutation({
    mutationFn: async ({ exerciseId, currentStatus }: { exerciseId: string; currentStatus: 'favorite' | null; }) => {
      if (currentStatus === 'favorite') {
        await deleteMutation.mutateAsync(exerciseId);
        return { action: 'removed', exerciseId };
      } else {
        await createMutation.mutateAsync({ exerciseId, status: 'favorite' });
        return { action: 'added', exerciseId };
      }
    },
  });
};

export const useMarkUserExerciseAsUsed = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exerciseId: string) => userExercisePreferenceService.markAsUsed(exerciseId),
    onSuccess: (_, exerciseId) => {
      queryClient.setQueryData(queryKeys.userExercisePreferences.byExerciseId(exerciseId), (old: any) => old ? { ...old, lastUsed: new Date().toISOString() } : old);
      queryClient.invalidateQueries({ queryKey: queryKeys.userExercisePreferences.all() });
    },
  });
};
