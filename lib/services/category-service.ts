import apiClient from '@/lib/utils/api-client';
import { Category } from '@/lib/types';

// Re-export types for external consumption
export type { Category } from '@/lib/types';

export const categoryService = {
  /**
   * Get all categories
   */  getAll: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get('/api/categories');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  },
  
  /**
   * Get a specific category by ID
   */  getById: async (id: string): Promise<Category> => {
    try {
      const response = await apiClient.get(`/api/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch category ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new category (admin only)
   */  create: async (category: { 
    name: string; 
    color: string;
    description?: string;
  }): Promise<Category> => {
    try {
      const response = await apiClient.post('/api/categories', category);
      return response.data;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing category (admin only)
   */  update: async (id: string, category: { 
    name?: string; 
    color?: string;
    description?: string;
  }): Promise<Category> => {
    try {
      const response = await apiClient.put(`/api/categories/${id}`, category);
      return response.data;
    } catch (error) {
      console.error(`Failed to update category ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a category (admin only)
   */  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/categories/${id}`);
    } catch (error) {
      console.error(`Failed to delete category ${id}:`, error);
      throw error;
    }
  }
};
