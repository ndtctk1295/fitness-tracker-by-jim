import axios from 'axios';
import { User, StoreUser, CreateUserData, UpdateUserData } from '@/lib/types';

// Re-export types for external consumption
export type { User, StoreUser, CreateUserData, UpdateUserData } from '@/lib/types';

// Transform User (with _id) to StoreUser (with id)
const transformToStoreUser = (user: User): StoreUser => {
  const { _id, ...rest } = user;
  return { id: _id, ...rest };
};

export const userClientService = {  /**
   * Get all users (admin only)
   */
  getAll: async (): Promise<StoreUser[]> => {
    try {
      const response = await axios.get('/api/users', { withCredentials: true });
      return response.data.map(transformToStoreUser);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },
    /**
   * Get a specific user by ID (admin only)
   */
  getById: async (id: string): Promise<StoreUser> => {
    try {
      const response = await axios.get(`/api/users/${id}`, { withCredentials: true });
      return transformToStoreUser(response.data);
    } catch (error) {
      console.error(`Failed to fetch user ${id}:`, error);
      throw error;
    }
  },
    /**
   * Create a new user (admin only)
   */
  create: async (userData: CreateUserData): Promise<StoreUser> => {
    try {
      const response = await axios.post('/api/users', userData, { withCredentials: true });
      return transformToStoreUser(response.data);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },
    /**
   * Update an existing user (admin only)
   */
  update: async (id: string, userData: UpdateUserData): Promise<StoreUser> => {
    try {
      const response = await axios.put(`/api/users/${id}`, userData, { withCredentials: true });
      return transformToStoreUser(response.data);
    } catch (error) {
      console.error(`Failed to update user ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a user (admin only)
   */
  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/api/users/${id}`, { withCredentials: true });
    } catch (error) {
      console.error(`Failed to delete user ${id}:`, error);
      throw error;
    }
  }
};
