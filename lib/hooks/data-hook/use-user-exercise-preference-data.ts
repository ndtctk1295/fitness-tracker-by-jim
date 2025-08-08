import { useMemo } from 'react';
import { 
  useUserExercisePreferences,
  useCreateUserExercisePreference,
  useUpdateUserExercisePreference,
  useDeleteUserExercisePreference,
  useToggleUserExerciseFavorite,
  useMarkUserExerciseAsUsed,
  useUserExercisePreferenceByExerciseId
} from '@/lib/utils/queries/user-exercise-preferences-queries';

// Enhanced selector interface for better TypeScript support
interface UserExercisePreferenceSelectors {
  // Filter selectors
  byStatus: (status: 'favorite') => any[];
  favoriteExercises: any[];
  
  // Utility selectors
  findById: (id: string) => any | undefined;
  findByExerciseId: (exerciseId: string) => any | undefined;
  sortedByAddedDate: (ascending?: boolean) => any[];
  sortedByLastUsed: (ascending?: boolean) => any[];
  
  // Status selectors
  hasPreference: (exerciseId: string) => boolean;
  getExerciseStatus: (exerciseId: string) => 'favorite' | null;
  isFavorite: (exerciseId: string) => boolean;
  
  // Recently used
  recentlyUsed: any[];
  
  // Stats
  stats: {
    total: number;
    totalFavorites: number;
    totalWithCustomSettings: number;
    recentlyUsedCount: number;
  };
}

/**
 * Core hook for user exercise preference data with comprehensive selector patterns
 * Eliminates manual memoization in components through optimized, cached selectors
 * 
 * @returns Complete data interface with preferences, selectors, and actions
 */
export function useUserExercisePreferenceData() {
  // Direct React Query usage - no store wrapper needed
  const { 
    data: preferences = [], 
    isLoading, 
    error, 
    refetch 
  } = useUserExercisePreferences();

  // Mutations
  const createMutation = useCreateUserExercisePreference();
  const updateMutation = useUpdateUserExercisePreference();
  const deleteMutation = useDeleteUserExercisePreference();
  const toggleFavoriteMutation = useToggleUserExerciseFavorite();
  const markAsUsedMutation = useMarkUserExerciseAsUsed();

  // Enhanced selectors with comprehensive memoization
  const selectors: UserExercisePreferenceSelectors = useMemo(() => {
    // Filter functions
    const byStatus = (status: 'favorite') => 
      preferences.filter((pref: any) => pref.status === status);
    
    const favoriteExercises = byStatus('favorite');
    
    // Utility functions
    const findById = (id: string) => 
      preferences.find((pref: any) => pref.id === id);
    
    const findByExerciseId = (exerciseId: string) => 
      preferences.find((pref: any) => pref.exerciseId === exerciseId);
    
    const sortedByAddedDate = (ascending = false) => {
      return [...preferences].sort((a, b) => {
        const dateA = new Date(a.addedAt || 0).getTime();
        const dateB = new Date(b.addedAt || 0).getTime();
        return ascending ? dateA - dateB : dateB - dateA;
      });
    };
    
    const sortedByLastUsed = (ascending = false) => {
      return [...preferences]
        .filter(pref => pref.lastUsed)
        .sort((a, b) => {
          const dateA = new Date(a.lastUsed || 0).getTime();
          const dateB = new Date(b.lastUsed || 0).getTime();
          return ascending ? dateA - dateB : dateB - dateA;
        });
    };

    // Status functions
    const hasPreference = (exerciseId: string) =>
      preferences.some((pref: any) => pref.exerciseId === exerciseId);
    
    const getExerciseStatus = (exerciseId: string) => {
      const preference = findByExerciseId(exerciseId);
      return preference ? preference.status : null;
    };
    
    const isFavorite = (exerciseId: string) =>
      getExerciseStatus(exerciseId) === 'favorite';

    // Recently used (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentlyUsed = preferences.filter((pref: any) => 
      pref.lastUsed && new Date(pref.lastUsed) > thirtyDaysAgo
    );

    // Stats computation
    const stats = {
      total: preferences.length,
      totalFavorites: favoriteExercises.length,
      totalWithCustomSettings: preferences.filter((pref: any) => pref.customSettings).length,
      recentlyUsedCount: recentlyUsed.length,
    };

    return {
      // Filter functions
      byStatus,
      favoriteExercises,
      
      // Utility functions
      findById,
      findByExerciseId,
      sortedByAddedDate,
      sortedByLastUsed,
      
      // Status functions
      hasPreference,
      getExerciseStatus,
      isFavorite,
      
      // Recently used
      recentlyUsed,
      
      // Stats
      stats,
    };
  }, [preferences]);

  return {
    // Core data
    preferences,
    isLoading,
    error: error?.message || null,
    
    // Enhanced selectors (main feature)
    selectors,
    
    // Loading states for mutations
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleFavoriteMutation.isPending,
    isMarkingAsUsed: markAsUsedMutation.isPending,
    
    // Actions - direct mutation access
    refetch,
    
    // CRUD operations
    createPreference: createMutation.mutateAsync,
    updatePreference: (exerciseId: string, data: any) => 
      updateMutation.mutateAsync({ exerciseId, data }),
    deletePreference: deleteMutation.mutateAsync,
    toggleFavorite: (exerciseId: string, currentStatus: 'favorite' | null) => 
      toggleFavoriteMutation.mutateAsync({ exerciseId, currentStatus }),
    markAsUsed: markAsUsedMutation.mutateAsync,
    
    // Legacy compatibility functions (use selectors instead)
    getFavoriteExercises: () => selectors.favoriteExercises,
    getPreferenceByExerciseId: (exerciseId: string) => selectors.findByExerciseId(exerciseId),
    hasPreference: (exerciseId: string) => selectors.hasPreference(exerciseId),
    getExerciseStatus: (exerciseId: string) => selectors.getExerciseStatus(exerciseId),
    isFavorite: (exerciseId: string) => selectors.isFavorite(exerciseId),
  };
}

/**
 * Hook for user exercise preference mutations only
 * Useful when you only need to modify preferences without fetching data
 * 
 * @returns Mutation functions and their loading states
 */
export function useUserExercisePreferenceMutations() {
  const createMutation = useCreateUserExercisePreference();
  const updateMutation = useUpdateUserExercisePreference();
  const deleteMutation = useDeleteUserExercisePreference();
  const toggleFavoriteMutation = useToggleUserExerciseFavorite();
  const markAsUsedMutation = useMarkUserExerciseAsUsed();

  return {
    // Core mutations
    createPreference: createMutation.mutateAsync,
    updatePreference: (exerciseId: string, data: any) => 
      updateMutation.mutateAsync({ exerciseId, data }),
    deletePreference: deleteMutation.mutateAsync,
    toggleFavorite: (exerciseId: string, currentStatus: 'favorite' | null) => 
      toggleFavoriteMutation.mutateAsync({ exerciseId, currentStatus }),
    markAsUsed: markAsUsedMutation.mutateAsync,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleFavoriteMutation.isPending,
    isMarkingAsUsed: markAsUsedMutation.isPending,
  };
}

/**
 * Hook to get a specific user exercise preference by exercise ID
 * 
 * @param exerciseId - The exercise ID
 * @returns Preference data and loading state
 */
export function useUserExercisePreferenceByExerciseIdData(exerciseId: string) {
  const preferenceQuery = useUserExercisePreferenceByExerciseId(exerciseId);
  return {
    preference: preferenceQuery.data,
    isLoading: preferenceQuery.isLoading,
    error: (preferenceQuery as any).error?.message || null,
    refetch: preferenceQuery.refetch,
    isFavorite: preferenceQuery.data?.status === 'favorite',
    hasPreference: !!preferenceQuery.data,
  };
}
