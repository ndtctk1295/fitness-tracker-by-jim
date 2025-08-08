import { useMemo } from 'react';
import { 
  useWorkoutPlans, 
  useWorkoutPlanById, 
  useActiveWorkoutPlan,
  useCreateWorkoutPlan, 
  useUpdateWorkoutPlan, 
  useDeleteWorkoutPlan, 
  useDuplicateWorkoutPlan,
  useActivateWorkoutPlan,
  useDeactivateWorkoutPlan
} from '@/lib/utils/queries/workout-plans-queries';

// Enhanced selector interface for better TypeScript support
interface WorkoutPlanSelectors {
  // Filter selectors
  byMode: (mode: 'ongoing' | 'dated') => any[];
  byLevel: (level: 'beginner' | 'intermediate' | 'advanced') => any[];
  byActive: (isActive: boolean) => any[];
  search: (query: string) => any[];
  
  // Utility selectors
  findById: (id: string) => any | undefined;
  sortedByName: (ascending?: boolean) => any[];
  sortedByCreatedDate: (ascending?: boolean) => any[];
  
  // Advanced selectors
  activePlans: any[];
  inactivePlans: any[];
  ongoingPlans: any[];
  datedPlans: any[];
  
  // Stats
  stats: {
    total: number;
    active: number;
    inactive: number;
    byLevel: {
      beginner: number;
      intermediate: number;
      advanced: number;
    };
    byMode: {
      ongoing: number;
      dated: number;
    };
  };
}

/**
 * Core hook for workout plan data with comprehensive selector patterns
 * Eliminates manual memoization in components through optimized, cached selectors
 * 
 * @returns Complete data interface with plans, active plan, selectors, and actions
 */
export function useWorkoutPlanData() {
  // Direct React Query usage - no store wrapper needed
  const workoutPlansQuery = useWorkoutPlans();
  const activePlanQuery = useActiveWorkoutPlan();

  // Mutations
  const createPlanMutation = useCreateWorkoutPlan();
  const updatePlanMutation = useUpdateWorkoutPlan();
  const deletePlanMutation = useDeleteWorkoutPlan();
  const duplicatePlanMutation = useDuplicateWorkoutPlan();
  const activatePlanMutation = useActivateWorkoutPlan();
  const deactivatePlanMutation = useDeactivateWorkoutPlan();

  // Computed values
  const workoutPlans = workoutPlansQuery.data || [];
  const activePlan = activePlanQuery.data;
  
  const isLoading = workoutPlansQuery.isLoading || activePlanQuery.isLoading;
  const error = workoutPlansQuery.error || activePlanQuery.error;
  const initialized = !workoutPlansQuery.isLoading && !activePlanQuery.isLoading;

  // Enhanced selectors with comprehensive memoization
  const selectors: WorkoutPlanSelectors = useMemo(() => {
    // Filter functions
    const byMode = (mode: 'ongoing' | 'dated') => 
      workoutPlans.filter((plan: any) => plan.mode === mode);
    
    const byLevel = (level: 'beginner' | 'intermediate' | 'advanced') => 
      workoutPlans.filter((plan: any) => plan.level === level);
    
    const byActive = (isActive: boolean) => 
      workoutPlans.filter((plan: any) => plan.isActive === isActive);
    
    const search = (query: string) => {
      const lowercaseQuery = query.toLowerCase();
      return workoutPlans.filter((plan: any) => 
        plan.name.toLowerCase().includes(lowercaseQuery) ||
        (plan.description && plan.description.toLowerCase().includes(lowercaseQuery))
      );
    };

    // Utility functions
    const findById = (id: string) => 
      workoutPlans.find((plan: any) => plan.id === id);
    
    const sortedByName = (ascending = true) => {
      return [...workoutPlans].sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return ascending ? comparison : -comparison;
      });
    };
    
    const sortedByCreatedDate = (ascending = false) => {
      return [...workoutPlans].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return ascending ? dateA - dateB : dateB - dateA;
      });
    };

    // Pre-computed collections
    const activePlans = byActive(true);
    const inactivePlans = byActive(false);
    const ongoingPlans = byMode('ongoing');
    const datedPlans = byMode('dated');

    // Stats computation
    const stats = {
      total: workoutPlans.length,
      active: activePlans.length,
      inactive: inactivePlans.length,
      byLevel: {
        beginner: byLevel('beginner').length,
        intermediate: byLevel('intermediate').length,
        advanced: byLevel('advanced').length,
      },
      byMode: {
        ongoing: ongoingPlans.length,
        dated: datedPlans.length,
      },
    };

    return {
      // Filter functions
      byMode,
      byLevel,
      byActive,
      search,
      
      // Utility functions
      findById,
      sortedByName,
      sortedByCreatedDate,
      
      // Pre-computed collections
      activePlans,
      inactivePlans,
      ongoingPlans,
      datedPlans,
      
      // Stats
      stats,
    };
  }, [workoutPlans]);

  return {
    // Core data
    workoutPlans,
    activePlan,
    isLoading,
    error: error?.message || null,
    initialized,
    
    // Enhanced selectors (main feature)
    selectors,
    
    // Loading states for mutations
    isCreating: createPlanMutation.isPending,
    isUpdating: updatePlanMutation.isPending,
    isDeleting: deletePlanMutation.isPending,
    isDuplicating: duplicatePlanMutation.isPending,
    isActivating: activatePlanMutation.isPending,
    isDeactivating: deactivatePlanMutation.isPending,
    
    // Actions - direct mutation access
    refetch: () => Promise.all([workoutPlansQuery.refetch(), activePlanQuery.refetch()]),
    loadActivePlan: () => activePlanQuery.refetch(),
    loadAllPlans: () => workoutPlansQuery.refetch(),
    
    // CRUD operations
    createPlan: createPlanMutation.mutateAsync,
    updatePlan: (id: string, data: any) => updatePlanMutation.mutateAsync({ id, data }),
    deletePlan: deletePlanMutation.mutateAsync,
    duplicatePlan: duplicatePlanMutation.mutateAsync,
    activatePlan: activatePlanMutation.mutateAsync,
    deactivatePlan: deactivatePlanMutation.mutateAsync,
    
    // Legacy compatibility functions (use selectors instead)
    getPlansByMode: (mode: 'ongoing' | 'dated') => selectors.byMode(mode),
    getPlansByLevel: (level: 'beginner' | 'intermediate' | 'advanced') => selectors.byLevel(level),
    searchPlans: (query: string) => selectors.search(query),
    findPlanById: (id: string) => selectors.findById(id),
  };
}

/**
 * Hook for workout plan mutations only
 * Useful when you only need to modify plans without fetching data
 * 
 * @returns Mutation functions and their loading states
 */
export function useWorkoutPlanMutations() {
  const createPlanMutation = useCreateWorkoutPlan();
  const updatePlanMutation = useUpdateWorkoutPlan();
  const deletePlanMutation = useDeleteWorkoutPlan();
  const duplicatePlanMutation = useDuplicateWorkoutPlan();
  const activatePlanMutation = useActivateWorkoutPlan();
  const deactivatePlanMutation = useDeactivateWorkoutPlan();

  return {
    // Core mutations
    createPlan: createPlanMutation.mutateAsync,
    updatePlan: (id: string, data: any) => updatePlanMutation.mutateAsync({ id, data }),
    deletePlan: deletePlanMutation.mutateAsync,
    duplicatePlan: duplicatePlanMutation.mutateAsync,
    activatePlan: activatePlanMutation.mutateAsync,
    deactivatePlan: deactivatePlanMutation.mutateAsync,
    
    // Mutation states
    isCreating: createPlanMutation.isPending,
    isUpdating: updatePlanMutation.isPending,
    isDeleting: deletePlanMutation.isPending,
    isDuplicating: duplicatePlanMutation.isPending,
    isActivating: activatePlanMutation.isPending,
    isDeactivating: deactivatePlanMutation.isPending,
  };
}

/**
 * Hook to get a specific workout plan by ID
 * 
 * @param id - The workout plan ID
 * @returns Plan data and loading state
 */
export function useWorkoutPlanByIdData(id: string) {
  const planQuery = useWorkoutPlanById(id);
  return {
    plan: planQuery.data,
    isLoading: planQuery.isLoading,
    error: (planQuery as any).error?.message || null,
    refetch: planQuery.refetch,
  };
}
