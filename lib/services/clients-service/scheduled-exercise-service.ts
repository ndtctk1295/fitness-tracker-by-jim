import axios from 'axios';
import { ScheduledExercise, ScheduledExerciseSet } from '@/lib/types';
import { format } from 'date-fns';

// Re-export types for external consumption
export type { ScheduledExercise, ScheduledExerciseSet } from '@/lib/types';

export const scheduledExerciseService = {
  /**
   * Get all scheduled exercises for the current user
   */  
  getAll: async (): Promise<ScheduledExercise[]> => {
    try {
      const response = await axios.get('/api/scheduled-exercises', { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch scheduled exercises:', error);
      throw error;
    }
  },

  /**
   * Get all scheduled exercises for a specific date
   */  
  getByDate: async (date: string): Promise<ScheduledExercise[]> => {
    try {
      const response = await axios.get(`/api/scheduled-exercises/date/${date}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch scheduled exercises for date ${date}:`, error);
      throw error;
    }
  },
  
  /**
   * Get scheduled exercises for a date range
   */  
  getByDateRange: async (startDate: string, endDate: string): Promise<ScheduledExercise[]> => {
    try {
      const response = await axios.get(`/api/scheduled-exercises?startDate=${startDate}&endDate=${endDate}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch scheduled exercises for date range ${startDate} to ${endDate}:`, error);
      throw error;
    }
  },
  
  /**
   * Get a specific scheduled exercise by ID
   */  
  getById: async (id: string): Promise<ScheduledExercise> => {
    try {
      const response = await axios.get(`/api/scheduled-exercises/${id}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch scheduled exercise ${id}:`, error);
      throw error;
    }
  },
    /**
   * Create a new scheduled exercise
   */    create: async (scheduledExercise: { 
    exerciseId: string;
    categoryId: string;
    workoutPlanId?: string;
    date: string;
    sets?: number;
    reps?: number;
    weight?: number;
    weightPlates?: Record<string, number>;
    notes?: string;
    isHidden?: boolean;
  }): Promise<ScheduledExercise> => {
    try {
      const response = await axios.post('/api/scheduled-exercises', scheduledExercise, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Failed to create scheduled exercise:', error);
      throw error;
    }
  },
  
  /**
   * Create multiple scheduled exercises for a date
   */  
  createMultiple: async (date: string, exercises: Array<{
    exerciseId: string;
    categoryId: string;
    sets: number;
    reps: number;
    weight: number;
    weightPlates?: Record<string, number>;
    notes?: string;
  }>): Promise<ScheduledExercise[]> => {
    try {
      const response = await axios.post(`/api/scheduled-exercises/date/${date}`, { exercises }, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error(`Failed to create scheduled exercises for date ${date}:`, error);
      throw error;
    }
  },
    /**
   * Update an existing scheduled exercise
   */  
  update: async (id: string, scheduledExercise: { 
    exerciseId?: string;
    categoryId?: string;
    date?: string;
    sets?: number;
    reps?: number;
    weight?: number;
    weightPlates?: Record<string, number>;
    notes?: string;
    completed?: boolean;
    completedAt?: string;
    isHidden?: boolean;
  }): Promise<ScheduledExercise> => {
    try {
      const response = await axios.put(`/api/scheduled-exercises/${id}`, scheduledExercise, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      // Enhanced error logging with response details if available
      if (error.response) {
        console.error(`Failed to update scheduled exercise ${id}:`, {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      } else {
        console.error(`Failed to update scheduled exercise ${id}:`, error);
      }
      throw error;
    }
  },
  
  /**
   * Delete a scheduled exercise
   */  
  delete: async (id: string): Promise<void> => {
    try {
      await axios.delete(`/api/scheduled-exercises/${id}`, { withCredentials: true });
    } catch (error) {
      console.error(`Failed to delete scheduled exercise ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete all scheduled exercises for a specific date
   */
  deleteByDate: async (date: string): Promise<void> => {
    try {
      await axios.delete(`/api/scheduled-exercises/date/${date}`, { withCredentials: true });
    } catch (error) {
      console.error(`Failed to delete scheduled exercises for date ${date}:`, error);
      throw error;
    }
  },

  /**
   * Move scheduled exercises from one date to another
   */
  moveExercises: async (fromDate: string, toDate: string): Promise<ScheduledExercise[]> => {
    try {
      const response = await axios.post(
        `/api/scheduled-exercises/move`,
        { fromDate, toDate },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to move scheduled exercises from ${fromDate} to ${toDate}:`, error);
      throw error;
    }
  },

  /**
   * Duplicate scheduled exercises from one date to another
   */
  duplicateExercises: async (fromDate: string, toDate: string): Promise<ScheduledExercise[]> => {
    try {
      const response = await axios.post(
        `/api/scheduled-exercises/duplicate`,
        { fromDate, toDate },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to duplicate exercises from ${fromDate} to ${toDate}:`, error);
      throw error;
    }
  },

  /**
   * Batch update completion status for multiple scheduled exercises
   */
  batchUpdateStatus: async (ids: string[], completed: boolean): Promise<void> => {
    try {
      await axios.patch(
        `/api/scheduled-exercises/batch-status`,
        { ids, completed },
        { withCredentials: true }
      );
    } catch (error) {
      console.error(`Failed to update status for exercises ${ids.join(', ')}:`, error);
      throw error;
    }
  },

  /**
   * Reschedule an exercise with scope handling (this-week or whole-plan)
   */
  rescheduleExercise: async (
    exerciseId: string, 
    newDate: string, 
    scope: 'this-week' | 'whole-plan' = 'this-week',
    options?: {
      workoutPlanStore?: any;
      onTemplateUpdate?: () => Promise<void>;
      onCacheCleared?: () => void;
    }
  ): Promise<void> => {
    try {
      if (scope === 'whole-plan') {
        // Get the exercise to find workout plan info
        const exercise = await scheduledExerciseService.getById(exerciseId);
        
        if (!exercise.workoutPlanId) {
          throw new Error('Exercise is not part of a workout plan');
        }

        if (!options?.workoutPlanStore) {
          throw new Error('Workout plan store is required for whole-plan reschedule');
        }

        await scheduledExerciseService.rescheduleWholePlan(
          exercise,
          newDate,
          options.workoutPlanStore,
          options.onTemplateUpdate,
          options.onCacheCleared
        );
      } else {
        // For this-week scope, just update the specific exercise date
        await scheduledExerciseService.update(exerciseId, { date: newDate });
      }
    } catch (error) {
      console.error(`Failed to reschedule exercise ${exerciseId}:`, error);
      throw error;
    }
  },

  /**
   * Handle whole-plan reschedule logic
   */
  rescheduleWholePlan: async (
    exercise: ScheduledExercise,
    newDate: string,
    workoutPlanStore: any,
    onTemplateUpdate?: () => Promise<void>,
    onCacheCleared?: () => void
  ): Promise<void> => {
    try {
      console.debug(`[scheduled-exercise-service] Performing whole-plan reschedule for workout plan ${exercise.workoutPlanId} from ${exercise.date} to ${newDate}`);
      
      if (!workoutPlanStore.activePlan) {
        throw new Error('No active workout plan found');
      }
      
      // Calculate day of week for source and target dates
      const sourceDate = new Date(exercise.date);
      const targetDateObj = new Date(newDate);
      const sourceDayOfWeek = sourceDate.getDay();
      const targetDayOfWeek = targetDateObj.getDay();
      
      // Create a deep copy of the weekly template
      const updatedWeeklyTemplate = JSON.parse(JSON.stringify(workoutPlanStore.activePlan.weeklyTemplate));
      
      // Find the exercise template in the source day
      const sourceDayTemplate = updatedWeeklyTemplate.find((day: any) => day.dayOfWeek === sourceDayOfWeek);
      if (!sourceDayTemplate) {
        throw new Error(`No template found for day ${sourceDayOfWeek}`);
      }
      
      // Find and remove the exercise template
      const exerciseTemplateIndex = sourceDayTemplate.exerciseTemplates.findIndex((template: any) => 
        String(template.exerciseId) === String(exercise.exerciseId) &&
        template.sets === exercise.sets &&
        template.reps === exercise.reps &&
        template.weight === exercise.weight
      );
      
      if (exerciseTemplateIndex === -1) {
        throw new Error('Exercise template not found in source day');
      }
      
      const exerciseTemplate = sourceDayTemplate.exerciseTemplates[exerciseTemplateIndex];
      sourceDayTemplate.exerciseTemplates.splice(exerciseTemplateIndex, 1);
      
      // Find or create the target day template
      let targetDayTemplate = updatedWeeklyTemplate.find((day: any) => day.dayOfWeek === targetDayOfWeek);
      if (!targetDayTemplate) {
        // Create new day template if it doesn't exist
        targetDayTemplate = {
          dayOfWeek: targetDayOfWeek,
          name: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][targetDayOfWeek],
          exerciseTemplates: []
        };
        updatedWeeklyTemplate.push(targetDayTemplate);
      }
      
      // Add the exercise template to the target day
      const maxOrderIndex = Math.max(0, ...targetDayTemplate.exerciseTemplates.map((t: any) => t.orderIndex || 0));
      exerciseTemplate.orderIndex = maxOrderIndex + 1;
      targetDayTemplate.exerciseTemplates.push(exerciseTemplate);
      
      // Update the workout plan template
      await workoutPlanStore.updatePlan(workoutPlanStore.activePlan.id, {
        weeklyTemplate: updatedWeeklyTemplate
      });
      
      // Call template update callback if provided
      if (onTemplateUpdate) {
        await onTemplateUpdate();
      }
      
      // Update the selected exercise's date
      await scheduledExerciseService.update(exercise._id, { 
        date: newDate 
      });
      console.debug(`[scheduled-exercise-service] Updated selected exercise ${exercise._id} from ${exercise.date} to ${newDate}`);
      
      // Update all future scheduled exercises for this workout plan where completed is false
      await scheduledExerciseService.updateFutureExercisesForWholePlan(
        exercise,
        sourceDate,
        targetDateObj
      );
      
      // Call cache clear callback if provided
      if (onCacheCleared) {
        onCacheCleared();
      }
      
      console.debug('[scheduled-exercise-service] Whole-plan reschedule completed successfully');
    } catch (error) {
      console.error('[scheduled-exercise-service] Failed to reschedule whole plan:', error);
      throw error;
    }
  },

  /**
   * Update all future exercises for a workout plan when doing whole-plan reschedule
   */
  updateFutureExercisesForWholePlan: async (
    exercise: ScheduledExercise,
    sourceDate: Date,
    targetDateObj: Date
  ): Promise<void> => {
    try {
      // Get all future exercises for this workout plan starting from the source date
      const sourceDateStr = format(sourceDate, 'yyyy-MM-dd');
      const response = await axios.get(
        `/api/scheduled-exercises?workoutPlanId=${exercise.workoutPlanId}&startDate=${sourceDateStr}&completed=false`,
        { withCredentials: true }
      );
      const allFutureExercises: ScheduledExercise[] = response.data;
      
      // Filter to get matching exercises from the same workout plan that are not completed
      const futureExercises = allFutureExercises.filter(ex => 
        String(ex.exerciseId) === String(exercise.exerciseId) &&
        ex.sets === exercise.sets &&
        ex.reps === exercise.reps &&
        ex.weight === exercise.weight &&
        ex.workoutPlanId === exercise.workoutPlanId &&
        ex.completed !== true &&
        ex._id !== exercise._id // Exclude the exercise being rescheduled
      );
      
      // Calculate the date shift for each exercise
      const originalDayOfWeek = sourceDate.getDay();
      const newDayOfWeek = targetDateObj.getDay();
      const dayShift = newDayOfWeek - originalDayOfWeek;
      
      // Update each future exercise
      const updatePromises = futureExercises.map(async (futureExercise) => {
        const futureExerciseDate = new Date(futureExercise.date);
        const newFutureDate = new Date(futureExerciseDate);
        newFutureDate.setDate(newFutureDate.getDate() + dayShift);
        const newFutureDateStr = format(newFutureDate, 'yyyy-MM-dd');
        
        try {
          await scheduledExerciseService.update(futureExercise._id, {
            date: newFutureDateStr
          });
        } catch (err) {
          console.error(`Failed to update future exercise ${futureExercise._id}:`, err);
          throw err;
        }
      });
      
      await Promise.all(updatePromises);
      console.debug(`[scheduled-exercise-service] Updated ${futureExercises.length} future exercises for workout plan ${exercise.workoutPlanId} from day ${originalDayOfWeek} to day ${newDayOfWeek} (day shift: ${dayShift})`);
    } catch (error) {
      console.error('[scheduled-exercise-service] Failed to update future exercises:', error);
      throw error;
    }
  },

  /**
   * Regenerate exercises for a workout plan
   */
  regenerateExercisesForPlan: async (workoutPlanId: string): Promise<void> => {
    try {
      const today = new Date();
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      
      // Convert to ISO datetime format (required by the API)
      const startDateStr = today.toISOString();
      const endDateStr = oneYearLater.toISOString();
      
      const response = await fetch('/api/workout-plans/generate-exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutPlanId,
          startDate: startDateStr,
          endDate: endDateStr,
          replaceExisting: true
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to regenerate exercises: ${response.statusText}`);
      }
      
      console.debug('[scheduled-exercise-service] Exercise regeneration completed');
    } catch (error) {
      console.error('[scheduled-exercise-service] Failed to regenerate scheduled exercises:', error);
      // Don't throw here as this is not critical to the reschedule operation
    }
  },

  /**
   * Handle template to scheduled conversion for this-week scope
   */
  convertTemplateToScheduled: async (
    templateExercise: any,
    targetDate: string,
    scope: 'this-week' | 'whole-plan' = 'this-week'
  ): Promise<ScheduledExercise | void> => {
    try {
      if (scope === 'this-week') {
        // Create a temporary scheduled exercise
        const newExercise = await scheduledExerciseService.create({
          exerciseId: templateExercise.exerciseId,
          categoryId: templateExercise.categoryId,
          workoutPlanId: templateExercise.workoutPlanId,
          date: targetDate,
          sets: templateExercise.sets,
          reps: templateExercise.reps,
          weight: templateExercise.weight,
          notes: templateExercise.notes,
        });
        
        // Create an override entry for the source date to hide the template exercise
        if (templateExercise.date) {
          await scheduledExerciseService.create({
            exerciseId: templateExercise.exerciseId,
            categoryId: templateExercise.categoryId,
            workoutPlanId: templateExercise.workoutPlanId,
            date: templateExercise.date,
            sets: 0,
            reps: 0,
            weight: 0,
            notes: 'Hidden (moved to another date)',
            isHidden: true
          });
        }
        
        return newExercise;
      } else {
        // For whole-plan scope, this would be handled by rescheduleWholePlan
        throw new Error('Use rescheduleWholePlan for whole-plan scope template conversion');
      }
    } catch (error) {
      console.error('[scheduled-exercise-service] Failed to convert template to scheduled:', error);
      throw error;
    }
  },
};
