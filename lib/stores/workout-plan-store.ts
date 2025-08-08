'use client';

import { create } from 'zustand';

// UI state interface - Workout Plan specific UI state only
interface WorkoutPlanUIState {
  // Selection state
  selectedPlanId: string | null;
  
  // Dialog states
  showCreateDialog: boolean;
  showEditDialog: boolean;
  showDeleteDialog: boolean;
  showConflictDialog: boolean;
  
  // Conflict data for resolution dialogs
  conflictData: any;
}

interface WorkoutPlanUIActions {
  // Selection actions
  setSelectedPlan: (id: string | null) => void;
  
  // Dialog actions
  setShowCreateDialog: (show: boolean) => void;
  setShowEditDialog: (show: boolean) => void;
  setShowDeleteDialog: (show: boolean) => void;
  setShowConflictDialog: (show: boolean) => void;
  setConflictData: (data: any) => void;
  
  // Utility actions
  reset: () => void;
}

/**
 * Pure UI state store for workout plans
 * Handles only workout plan-specific UI state like dialogs, selections, etc.
 * For data operations, use the hooks from use-workout-plan-data.ts
 */
export const useWorkoutPlanStore = create<WorkoutPlanUIState & WorkoutPlanUIActions>((set) => ({
  // UI State
  selectedPlanId: null,
  showCreateDialog: false,
  showEditDialog: false,
  showDeleteDialog: false,
  showConflictDialog: false,
  conflictData: null,

  // Selection Actions
  setSelectedPlan: (id: string | null) => 
    set((state) => ({ ...state, selectedPlanId: id })),
  
  // Dialog Actions
  setShowCreateDialog: (show: boolean) => 
    set((state) => ({ ...state, showCreateDialog: show })),
  
  setShowEditDialog: (show: boolean) => 
    set((state) => ({ ...state, showEditDialog: show })),
  
  setShowDeleteDialog: (show: boolean) => 
    set((state) => ({ ...state, showDeleteDialog: show })),
  
  setShowConflictDialog: (show: boolean) => 
    set((state) => ({ ...state, showConflictDialog: show })),
  
  setConflictData: (data: any) => 
    set((state) => ({ ...state, conflictData: data })),
  
  // Reset
  reset: () => set({
    selectedPlanId: null,
    showCreateDialog: false,
    showEditDialog: false,
    showDeleteDialog: false,
    showConflictDialog: false,
    conflictData: null,
  }),
}));

export default useWorkoutPlanStore;

// ===== BACKWARDS COMPATIBILITY LAYER =====
// For components that still use the old pattern
// TODO: Remove after migration to new pattern is complete

import { useWorkoutPlanData } from '@/lib/hooks/data-hook/use-workout-plan-data';

/**
 * @deprecated Use useWorkoutPlanStore for UI state and useWorkoutPlanData for data operations
 * This is a compatibility wrapper that mimics the old store API
 */
export const useWorkoutPlanStoreCompatibility = () => {
  const uiStore = useWorkoutPlanStore();
  const dataHook = useWorkoutPlanData();
  
  return {
    // Data (from data hook)
    workoutPlans: dataHook.workoutPlans,
    activePlan: dataHook.activePlan,
    isLoading: dataHook.isLoading,
    error: dataHook.error,
    initialized: dataHook.initialized,
    isCreating: dataHook.isCreating,
    isUpdating: dataHook.isUpdating,
    isDeleting: dataHook.isDeleting,
    
    // UI state (from UI store)
    selectedPlanId: uiStore.selectedPlanId,
    showCreateDialog: uiStore.showCreateDialog,
    showEditDialog: uiStore.showEditDialog,
    showDeleteDialog: uiStore.showDeleteDialog,
    showConflictDialog: uiStore.showConflictDialog,
    conflictData: uiStore.conflictData,
    
    // Actions (combined)
    loadAllPlans: dataHook.loadAllPlans,
    loadActivePlan: dataHook.loadActivePlan,
    createPlan: dataHook.createPlan,
    updatePlan: dataHook.updatePlan,
    deletePlan: dataHook.deletePlan,
    activatePlan: dataHook.activatePlan,
    deactivatePlan: dataHook.deactivatePlan,
    
    // UI actions
    setSelectedPlan: uiStore.setSelectedPlan,
    setShowCreateDialog: uiStore.setShowCreateDialog,
    setShowEditDialog: uiStore.setShowEditDialog,
    setShowDeleteDialog: uiStore.setShowDeleteDialog,
    setShowConflictDialog: uiStore.setShowConflictDialog,
    setConflictData: uiStore.setConflictData,
    
    // Legacy utility functions
    getPlansByMode: dataHook.getPlansByMode,
    getPlansByLevel: dataHook.getPlansByLevel,
    searchPlans: dataHook.searchPlans,
    
    // Other legacy functions
    initializeStore: () => dataHook.refetch(),
    reset: uiStore.reset,
    setError: () => {}, // No-op, React Query handles errors
    clearError: () => {}, // No-op, React Query handles errors
    loadPlanById: () => Promise.resolve(), // Use useWorkoutPlanById hook instead
    duplicatePlan: () => Promise.resolve(), // To be implemented
  };
};
