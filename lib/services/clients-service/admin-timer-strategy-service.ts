import axios from 'axios';
import { TimerStrategy } from './timer-strategy-service';

export interface AdminTimerStrategy extends TimerStrategy {
  userName: string;
}

export const adminTimerStrategyService = {
  /**
   * Get all timer strategies for all users (admin only)
   */
  getAll: async (): Promise<AdminTimerStrategy[]> => {
    try {
      const response = await axios.get('/api/admin/timer-strategies', { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch timer strategies:', error);
      throw error;
    }
  },
  
  /**
   * Get a specific timer strategy by ID (admin only)
   */
  getById: async (id: string): Promise<AdminTimerStrategy> => {
    try {
      const response = await axios.get(`/api/admin/timer-strategies/${id}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch timer strategy ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new timer strategy for a specific user (admin only)
   */
  create: async (timerStrategy: { 
    userId: string;
    name: string; 
    color: string;
    restDuration: number;
    activeDuration: number;
  }): Promise<AdminTimerStrategy> => {
    try {
      const response = await axios.post('/api/admin/timer-strategies', timerStrategy, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to create timer strategy:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing timer strategy (admin only)
   */
  update: async (id: string, timerStrategy: { 
    userId?: string;
    name?: string; 
    color?: string;
    restDuration?: number;
    activeDuration?: number;
  }): Promise<AdminTimerStrategy> => {
    try {
      const response = await axios.put(`/api/admin/timer-strategies/${id}`, timerStrategy, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to update timer strategy ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a timer strategy (admin only)
   */
  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/api/admin/timer-strategies/${id}`, { withCredentials: true });
    } catch (error) {
      console.error(`Failed to delete timer strategy ${id}:`, error);
      throw error;
    }
  }
};
