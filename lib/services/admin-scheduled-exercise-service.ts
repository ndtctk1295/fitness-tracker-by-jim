import axios from 'axios';
import { ScheduledExercise } from './scheduled-exercise-service';

export interface AdminScheduledExercise extends ScheduledExercise {
  userName: string;
}

export const adminScheduledExerciseService = {
  /**
   * Get all scheduled exercises for all users (admin only)
   */
  getAll: async (): Promise<AdminScheduledExercise[]> => {
    try {
      const response = await axios.get('/api/admin/scheduled-exercises', { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch scheduled exercises:', error);
      throw error;
    }
  },
  
  /**
   * Get scheduled exercises for a specific user (admin only)
   */
  getByUserId: async (userId: string): Promise<AdminScheduledExercise[]> => {
    try {
      const response = await axios.get(`/api/admin/scheduled-exercises/user/${userId}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch scheduled exercises for user ${userId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get scheduled exercises for a specific date across all users (admin only)
   */
  getByDate: async (date: string): Promise<AdminScheduledExercise[]> => {
    try {
      const response = await axios.get(`/api/admin/scheduled-exercises/date/${date}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch scheduled exercises for date ${date}:`, error);
      throw error;
    }
  },
  
  /**
   * Get a specific scheduled exercise by ID with user data (admin only)
   */
  getById: async (id: string): Promise<AdminScheduledExercise> => {
    try {
      const response = await axios.get(`/api/admin/scheduled-exercises/${id}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch scheduled exercise ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new scheduled exercise for any user (admin only)
   */
  create: async (scheduledExercise: {
    userId: string;
    exerciseId: string;
    categoryId: string;
    date: string;
    sets?: number;
    reps?: number;
    weight?: number;
    weightPlates?: Record<string, number>;
    notes?: string;
  }): Promise<AdminScheduledExercise> => {
    try {
      const response = await axios.post('/api/admin/scheduled-exercises', scheduledExercise, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to create scheduled exercise:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing scheduled exercise (admin only)
   */
  update: async (id: string, data: {
    userId?: string;
    exerciseId?: string;
    categoryId?: string;
    date?: string;
    sets?: number;
    reps?: number;
    weight?: number;
    weightPlates?: Record<string, number>;
    notes?: string;
    completed?: boolean;
  }): Promise<AdminScheduledExercise> => {
    try {
      const response = await axios.put(`/api/admin/scheduled-exercises/${id}`, data, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to update scheduled exercise ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a scheduled exercise (admin only)
   */
  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/api/admin/scheduled-exercises/${id}`, { withCredentials: true });
    } catch (error) {
      console.error(`Failed to delete scheduled exercise ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create multiple scheduled exercises for a user (admin only)
   */
  createMultiple: async (userId: string, date: string, exercises: Array<{
    exerciseId: string;
    categoryId: string;
    sets: number;
    reps: number;
    weight: number;
    weightPlates?: Record<string, number>;
    notes?: string;
  }>): Promise<AdminScheduledExercise[]> => {
    try {
      const response = await axios.post(
        `/api/admin/scheduled-exercises/batch`, 
        { userId, date, exercises }, 
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to create multiple scheduled exercises:`, error);
      throw error;
    }
  },
  
  /**
   * Batch update exercise status (admin only)
   */
  batchUpdateStatus: async (ids: string[], completed: boolean): Promise<void> => {
    try {
      await axios.patch(
        `/api/admin/scheduled-exercises/batch-status`, 
        { ids, completed }, 
        { withCredentials: true }
      );
    } catch (error) {
      console.error(`Failed to update status for exercises:`, error);
      throw error;
    }
  },
  
  /**
   * Copy exercises from one user to another (admin only)
   */
  copyExercisesBetweenUsers: async (
    fromUserId: string,
    toUserId: string,
    date: string,
    targetDate?: string
  ): Promise<AdminScheduledExercise[]> => {
    try {
      const response = await axios.post(
        `/api/admin/scheduled-exercises/copy-between-users`,
        { 
          fromUserId, 
          toUserId, 
          date, 
          targetDate: targetDate || date 
        },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to copy exercises between users:`, error);
      throw error;
    }
  },
  
  /**
   * Delete all scheduled exercises for a specific user (admin only)
   */
  deleteByUserId: async (userId: string): Promise<void> => {
    try {
      await axios.delete(`/api/admin/scheduled-exercises/user/${userId}`, { withCredentials: true });
    } catch (error) {
      console.error(`Failed to delete scheduled exercises for user ${userId}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete all exercises for a specific date across all users (admin only)
   */
  deleteByDate: async (date: string): Promise<void> => {
    try {
      await axios.delete(`/api/admin/scheduled-exercises/date/${date}`, { withCredentials: true });
    } catch (error) {
      console.error(`Failed to delete scheduled exercises for date ${date}:`, error);
      throw error;
    }
  },
  
  /**
   * Generate a usage report for scheduled exercises
   */
  generateUsageReport: async (options?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
  }): Promise<any> => {
    try {
      const response = await axios.get(
        `/api/admin/scheduled-exercises/reports/usage`,
        { 
          params: options,
          withCredentials: true 
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to generate usage report:', error);
      throw error;
    }
  }
}
