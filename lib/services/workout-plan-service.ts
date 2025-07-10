import axios from 'axios';
import { ExerciseGenerationPolicy } from '../models/exercise-generation-policy';

// Types for workout plan operations
export interface WorkoutPlan {
  _id?: string;
  id?: string;
  userId: string;
  name: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  isActive: boolean;
  mode: 'ongoing' | 'dated';
  startDate?: Date;
  endDate?: Date;
  weeklyTemplate: DayTemplate[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DayTemplate {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  name?: string;
  exerciseTemplates: ExerciseTemplate[];
}

export interface ExerciseTemplate {
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number;
  duration?: number;
  weightPlates?: Record<string, number>;
  notes?: string;
  orderIndex: number;
}

export interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflictingPlans: WorkoutPlan[];
}

export interface PlanActivationResult {
  success: boolean;
  data?: WorkoutPlan;  // Changed from 'plan' to 'data' to match API response
  deactivatedPlans?: WorkoutPlan[];
  message?: string;
}

export const workoutPlanService = {
  /**
   * Get all workout plans for the current user
   */
  getAll: async (): Promise<WorkoutPlan[]> => {
    try {
      const response = await axios.get('/api/workout-plans', { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch workout plans:', error);
      throw error;
    }
  },

  /**
   * Get active workout plan for the current user
   */
  getActive: async (): Promise<WorkoutPlan | null> => {
    try {
      const response = await axios.get('/api/workout-plans/active', { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch active workout plan:', error);
      throw error;
    }
  },

  /**
   * Get a specific workout plan by ID
   */
  getById: async (id: string): Promise<WorkoutPlan> => {
    try {
      const response = await axios.get(`/api/workout-plans/${id}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch workout plan ${id}:`, error);
      throw error;
    }
  },
  /**
   * Create a new workout plan
   */
  create: async (planData: Omit<WorkoutPlan, '_id' | 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<WorkoutPlan> => {
    try {
      // Sanitize any date objects to make sure they're valid
      const sanitizedData = {
        ...planData,
        startDate: planData.startDate ? new Date(planData.startDate) : undefined,
        endDate: planData.endDate ? new Date(planData.endDate) : undefined
      };
      
      const response = await axios.post('/api/workout-plans', sanitizedData, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to create workout plan:', error);
      throw error;
    }
  },

  /**
   * Update an existing workout plan
   */  update: async (id: string, updateData: Partial<WorkoutPlan>): Promise<WorkoutPlan> => {
    try {
      // Sanitize date fields to ensure they are valid Date objects
      const sanitizedData = { ...updateData };
      
      if (sanitizedData.startDate) {
        try {
          sanitizedData.startDate = new Date(sanitizedData.startDate);
        } catch (e) {
          console.warn('Invalid startDate:', sanitizedData.startDate);
          delete sanitizedData.startDate;
        }
      }
      
      if (sanitizedData.endDate) {
        try {
          sanitizedData.endDate = new Date(sanitizedData.endDate);
        } catch (e) {
          console.warn('Invalid endDate:', sanitizedData.endDate);
          delete sanitizedData.endDate;
        }
      }
      
      const response = await axios.put(`/api/workout-plans/${id}`, sanitizedData, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to update workout plan ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a workout plan
   */
  delete: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`/api/workout-plans/${id}`, { withCredentials: true });
      return true;
    } catch (error) {
      console.error(`Failed to delete workout plan ${id}:`, error);
      throw error;
    }
  },

  /**
   * Activate a workout plan (deactivates all others)
   */
  activate: async (id: string): Promise<PlanActivationResult> => {
    try {
      const response = await axios.post(`/api/workout-plans/${id}/activate`, {}, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to activate workout plan ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deactivate a workout plan
   */
  deactivate: async (id: string): Promise<WorkoutPlan> => {
    try {
      const response = await axios.post(`/api/workout-plans/${id}/deactivate`, {}, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to deactivate workout plan ${id}:`, error);
      throw error;
    }
  },

  /**
   * Duplicate a workout plan
   */
  duplicate: async (id: string, newName?: string): Promise<WorkoutPlan> => {
    try {
      const response = await axios.post(`/api/workout-plans/${id}/duplicate`, 
        { newName }, 
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to duplicate workout plan ${id}:`, error);
      throw error;
    }
  },
  /**
   * Check for conflicts with existing plans
   */
  checkConflicts: async (
    startDate: Date, 
    endDate: Date, 
    workoutPlanId: string
  ): Promise<ConflictDetectionResult> => {
    try {
      const response = await axios.post('/api/workout-plans/check-conflicts', {
        workoutPlanId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to check plan conflicts:', error);
      throw error;
    }
  },

  /**
   * Resolve conflicts by deactivating conflicting plans
   */
  resolveConflicts: async (
    newPlanId: string,
    conflictingPlanIds: string[]
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await axios.post('/api/workout-plans/resolve-conflicts', {
        newPlanId,
        conflictingPlanIds
      }, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to resolve plan conflicts:', error);
      throw error;
    }
  },

  /**
   * Get workout plans by mode (ongoing/dated)
   */
  getByMode: async (mode: 'ongoing' | 'dated'): Promise<WorkoutPlan[]> => {
    try {
      const response = await axios.get(`/api/workout-plans?mode=${mode}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${mode} workout plans:`, error);
      throw error;
    }
  },

  /**
   * Get workout plans by level
   */
  getByLevel: async (level: 'beginner' | 'intermediate' | 'advanced'): Promise<WorkoutPlan[]> => {
    try {
      const response = await axios.get(`/api/workout-plans?level=${level}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${level} workout plans:`, error);
      throw error;
    }
  },
  /**
   * Generate scheduled exercises from active workout plan for a date range
   */
  generateScheduledExercises: async (
    startDate: Date,
    endDate: Date,
    workoutPlanId?: string,
    replaceExisting: boolean = false
  ): Promise<{ success: boolean; count: number; message?: string }> => {
    try {
      const requestBody: any = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        replaceExisting
      };

      // If workoutPlanId is provided, use it; otherwise the API will use the active plan
      if (workoutPlanId) {
        requestBody.workoutPlanId = workoutPlanId;
      } else {
        // Get the active plan first
        const activePlan = await workoutPlanService.getActive();
        if (!activePlan) {
          throw new Error('No active workout plan found and no workoutPlanId provided');
        }
        requestBody.workoutPlanId = activePlan._id || activePlan.id;
      }

      const response = await axios.post('/api/workout-plans/generate-exercises', requestBody, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to generate scheduled exercises from workout plan:', error);
      throw error;
    }
  },

  /**
   * Get workout plan exercises for a specific date
   */
  getExercisesForDate: async (date: string): Promise<ExerciseTemplate[]> => {
    try {
      const response = await axios.get(`/api/workout-plans/exercises/${date}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch workout plan exercises for ${date}:`, error);
      throw error;
    }
  },

  /**
   * Validate workout plan data before creation/update
   */
  validate: async (planData: Partial<WorkoutPlan>): Promise<{ isValid: boolean; errors?: string[] }> => {
    try {
      const response = await axios.post('/api/workout-plans/validate', planData, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to validate workout plan:', error);
      throw error;
    }
  },

  /**
   * Get workout plan statistics
   */
  getStats: async (id: string): Promise<{
    totalExercises: number;
    exercisesPerDay: Record<string, number>;
    totalSets: number;
    totalReps: number;
    averageWeight: number;
    categories: string[];
  }> => {
    try {
      const response = await axios.get(`/api/workout-plans/${id}/stats`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch workout plan stats for ${id}:`, error);
      throw error;
    }
  },

  /**
   * Ensure scheduled exercises are generated for a workout plan if needed
   */
  ensureExercisesGenerated: async (
    workoutPlanId?: string,
    minDaysInAdvance: number = 7
  ): Promise<{ success: boolean; count: number; message?: string }> => {
    try {
      let planId = workoutPlanId;
      
      // If no plan ID provided, get the active plan
      if (!planId) {
        const activePlan = await workoutPlanService.getActive();
        if (!activePlan) {
          throw new Error('No active workout plan found and no workoutPlanId provided');
        }
        planId = activePlan._id || activePlan.id;
      }
      
      const response = await axios.post('/api/workout-plans/ensure-exercises-generated', {
        workoutPlanId: planId,
        minDaysInAdvance
      }, { withCredentials: true });
      
      return response.data;
    } catch (error) {
      console.error('Failed to ensure exercises are generated:', error);
      throw error;
    }
  },

  /**
   * Check if exercise generation is needed for a workout plan
   */
  checkGenerationStatus: async (
    workoutPlanId?: string,
    minDaysInAdvance: number = 7
  ): Promise<{
    needsGeneration: boolean;
    latestGeneratedDate?: string;
    nextTargetDate: string;
    daysToGenerate: number;
  }> => {
    try {
      let planId = workoutPlanId;
      
      // If no plan ID provided, get the active plan
      if (!planId) {
        const activePlan = await workoutPlanService.getActive();
        if (!activePlan) {
          throw new Error('No active workout plan found and no workoutPlanId provided');
        }
        planId = activePlan._id || activePlan.id;
      }
      
      const response = await axios.get(`/api/workout-plans/${planId}/generation-status?minDaysInAdvance=${minDaysInAdvance}`, { 
        withCredentials: true 
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to check generation status:', error);
      throw error;
    }
  },

  /**
   * Update generation policy for a workout plan
   */
  updateGenerationPolicy: async (
    id: string, 
    policy: Partial<ExerciseGenerationPolicy>
  ): Promise<WorkoutPlan> => {
    try {
      const response = await axios.put(`/api/workout-plans/${id}/generation-policy`, policy, { 
        withCredentials: true 
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to update generation policy for workout plan ${id}:`, error);
      throw error;
    }
  },
};
