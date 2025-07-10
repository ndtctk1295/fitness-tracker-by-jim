'use client';

import type { ScheduledExercise } from '@/lib/services/scheduled-exercise-service';

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates a scheduled exercise object before submission to API
 */
export function validateScheduledExercise(
  exercise: Partial<Omit<ScheduledExercise, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>
): ValidationResult {
  const errors: ValidationError[] = [];

  // Required fields
  if (!exercise.exerciseId) {
    errors.push({
      field: 'exerciseId',
      message: 'Exercise is required'
    });
  }

  if (!exercise.categoryId) {
    errors.push({
      field: 'categoryId',
      message: 'Category is required'
    });
  }

  if (!exercise.date) {
    errors.push({
      field: 'date',
      message: 'Date is required'
    });
  } else {
    // Date format validation (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(exercise.date)) {
      errors.push({
        field: 'date',
        message: 'Date must be in YYYY-MM-DD format'
      });
    }
  }

  // Sets validation
  if (exercise.sets !== undefined) {
    if (typeof exercise.sets !== 'number' || exercise.sets <= 0) {
      errors.push({
        field: 'sets',
        message: 'Sets must be a positive number'
      });
    }
  }

  // Reps validation
  if (exercise.reps !== undefined) {
    if (typeof exercise.reps !== 'number' || exercise.reps < 0) {
      errors.push({
        field: 'reps',
        message: 'Reps must be a non-negative number'
      });
    }
  }

  // Weight validation
  if (exercise.weight !== undefined) {
    if (typeof exercise.weight !== 'number' || exercise.weight < 0) {
      errors.push({
        field: 'weight',
        message: 'Weight must be a non-negative number'
      });
    }
  }

  // Weight plates validation
  if (exercise.weightPlates) {
    const invalidPlates = Object.entries(exercise.weightPlates).filter(
      ([plate, count]) => isNaN(Number(plate)) || count < 0
    );

    if (invalidPlates.length > 0) {
      errors.push({
        field: 'weightPlates',
        message: 'Weight plates must have valid weights and non-negative counts'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a batch of scheduled exercises
 */
export function validateScheduledExerciseBatch(
  exercises: Array<Partial<Omit<ScheduledExercise, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>>
): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (exercises.length === 0) {
    errors.push({
      field: 'exercises',
      message: 'At least one exercise is required'
    });
  }
  
  exercises.forEach((exercise, index) => {
    const result = validateScheduledExercise(exercise);
    if (!result.isValid) {
      result.errors.forEach(error => {
        errors.push({
          field: `exercises[${index}].${error.field}`,
          message: error.message
        });
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  
  if (errors.length === 1) {
    return errors[0].message;
  }
  
  return errors.map(err => `- ${err.message}`).join('\n');
}

/**
 * Validates parameters for moving or copying exercises between dates
 */
export function validateDateOperation(
  fromDate: string,
  toDate: string
): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Date format validation for fromDate
  if (!fromDate) {
    errors.push({
      field: 'fromDate',
      message: 'Source date is required'
    });
  } else {
    // Date format validation (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fromDate)) {
      errors.push({
        field: 'fromDate',
        message: 'Source date must be in YYYY-MM-DD format'
      });
    }
  }
  
  // Date format validation for toDate
  if (!toDate) {
    errors.push({
      field: 'toDate',
      message: 'Target date is required'
    });
  } else {
    // Date format validation (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(toDate)) {
      errors.push({
        field: 'toDate',
        message: 'Target date must be in YYYY-MM-DD format'
      });
    }
  }
  
  // Ensure dates are different
  if (fromDate && toDate && fromDate === toDate) {
    errors.push({
      field: 'dates',
      message: 'Source and target dates must be different'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates parameters for batch status update operations
 */
export function validateBatchStatusUpdate(
  ids: string[],
  completed: boolean
): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validate IDs array
  if (!ids || !Array.isArray(ids)) {
    errors.push({
      field: 'ids',
      message: 'Exercise IDs must be provided as an array'
    });
  } else if (ids.length === 0) {
    errors.push({
      field: 'ids',
      message: 'At least one exercise ID must be provided'
    });
  } else {
    // Check that all IDs are valid strings
    const invalidIds = ids.filter(id => !id || typeof id !== 'string' || id.trim() === '');
    if (invalidIds.length > 0) {
      errors.push({
        field: 'ids',
        message: 'All exercise IDs must be valid strings'
      });
    }
  }
  
  // Validate completed is a boolean
  if (typeof completed !== 'boolean') {
    errors.push({
      field: 'completed',
      message: 'Completed status must be a boolean value'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
