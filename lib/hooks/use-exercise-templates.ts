'use client';

import { useState } from 'react';
import { useExerciseStore } from '@/lib/stores/exercise-store';
import { useScheduledExerciseStore } from '@/lib/stores/scheduled-exercise-store';
import { useToast } from '@/lib/hooks/use-toast';
import { format } from 'date-fns';
import { scheduledExerciseService } from '@/lib/services/clients-service/scheduled-exercise-service';
import { ExerciseTemplate } from '@/lib/types';

/**
 * Custom hook for managing exercise templates and batch operations
 */
export function useExerciseTemplates() {  const { 
    exercises, 
    categories,
    isLoading: exerciseLoading,
    error: exerciseError
  } = useExerciseStore();

  const {
    scheduledExercises,
    isLoading: scheduledLoading,
    error: scheduledError,
    addScheduledExercise
  } = useScheduledExerciseStore();
  
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ExerciseTemplate[]>([]);
  const [localIsLoading, setLocalIsLoading] = useState(false);
  
  /**
   * Add a template to the list
   */
  const addTemplate = (template: ExerciseTemplate) => {
    setTemplates(current => [...current, template]);
  };
  
  /**
   * Remove a template from the list
   */
  const removeTemplate = (index: number) => {
    setTemplates(current => current.filter((_, i) => i !== index));
  };
  
  /**
   * Clear all templates
   */
  const clearTemplates = () => {
    setTemplates([]);
  };
  
  /**
   * Apply all templates to a specific date
   */
  const applyTemplatesToDate = async (date: Date) => {
    if (templates.length === 0) {
      toast({
        title: "No templates",
        description: "You need to add templates first",
        variant: "destructive"
      });
      return;
    }
      setLocalIsLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Use the scheduled exercise service to create multiple exercises
      const exercisesToCreate = templates.map(template => ({
        exerciseId: template.exerciseId,
        categoryId: template.categoryId,
        sets: template.sets,
        reps: template.reps,
        weight: template.weight,
        weightPlates: template.weightPlates,
        notes: template.notes
      }));
      
      await scheduledExerciseService.createMultiple(formattedDate, exercisesToCreate);
      toast({
        title: "Success",
        description: `Applied ${templates.length} exercise templates to ${format(date, 'MMMM d, yyyy')}`,
      });
    } catch (error) {
      console.error('Error applying templates:', error);
      toast({
        title: "Error",
        description: "Failed to apply templates",
        variant: "destructive"
      });
    } finally {
      setLocalIsLoading(false);
    }
  };
  
  /**
   * Copy exercises from one date to another
   */  const copyExercises = async (fromDate: Date, toDate: Date) => {
    setLocalIsLoading(true);
    try {
      const formattedFromDate = format(fromDate, 'yyyy-MM-dd');
      const formattedToDate = format(toDate, 'yyyy-MM-dd');
      
      // Use the scheduled exercise service to duplicate exercises
      await scheduledExerciseService.duplicateExercises(formattedFromDate, formattedToDate);
      toast({
        title: "Success",
        description: `Copied exercises from ${format(fromDate, 'MMM d')} to ${format(toDate, 'MMM d')}`,
      });
    } catch (error) {
      console.error('Error copying exercises:', error);
      toast({
        title: "Error",
        description: "Failed to copy exercises",
        variant: "destructive"
      });
    } finally {
      setLocalIsLoading(false);
    }
  };
  
  /**
   * Save current exercises as templates
   */
  const saveExercisesAsTemplates = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const exercises = scheduledExercises.filter((ex: any) => ex.date === formattedDate);
    
    if (exercises.length === 0) {
      toast({
        title: "No exercises",
        description: "No exercises found for this date",
        variant: "destructive"
      });
      return;
    }
    
    const newTemplates = exercises.map((ex: any) => ({
      exerciseId: ex.exerciseId,
      categoryId: ex.categoryId,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      weightPlates: ex.weightPlates,
      notes: ex.notes
    }));
    
    setTemplates(newTemplates);
    toast({
      title: "Templates saved",
      description: `Saved ${newTemplates.length} exercises as templates`,
    });
  };
  
  return {
    templates,
    addTemplate,
    removeTemplate,
    clearTemplates,
    applyTemplatesToDate,
    copyExercises,
    saveExercisesAsTemplates,
    templatesCount: templates.length,    isLoading: exerciseLoading || scheduledLoading || localIsLoading,
    exercises,
    categories,
    error: exerciseError || scheduledError
  };
}
