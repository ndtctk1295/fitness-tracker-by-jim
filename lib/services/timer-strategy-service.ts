import axios from 'axios';
import { TimerStrategy } from '@/lib/types';

// Re-export types for external consumption
export type { TimerStrategy } from '@/lib/types';

export const timerStrategyService = {
  /**
   * Get all timer strategies for the current user
   */  getAll: async (): Promise<TimerStrategy[]> => {
    try {
      const response = await axios.get('/api/timer-strategies', { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch timer strategies:', error);
      throw error;
    }
  },
  
  /**
   * Get a specific timer strategy by ID
   */  getById: async (id: string): Promise<TimerStrategy> => {
    try {
      const response = await axios.get(`/api/timer-strategies/${id}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch timer strategy ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new timer strategy
   */  create: async (timerStrategy: { 
    name: string; 
    color: string;
    restDuration: number;
    activeDuration: number;
  }): Promise<TimerStrategy> => {
    try {
      const response = await axios.post('/api/timer-strategies', timerStrategy, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to create timer strategy:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing timer strategy
   */  update: async (id: string, timerStrategy: { 
    name?: string; 
    color?: string;
    restDuration?: number;
    activeDuration?: number;
  }): Promise<TimerStrategy> => {
    try {
      const response = await axios.put(`/api/timer-strategies/${id}`, timerStrategy, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to update timer strategy ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a timer strategy
   */  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/api/timer-strategies/${id}`, { withCredentials: true });
    } catch (error) {
      console.error(`Failed to delete timer strategy ${id}:`, error);
      throw error;
    }
  }
};
