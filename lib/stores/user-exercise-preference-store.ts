'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Pure UI state interface - only dialog and filter states
interface UserExercisePreferenceStoreState {
  // Dialog states
  isPreferenceDialogOpen: boolean;
  selectedExerciseId: string | null;
  
  // Filter/view states
  viewMode: 'favorites' | 'recent' | 'all';
  sortBy: 'name' | 'dateAdded' | 'lastUsed';
  sortDirection: 'asc' | 'desc';
  
  // Search/filter
  searchQuery: string;
  filterByMuscleGroup: string | null;
  showOnlyRecent: boolean;
  
  // UI actions
  openPreferenceDialog: (exerciseId: string) => void;
  closePreferenceDialog: () => void;
  setViewMode: (mode: 'favorites' | 'recent' | 'all') => void;
  setSortBy: (sort: 'name' | 'dateAdded' | 'lastUsed') => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  setSearchQuery: (query: string) => void;
  setFilterByMuscleGroup: (group: string | null) => void;
  setShowOnlyRecent: (show: boolean) => void;
  
  // Reset UI state
  resetFilters: () => void;
  resetUI: () => void;
}

// Create the pure UI state store
export const useUserExercisePreferenceStore = create<UserExercisePreferenceStoreState>()(
  persist(
    (set, get) => ({
      // Dialog states
      isPreferenceDialogOpen: false,
      selectedExerciseId: null,
      
      // Filter/view states  
      viewMode: 'all',
      sortBy: 'name',
      sortDirection: 'asc',
      
      // Search/filter
      searchQuery: '',
      filterByMuscleGroup: null,
      showOnlyRecent: false,
      
      // UI actions
      openPreferenceDialog: (exerciseId: string) => {
        set({ 
          isPreferenceDialogOpen: true, 
          selectedExerciseId: exerciseId 
        });
      },
      
      closePreferenceDialog: () => {
        set({ 
          isPreferenceDialogOpen: false, 
          selectedExerciseId: null 
        });
      },
      
      setViewMode: (mode: 'favorites' | 'recent' | 'all') => {
        set({ viewMode: mode });
      },
      
      setSortBy: (sort: 'name' | 'dateAdded' | 'lastUsed') => {
        set({ sortBy: sort });
      },
      
      setSortDirection: (direction: 'asc' | 'desc') => {
        set({ sortDirection: direction });
      },
      
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },
      
      setFilterByMuscleGroup: (group: string | null) => {
        set({ filterByMuscleGroup: group });
      },
      
      setShowOnlyRecent: (show: boolean) => {
        set({ showOnlyRecent: show });
      },
      
      // Reset functions
      resetFilters: () => {
        set({
          searchQuery: '',
          filterByMuscleGroup: null,
          showOnlyRecent: false,
          viewMode: 'all',
          sortBy: 'name',
          sortDirection: 'asc',
        });
      },
      
      resetUI: () => {
        set({
          isPreferenceDialogOpen: false,
          selectedExerciseId: null,
          searchQuery: '',
          filterByMuscleGroup: null,
          showOnlyRecent: false,
          viewMode: 'all',
          sortBy: 'name',
          sortDirection: 'asc',
        });
      },
    }),
    {
      name: 'user-exercise-preference-store',
      partialize: (state) => ({
        // Persist UI preferences but not dialog state
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortDirection: state.sortDirection,
        filterByMuscleGroup: state.filterByMuscleGroup,
        showOnlyRecent: state.showOnlyRecent,
        // Don't persist: dialog state, search query, selected exercise
      }),
    }
  )
);

// Backwards compatibility layer for gradual migration
// Components can use these while being migrated to the new data hook pattern
import { 
  useUserExercisePreferenceData,
  useUserExercisePreferenceMutations 
} from '@/lib/hooks/data-hook/use-user-exercise-preference-data';

// /**
//  * @deprecated Use useUserExercisePreferenceData() instead
//  * Legacy wrapper for backwards compatibility during migration
//  */
// export function useLegacyUserExercisePreferenceStore() {
//   const store = useUserExercisePreferenceStore();
//   const data = useUserExercisePreferenceData();
//   const mutations = useUserExercisePreferenceMutations();
  
//   return {
//     // UI state (from store)
//     ...store,
    
//     // Data state (from React Query via data hook)
//     preferences: data.preferences,
//     isLoading: data.isLoading,
//     error: data.error,
//     initialized: !data.isLoading, // Backwards compatibility
    
//     // Data methods (delegated to React Query mutations)
//     clearErrors: () => {}, // No-op - React Query handles error state
//     clearCache: data.refetch,
//     initializeStore: data.refetch,
//     refreshPreferences: data.refetch,
//     forceRefresh: data.refetch,
    
//     // CRUD operations (delegated to mutations)
//     addPreference: async (exerciseId: string, status: 'favorite', notes?: string, customSettings?: any) => {
//       await mutations.createPreference({ exerciseId, status, notes, customSettings });
//     },
//     updatePreference: async (exerciseId: string, updates: any) => {
//       await mutations.updatePreference(exerciseId, updates);
//     },
//     removePreference: mutations.deletePreference,
//     markAsUsed: mutations.markAsUsed,
//     toggleFavorite: async (exerciseId: string) => {
//       const currentStatus = data.selectors.getExerciseStatus(exerciseId);
//       await mutations.toggleFavorite(exerciseId, currentStatus);
//     },
    
//     // Selector methods (delegated to data selectors)
//     getPreferencesByStatus: data.selectors.byStatus,
//     getFavoriteExercises: () => data.selectors.favoriteExercises,
//     getPreferenceByExerciseId: data.selectors.findByExerciseId,
//     hasPreference: data.selectors.hasPreference,
//     getExerciseStatus: data.selectors.getExerciseStatus,
//   };
// }

export default useUserExercisePreferenceStore;
