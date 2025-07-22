import axios from 'axios';
import { ExerciseOrder } from '@/lib/types';

export const exerciseOrderService = {
  /**
   * Get exercise order for a specific date
   */  getByDate: async (date: string): Promise<ExerciseOrder> => {
    try {
      const response = await axios.get(`/api/exercise-orders?date=${date}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch exercise order for date ${date}:`, error);
      throw error;
    }
  },
  
  /**
   * Create or update exercise order for a date
   */  saveOrder: async (date: string, orderedExerciseIds: string[]): Promise<ExerciseOrder> => {
    try {
      const response = await axios.post('/api/exercise-orders', {
        date,
        orderedExerciseIds
      }, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to save exercise order for date ${date}:`, error);
      throw error;
    }
  },
  
  /**
   * Get exercise order for multiple dates
   */  getByDateRange: async (startDate: string, endDate: string): Promise<ExerciseOrder[]> => {
    try {
      const response = await axios.get(`/api/exercise-orders?startDate=${startDate}&endDate=${endDate}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch exercise orders for date range ${startDate} to ${endDate}:`, error);
      throw error;
    }
  }
};
