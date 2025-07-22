import axios from 'axios';
import { Exercise } from '@/lib/types';

// Re-export types for external consumption
export type { Exercise } from '@/lib/types';

export const exerciseService = {
  /**
   * Get all exercises
   */  getAll: async (): Promise<Exercise[]> => {
    try {
      const response = await axios.get('/api/exercises', { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
      throw error;
    }
  },
  
  /**
   * Get exercises by category ID
   */
  getByCategory: async (categoryId: string): Promise<Exercise[]> => {
    try {
      const response = await axios.get(`/api/exercises?categoryId=${categoryId}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch exercises for category ${categoryId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get a specific exercise by ID
   */  getById: async (id: string): Promise<Exercise> => {
    try {
      const response = await axios.get(`/api/exercises/${id}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch exercise ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new exercise (admin only)
   */  create: async (exercise: { 
    name: string; 
    categoryId: string;
    description?: string;
    imageUrl?: string;
  }): Promise<Exercise> => {
    try {
      const response = await axios.post('/api/exercises', exercise, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to create exercise:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing exercise (admin only)
   */  update: async (id: string, exercise: { 
    name?: string; 
    categoryId?: string;
    description?: string;
    imageUrl?: string;
  }): Promise<Exercise> => {
    try {
      const response = await axios.put(`/api/exercises/${id}`, exercise, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to update exercise ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete an exercise (admin only)
   */  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/api/exercises/${id}`, { withCredentials: true });
    } catch (error) {
      console.error(`Failed to delete exercise ${id}:`, error);
      throw error;
    }
  }
};
