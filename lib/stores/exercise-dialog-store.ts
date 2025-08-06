import { create } from 'zustand'
import { format } from 'date-fns'
import { lbsToKg } from '@/lib/utils/weight-conversion'

interface ExerciseDialogState {
  // Form fields
  selectedCategoryId: string
  selectedExerciseId: string
  sets: number
  reps: number
  weight: number
  weightPlates: Record<string, number>
  
  // UI state
  activeTab: 'list' | 'add' | 'edit'
  exerciseSelectionTab: 'favorites' | 'all'
  editingExerciseId: string | null
  isLoading: boolean
  
  // Actions
  setSelectedCategoryId: (id: string) => void
  setSelectedExerciseId: (id: string) => void
  setSets: (sets: number) => void
  setReps: (reps: number) => void
  setWeight: (weight: number) => void
  setWeightPlates: (plates: Record<string, number>) => void
  setActiveTab: (tab: 'list' | 'add' | 'edit') => void
  setExerciseSelectionTab: (tab: 'favorites' | 'all') => void
  setEditingExerciseId: (id: string | null) => void
  setIsLoading: (isLoading: boolean) => void
  
  // Business logic
  resetForm: () => void
  loadExerciseForEditing: (exercise: any, weightUnit: string) => void
  addExercise: (date: Date, weightUnit: string) => Promise<any>
  updateExercise: (weightUnit: string) => Promise<any>
  deleteExercise: (id: string) => Promise<any>
  clearExercises: (date: Date) => Promise<any>
  startEditingExercise: (id: string) => void
  cancelEditing: () => void
  calculateTotalWeightFromPlates: () => void
}

export const useExerciseDialogStore = create<ExerciseDialogState>((set, get) => ({
  // Initial state for form fields
  selectedCategoryId: '',
  selectedExerciseId: '',
  sets: 3,
  reps: 12,
  weight: 0,
  weightPlates: {},
  
  // Initial state for UI
  activeTab: 'list',
  exerciseSelectionTab: 'favorites',
  editingExerciseId: null,
  isLoading: false,
  
  // State setters
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setSelectedExerciseId: (id) => set({ selectedExerciseId: id }),
  setSets: (sets) => set({ sets: Number(sets) }),
  setReps: (reps) => set({ reps: Number(reps) }),
  setWeight: (weight) => set({ weight: Number(weight) }),
  setWeightPlates: (plates) => set({ weightPlates: plates }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setExerciseSelectionTab: (tab) => set({ exerciseSelectionTab: tab }),
  setEditingExerciseId: (id) => set({ editingExerciseId: id }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  // Business logic
  resetForm: () => set({
    selectedCategoryId: '',
    selectedExerciseId: '',
    sets: 3,
    reps: 12,
    weight: 0,
    weightPlates: {},
    exerciseSelectionTab: 'favorites',
  }),
  
  loadExerciseForEditing: (exercise, weightUnit) => {
    // Convert weight based on the current unit setting
    const displayWeight = weightUnit === 'kg' 
      ? Number(exercise.weight) 
      : exercise.weight * 2.20462; // Convert kg to lbs
      
    set({
      selectedCategoryId: exercise.categoryId,
      selectedExerciseId: exercise.exerciseId,
      sets: Number(exercise.sets),
      reps: Number(exercise.reps),
      weight: displayWeight,
      weightPlates: exercise.weightPlates || {},
    });
  },
  
  addExercise: async (date, weightUnit) => {
    const { 
      selectedExerciseId, 
      selectedCategoryId, 
      sets, 
      reps, 
      weight, 
      weightPlates 
    } = get();
    
    if (selectedExerciseId && sets && reps) {
      set({ isLoading: true });
      try {
        const weightInKg = weightUnit === 'lbs' ? lbsToKg(Number(weight)) : Number(weight);
        
        // Return the data to be processed by the component
        const exerciseData = {
          exerciseId: selectedExerciseId,
          categoryId: selectedCategoryId,
          sets: Number(sets),
          reps: Number(reps),
          weight: weightInKg,
          weightPlates: weightPlates,
          date: format(date, 'yyyy-MM-dd'),
        };
        
        set({ activeTab: 'list' });
        get().resetForm();
        
        return exerciseData;
      } catch (error) {
        console.error('Error preparing scheduled exercise:', error);
        throw error;
      } finally {
        set({ isLoading: false });
      }
    }
    return null;
  },
  
  updateExercise: async (weightUnit) => {
    const { 
      editingExerciseId, 
      selectedExerciseId, 
      selectedCategoryId, 
      sets, 
      reps, 
      weight, 
      weightPlates 
    } = get();
    
    if (editingExerciseId && selectedExerciseId && sets && reps) {
      set({ isLoading: true });
      try {
        const weightInKg = weightUnit === 'lbs' ? lbsToKg(Number(weight)) : Number(weight);
        
        const updateData = {
          id: editingExerciseId,
          updates: {
            exerciseId: selectedExerciseId,
            categoryId: selectedCategoryId,
            sets: Number(sets),
            reps: Number(reps),
            weight: weightInKg,
            weightPlates: weightPlates,
          }
        };
        
        set({ 
          editingExerciseId: null,
          activeTab: 'list'
        });
        
        return updateData;
      } catch (error) {
        console.error('Error preparing update data:', error);
        throw error;
      } finally {
        set({ isLoading: false });
      }
    }
    return null;
  },
  
  deleteExercise: async (id) => {
    set({ isLoading: true });
    try {
      const { editingExerciseId } = get();
      if (editingExerciseId === id) {
        set({ editingExerciseId: null });
      }
      
      return { id };
    } catch (error) {
      console.error('Error preparing delete:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  clearExercises: async (date) => {
    set({ isLoading: true });
    try {
      // Return date for component to handle clearing
      set({ editingExerciseId: null });
      return { date };
    } catch (error) {
      console.error('Error preparing clear exercises:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  startEditingExercise: (id) => {
    set({
      editingExerciseId: id,
      activeTab: 'edit'
    });
  },
  
  cancelEditing: () => {
    set({
      editingExerciseId: null,
      activeTab: 'list'
    });
    get().resetForm();
  },
  
  calculateTotalWeightFromPlates: () => {
    const { weightPlates } = get();
    let totalWeight = 0;
    
    Object.entries(weightPlates).forEach(([plate, count]) => {
      totalWeight += Number.parseFloat(plate) * count;
    });
    
    set({ weight: totalWeight });
  }
}));
