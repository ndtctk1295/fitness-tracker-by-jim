"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { categoryService } from '@/lib/services/category-service'
import { Category, CategoryState } from '@/lib/types'

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: [],
      selectedCategory: null,
      loading: false,
      error: null,
      
      // Category actions
      fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
          const categories = await categoryService.getAll();
          set({ categories, loading: false });
        } catch (error) {
          console.error('Error fetching categories:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch categories', 
            loading: false 
          });
        }
      },
      
      selectCategory: (id) => {
        const category = get().categories.find(cat => cat._id === id) || null;
        set({ selectedCategory: category });
      },
      
      addCategory: async (category) => {
        set({ loading: true, error: null });
        try {
          const newCategory = await categoryService.create(category);
          set(state => ({
            categories: [...state.categories, newCategory],
            loading: false
          }));
        } catch (error) {
          console.error('Error adding category:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add category', 
            loading: false 
          });
        }
      },
      
      updateCategory: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const updatedCategory = await categoryService.update(id, data);
          set(state => ({
            categories: state.categories.map(cat => cat._id === id ? updatedCategory : cat),
            selectedCategory: state.selectedCategory?._id === id ? updatedCategory : state.selectedCategory,
            loading: false
          }));
        } catch (error) {
          console.error('Error updating category:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update category', 
            loading: false 
          });
        }
      },
      
      deleteCategory: async (id) => {
        set({ loading: true, error: null });
        try {
          await categoryService.delete(id);
          set(state => ({
            categories: state.categories.filter(cat => cat._id !== id),
            selectedCategory: state.selectedCategory?._id === id ? null : state.selectedCategory,
            loading: false
          }));
        } catch (error) {
          console.error('Error deleting category:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete category', 
            loading: false 
          });
        }
      },
    }),
    {
      name: 'category-store',
    }
  )
)
