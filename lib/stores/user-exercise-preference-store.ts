'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userExercisePreferenceService } from '@/lib/services/user-exercise-preference-service';

// Store-specific types for frontend compatibility
interface StoreUserExercisePreference {
  id: string;
  userId: string;
  exerciseId: string;
  status: 'favorite';
  notes?: string;
  customSettings?: {
    sets?: number;
    reps?: number;
    weight?: number;
    restTime?: number;
    duration?: number;
  };
  addedAt: string;
  lastUsed?: string;
  // Populated exercise data
  exercise?: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    muscleGroups?: string[];
    equipment?: string[];
  };
}

// User Exercise Preference store state interface
interface UserExercisePreferenceStoreState {
  // Data
  preferences: StoreUserExercisePreference[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Initialization state
  initialized: boolean;

  // Methods
  clearErrors: () => void;
  clearCache: () => void;

  // Data fetching methods
  initializeStore: () => Promise<void>;
  refreshPreferences: () => Promise<void>;
  forceRefresh: () => Promise<void>;
    // Preference management methods
  addPreference: (exerciseId: string, status: 'favorite', notes?: string, customSettings?: any) => Promise<void>;
  updatePreference: (exerciseId: string, updates: Partial<Omit<StoreUserExercisePreference, 'id' | 'userId' | 'exerciseId' | 'addedAt'>>) => Promise<void>;
  removePreference: (exerciseId: string) => Promise<void>;
  markAsUsed: (exerciseId: string) => Promise<void>;
  
  // Status-specific methods
  toggleFavorite: (exerciseId: string) => Promise<void>;
  
  // Filtering methods
  getPreferencesByStatus: (status: 'favorite') => StoreUserExercisePreference[];
  getFavoriteExercises: () => StoreUserExercisePreference[];
  
  // Utility methods
  getPreferenceByExerciseId: (exerciseId: string) => StoreUserExercisePreference | undefined;
  hasPreference: (exerciseId: string) => boolean;
  getExerciseStatus: (exerciseId: string) => 'favorite' | null;
}

// Helper function to convert API response to store format
const convertToStoreFormat = (apiPreference: any): StoreUserExercisePreference => ({
  id: apiPreference._id || apiPreference.id,
  userId: apiPreference.userId,
  exerciseId: apiPreference.exerciseId._id || apiPreference.exerciseId,
  status: apiPreference.status,
  notes: apiPreference.notes,
  customSettings: apiPreference.customSettings,
  addedAt: apiPreference.addedAt,
  lastUsed: apiPreference.lastUsed,
  exercise: apiPreference.exerciseId && typeof apiPreference.exerciseId === 'object' ? {
    id: apiPreference.exerciseId._id || apiPreference.exerciseId.id,
    name: apiPreference.exerciseId.name,
    description: apiPreference.exerciseId.description,
    imageUrl: apiPreference.exerciseId.imageUrl,
    difficulty: apiPreference.exerciseId.difficulty,
    muscleGroups: apiPreference.exerciseId.muscleGroups,
    equipment: apiPreference.exerciseId.equipment,
  } : undefined,
});

// Create the store
export const useUserExercisePreferenceStore = create<UserExercisePreferenceStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      preferences: [],
      isLoading: false,
      error: null,
      initialized: false,

      // Clear errors
      clearErrors: () => set({ error: null }),

      // Clear localStorage cache and reset state
      clearCache: () => {
        set({ 
          preferences: [], 
          initialized: false, 
          isLoading: false, 
          error: null 
        });
        // Clear localStorage for this store
        localStorage.removeItem('user-exercise-preference-store');
      },

      // Initialize store - always fetch fresh data from server
      initializeStore: async () => {
        const state = get();
        
        // Skip if already loading to prevent duplicate requests
        if (state.isLoading) {
          return;
        }

        set({ isLoading: true, error: null });
        
        try {
          await get().refreshPreferences();
          set({ initialized: true });
        } catch (error: any) {
          console.error('Failed to initialize user exercise preference store:', error);
          set({ error: error.message || 'Failed to initialize preferences' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Refresh preferences from API
      refreshPreferences: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const apiPreferences = await userExercisePreferenceService.getAll();
          const storePreferences = apiPreferences.map(convertToStoreFormat);
          set({ preferences: storePreferences });
        } catch (error: any) {
          console.error('Failed to refresh preferences:', error);
          set({ error: error.message || 'Failed to refresh preferences' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Force refresh - bypasses initialization check and always fetches fresh data
      forceRefresh: async () => {
        set({ initialized: false });
        await get().initializeStore();
      },      // Add new preference
      addPreference: async (exerciseId: string, status: 'favorite', notes?: string, customSettings?: any) => {
        set({ isLoading: true, error: null });
        
        try {
          const apiPreference = await userExercisePreferenceService.create({
            exerciseId,
            status,
            notes,
            customSettings
          });
          const storePreference = convertToStoreFormat(apiPreference);
          
          set(state => ({
            preferences: [...state.preferences, storePreference]
          }));
        } catch (error: any) {
          console.error('Failed to add preference:', error);
          set({ error: error.message || 'Failed to add preference' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Update existing preference
      updatePreference: async (exerciseId: string, updates: Partial<Omit<StoreUserExercisePreference, 'id' | 'userId' | 'exerciseId' | 'addedAt'>>) => {
        set({ isLoading: true, error: null });
        
        try {
          const apiPreference = await userExercisePreferenceService.update(exerciseId, updates);
          const storePreference = convertToStoreFormat(apiPreference);
          
          set(state => ({
            preferences: state.preferences.map(pref => 
              pref.exerciseId === exerciseId ? storePreference : pref
            )
          }));
        } catch (error: any) {
          console.error('Failed to update preference:', error);
          set({ error: error.message || 'Failed to update preference' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Remove preference
      removePreference: async (exerciseId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await userExercisePreferenceService.delete(exerciseId);
          
          set(state => ({
            preferences: state.preferences.filter(pref => pref.exerciseId !== exerciseId)
          }));
        } catch (error: any) {
          console.error('Failed to remove preference:', error);
          set({ error: error.message || 'Failed to remove preference' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Mark as used
      markAsUsed: async (exerciseId: string) => {
        try {
          await userExercisePreferenceService.markAsUsed(exerciseId);
          
          // Update local state with current timestamp
          set(state => ({
            preferences: state.preferences.map(pref => 
              pref.exerciseId === exerciseId 
                ? { ...pref, lastUsed: new Date().toISOString() }
                : pref
            )
          }));
        } catch (error: any) {
          console.error('Failed to mark as used:', error);
          set({ error: error.message || 'Failed to mark as used' });
          throw error;
        }
      },      // Status-specific methods
      toggleFavorite: async (exerciseId: string) => {
        const preference = get().getPreferenceByExerciseId(exerciseId);
        
        if (!preference) {
          // Add as favorite if doesn't exist
          await get().addPreference(exerciseId, 'favorite');
        } else if (preference.status === 'favorite') {
          // Remove if currently favorite
          await get().removePreference(exerciseId);
        } else {
          // Update to favorite if exists with different status
          await get().updatePreference(exerciseId, { status: 'favorite' });
        }
      },

      // Filtering methods
      getPreferencesByStatus: (status: 'favorite') => {
        return get().preferences.filter(pref => pref.status === status);
      },

      getFavoriteExercises: () => get().getPreferencesByStatus('favorite'),

      // Utility methods
      getPreferenceByExerciseId: (exerciseId: string) => {
        return get().preferences.find(pref => pref.exerciseId === exerciseId);
      },

      hasPreference: (exerciseId: string) => {
        return get().preferences.some(pref => pref.exerciseId === exerciseId);
      },

      getExerciseStatus: (exerciseId: string) => {
        const preference = get().getPreferenceByExerciseId(exerciseId);
        return preference ? preference.status : null;
      },
    }),
    {
      name: 'user-exercise-preference-store',
      partialize: (state) => ({
        preferences: state.preferences,
        // Don't persist initialized flag - always fetch fresh data on app load
      }),
    }
  )
);

export default useUserExercisePreferenceStore;
