import axios from 'axios';
import { WeightPlate } from '@/lib/types';

export const weightPlateService = {
  /**
   * Get all weight plates for the current user
   */  getAll: async (): Promise<WeightPlate[]> => {
    try {
      const response = await axios.get('/api/weights', { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch weight plates:', error);
      throw error;
    }
  },
  
  /**
   * Get a specific weight plate by ID
   */  getById: async (id: string): Promise<WeightPlate> => {
    try {
      const response = await axios.get(`/api/weights/${id}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch weight plate ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new weight plate
   */  create: async (weightPlate: { 
    value: number; 
    color: string;
  }): Promise<WeightPlate> => {
    try {
      const response = await axios.post('/api/weights', weightPlate, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to create weight plate:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing weight plate
   */  update: async (id: string, weightPlate: { 
    value?: number; 
    color?: string;
  }): Promise<WeightPlate> => {
    try {
      const response = await axios.put(`/api/weights/${id}`, weightPlate, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to update weight plate ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a weight plate
   */  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/api/weights/${id}`, { withCredentials: true });
    } catch (error) {
      console.error(`Failed to delete weight plate ${id}:`, error);
      throw error;
    }
  }
};
