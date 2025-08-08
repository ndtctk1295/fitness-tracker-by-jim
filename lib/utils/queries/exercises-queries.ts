import { useQuery } from '@tanstack/react-query';
import { Exercise } from '@/lib/types';
import { queryKeys } from './query-keys';

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

export const useExercises = (filters: {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  muscleGroup?: string;
  equipment?: string;
  activeOnly?: boolean;
} = { activeOnly: true }) => {
  const normalizedFilters = {
    difficulty: filters.difficulty || null,
    muscleGroup: filters.muscleGroup || null,
    equipment: filters.equipment || null,
    activeOnly: filters.activeOnly ?? true,
  };

  return useQuery({
    queryKey: queryKeys.exercises.list(normalizedFilters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.muscleGroup) params.append('muscleGroup', filters.muscleGroup);
      if (filters.equipment) params.append('equipment', filters.equipment);
      params.append('activeOnly', filters.activeOnly?.toString() || 'true');

      const response = await fetch(`/api/exercises/available?${params.toString()}`, {
        headers: { 'x-client-auth': 'internal-request' },
      });
      if (!response.ok) {
        const basicResponse = await fetch('/api/exercises', {
          headers: { 'x-client-auth': 'internal-request' },
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
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    refetchOnReconnect: false,
    retry: 1,
  });
};
