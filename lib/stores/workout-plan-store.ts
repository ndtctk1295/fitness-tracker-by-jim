'use client';

import { useMemo, useState } from 'react';
import { 
  useWorkoutPlans, 
  useActiveWorkoutPlan, 
  useWorkoutPlanById,
  useCreateWorkoutPlan,
  useUpdateWorkoutPlan,
  useDeleteWorkoutPlan,
  useActivateWorkoutPlan,
  useDeactivateWorkoutPlan
} from '@/lib/queries';

// UI state interface
interface WorkoutPlanUIState {
  selectedPlanId: string | null;
  showCreateDialog: boolean;
  showEditDialog: boolean;
  showDeleteDialog: boolean;
  showConflictDialog: boolean;
  conflictData: any;
}

// React Query-based workout plan store hook
export const useWorkoutPlanStore = () => {
  // UI state
  const [uiState, setUIState] = useState<WorkoutPlanUIState>({
    selectedPlanId: null,
    showCreateDialog: false,
    showEditDialog: false,
    showDeleteDialog: false,
    showConflictDialog: false,
    conflictData: null,
  });

  // Use React Query hooks for data fetching
  const workoutPlansQuery = useWorkoutPlans();
  const activePlanQuery = useActiveWorkoutPlan();

  // Mutations
  const createPlanMutation = useCreateWorkoutPlan();
  const updatePlanMutation = useUpdateWorkoutPlan();
  const deletePlanMutation = useDeleteWorkoutPlan();
  const activatePlanMutation = useActivateWorkoutPlan();
  const deactivatePlanMutation = useDeactivateWorkoutPlan();

  // Computed values
  const workoutPlans = workoutPlansQuery.data || [];
  const activePlan = activePlanQuery.data;
  
  const isLoading = workoutPlansQuery.isLoading || activePlanQuery.isLoading;
  const error = workoutPlansQuery.error || activePlanQuery.error;
  const initialized = !workoutPlansQuery.isLoading && !activePlanQuery.isLoading;

  const isCreating = createPlanMutation.isPending;
  const isUpdating = updatePlanMutation.isPending;
  const isDeleting = deletePlanMutation.isPending;
  const isActivating = activatePlanMutation.isPending;
  const isDeactivating = deactivatePlanMutation.isPending;

  // Utility functions
  const getPlansByMode = useMemo(() => (mode: 'ongoing' | 'dated') => {
    return workoutPlans.filter((plan: any) => plan.mode === mode);
  }, [workoutPlans]);

  const getPlansByLevel = useMemo(() => (level: 'beginner' | 'intermediate' | 'advanced') => {
    return workoutPlans.filter((plan: any) => plan.level === level);
  }, [workoutPlans]);

  const searchPlans = useMemo(() => (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return workoutPlans.filter((plan: any) => 
      plan.name.toLowerCase().includes(lowercaseQuery) ||
      (plan.description && plan.description.toLowerCase().includes(lowercaseQuery))
    );
  }, [workoutPlans]);

  // Action functions
  const loadAllPlans = () => workoutPlansQuery.refetch();
  const loadActivePlan = () => activePlanQuery.refetch();
  const loadPlanById = (id: string) => {
    // This would typically use useWorkoutPlanById hook
    return Promise.resolve();
  };

  const createPlan = async (planData: any) => {
    return createPlanMutation.mutateAsync(planData);
  };

  const updatePlan = async (id: string, updateData: any) => {
    return updatePlanMutation.mutateAsync({ id, data: updateData });
  };

  const deletePlan = async (id: string) => {
    return deletePlanMutation.mutateAsync(id);
  };

  const activatePlan = async (id: string) => {
    return activatePlanMutation.mutateAsync(id);
  };

  const deactivatePlan = async (id: string) => {
    return deactivatePlanMutation.mutateAsync(id);
  };

  const duplicatePlan = async (id: string, newName?: string) => {
    // Implementation would depend on your API
    return Promise.resolve();
  };

  // UI state management
  const setSelectedPlan = (id: string | null) => {
    setUIState(prev => ({ ...prev, selectedPlanId: id }));
  };

  const setShowCreateDialog = (show: boolean) => {
    setUIState(prev => ({ ...prev, showCreateDialog: show }));
  };

  const setShowEditDialog = (show: boolean) => {
    setUIState(prev => ({ ...prev, showEditDialog: show }));
  };

  const setShowDeleteDialog = (show: boolean) => {
    setUIState(prev => ({ ...prev, showDeleteDialog: show }));
  };

  const setShowConflictDialog = (show: boolean) => {
    setUIState(prev => ({ ...prev, showConflictDialog: show }));
  };

  const setConflictData = (data: any) => {
    setUIState(prev => ({ ...prev, conflictData: data }));
  };

  const setError = (error: string | null) => {
    // React Query handles errors automatically
  };

  const clearError = () => {
    // React Query handles error clearing automatically
  };

  const initializeStore = () => {
    return Promise.all([loadAllPlans(), loadActivePlan()]);
  };

  const reset = () => {
    setUIState({
      selectedPlanId: null,
      showCreateDialog: false,
      showEditDialog: false,
      showDeleteDialog: false,
      showConflictDialog: false,
      conflictData: null,
    });
  };

  return {
    // Data
    workoutPlans,
    activePlan,
    
    // UI state
    isLoading,
    error: error?.message || null,
    isCreating,
    isUpdating,
    isDeleting,
    initialized,
    
    // UI state
    selectedPlanId: uiState.selectedPlanId,
    showCreateDialog: uiState.showCreateDialog,
    showEditDialog: uiState.showEditDialog,
    showDeleteDialog: uiState.showDeleteDialog,
    showConflictDialog: uiState.showConflictDialog,
    conflictData: uiState.conflictData,
    
    // Actions
    initializeStore,
    loadAllPlans,
    loadActivePlan,
    loadPlanById,
    createPlan,
    updatePlan,
    deletePlan,
    duplicatePlan,
    activatePlan,
    deactivatePlan,
    
    // Utility functions
    getPlansByMode,
    getPlansByLevel,
    searchPlans,
    
    // UI actions
    setSelectedPlan,
    setShowCreateDialog,
    setShowEditDialog,
    setShowDeleteDialog,
    setShowConflictDialog,
    setConflictData,
    setError,
    clearError,
    
    // Reset
    reset,
  };
};

export default useWorkoutPlanStore;
