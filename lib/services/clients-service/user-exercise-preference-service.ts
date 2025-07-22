import axios from 'axios';

export interface UserExercisePreference {
  _id: string;
  userId: string;
  exerciseId: {
    _id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    muscleGroups: string[];
    equipment?: string[];
  };  status: 'favorite';
  addedAt: string;
  lastUsed?: string;
  notes?: string;
  customSettings?: {
    defaultSets?: number;
    defaultReps?: number;
    defaultWeight?: number;
    restTime?: number;
    progressNotes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserExercisePreference {
  exerciseId: string;
  status: 'favorite';
  notes?: string;
  customSettings?: {
    defaultSets?: number;
    defaultReps?: number;
    defaultWeight?: number;
    restTime?: number;
    progressNotes?: string;
  };
}

export interface UpdateUserExercisePreference {
  status?: 'favorite';
  notes?: string;
  customSettings?: {
    defaultSets?: number;
    defaultReps?: number;
    defaultWeight?: number;
    restTime?: number;
    progressNotes?: string;
  };
}

export const userExercisePreferenceService = {
  /**
   * Get all user exercise preferences
   */  getAll: async (options: {
    status?: 'favorite';
    limit?: number;
  } = {}): Promise<UserExercisePreference[]> => {
    try {
      const params = new URLSearchParams();
      if (options.status) params.append('status', options.status);
      if (options.limit) params.append('limit', options.limit.toString());
      
      const response = await axios.get(`/api/user-exercises?${params.toString()}`, { 
        withCredentials: true 
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user exercise preferences:', error);
      throw error;
    }
  },
  /**
   * Get user's favorite exercises
   */
  getFavoriteExercises: async (): Promise<UserExercisePreference[]> => {
    return userExercisePreferenceService.getAll({ status: 'favorite' });
  },

  /**
   * Check if user has preference for specific exercise
   */
  getByExerciseId: async (exerciseId: string): Promise<UserExercisePreference | null> => {
    try {
      const response = await axios.get(`/api/user-exercises/${exerciseId}`, { 
        withCredentials: true 
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error(`Failed to fetch user exercise preference for ${exerciseId}:`, error);
      throw error;
    }
  },

  /**
   * Add exercise to user preferences
   */
  create: async (data: CreateUserExercisePreference): Promise<UserExercisePreference> => {
    try {
      const response = await axios.post('/api/user-exercises', data, { 
        withCredentials: true 
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create user exercise preference:', error);
      throw error;
    }
  },

  /**
   * Add exercise to favorites
   */
  addToFavorites: async (exerciseId: string): Promise<UserExercisePreference> => {
    return userExercisePreferenceService.create({
      exerciseId,
      status: 'favorite'
    });
  },
  /**
   * Set exercise as favorite
   */
  setAsFavorite: async (exerciseId: string): Promise<UserExercisePreference> => {
    return userExercisePreferenceService.create({
      exerciseId,
      status: 'favorite'
    });
  },

  /**
   * Update user exercise preference
   */
  update: async (
    exerciseId: string, 
    updates: UpdateUserExercisePreference
  ): Promise<UserExercisePreference> => {
    try {
      const response = await axios.put(`/api/user-exercises/${exerciseId}`, updates, { 
        withCredentials: true 
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to update user exercise preference ${exerciseId}:`, error);
      throw error;
    }
  },
  /**
   * Update exercise status to favorite
   */
  updateStatus: async (
    exerciseId: string, 
    status: 'favorite'
  ): Promise<UserExercisePreference> => {
    return userExercisePreferenceService.update(exerciseId, { status });
  },

  /**
   * Update custom settings for exercise
   */
  updateSettings: async (
    exerciseId: string, 
    customSettings: {
      defaultSets?: number;
      defaultReps?: number;
      defaultWeight?: number;
      restTime?: number;
      progressNotes?: string;
    }
  ): Promise<UserExercisePreference> => {
    return userExercisePreferenceService.update(exerciseId, { customSettings });
  },

  /**
   * Remove exercise from user preferences
   */
  delete: async (exerciseId: string): Promise<void> => {
    try {
      await axios.delete(`/api/user-exercises/${exerciseId}`, { 
        withCredentials: true 
      });
    } catch (error) {
      console.error(`Failed to delete user exercise preference ${exerciseId}:`, error);
      throw error;
    }
  },

  /**
   * Remove exercise from favorites
   */
  removeFromFavorites: async (exerciseId: string): Promise<void> => {
    return userExercisePreferenceService.delete(exerciseId);
  },

  /**
   * Mark exercise as used (update lastUsed timestamp)
   */
  markAsUsed: async (exerciseId: string): Promise<void> => {
    try {
      await axios.post(`/api/user-exercises/${exerciseId}/mark-used`, {}, { 
        withCredentials: true 
      });
    } catch (error) {
      console.error(`Failed to mark exercise ${exerciseId} as used:`, error);
      throw error;
    }
  },

  /**
   * Toggle exercise favorite status
   */
  toggleFavorite: async (exerciseId: string): Promise<UserExercisePreference | null> => {
    try {
      // First check if preference exists
      const existing = await userExercisePreferenceService.getByExerciseId(exerciseId);
      
      if (existing) {
        if (existing.status === 'favorite') {
          // Remove from favorites
          await userExercisePreferenceService.delete(exerciseId);
          return null;
        } else {
          // Update status to favorite
          return await userExercisePreferenceService.updateStatus(exerciseId, 'favorite');
        }
      } else {
        // Add to favorites
        return await userExercisePreferenceService.addToFavorites(exerciseId);
      }
    } catch (error) {
      console.error(`Failed to toggle favorite for exercise ${exerciseId}:`, error);
      throw error;
    }
  }
};

// Re-export types for external consumption
export type { 
  UserExercisePreference as UserExercisePreferenceType
};
