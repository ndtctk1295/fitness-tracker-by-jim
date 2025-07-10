/**
 * Exercise handler functions for managing exercise state and operations
 */

export interface ExerciseHandlerParams {
  exercises: any[];
  todaysExercises: any[];
  currentExerciseIndex: number;
  currentSet: number;
  setCurrentExerciseIndex: React.Dispatch<React.SetStateAction<number>>;
  setCurrentSet: React.Dispatch<React.SetStateAction<number>>;
  markExerciseCompleted: (id: string) => void;
  markAsUsed: (exerciseId: string) => Promise<void>;
  stopTimer: () => void;
  switchTimerType: () => void;
  toast: any;
}

/**
 * Get details for current exercise
 */
export const getCurrentExerciseDetails = (
  currentExercise: any,
  currentExerciseIndex: number,
  todaysExercises: any[]
) => {
  if (!currentExercise || currentExerciseIndex >= todaysExercises.length) {
    return { sets: 0, reps: 0, weight: 0 };
  }

  const scheduledEx = todaysExercises[currentExerciseIndex];
  return {
    sets: scheduledEx.sets || 3,
    reps: scheduledEx.reps || 10,
    weight: scheduledEx.weight || 0,
  };
};

/**
 * Handle manual exercise completion
 */
export const handleManualCompleteExercise = (
  params: ExerciseHandlerParams,
  exerciseId: string
) => {
  const { exercises, todaysExercises, markExerciseCompleted, markAsUsed, toast } = params;
  
  markExerciseCompleted(exerciseId);
  
  // Track exercise usage in user preferences
  const exerciseToComplete = todaysExercises.find((ex) => ex.id === exerciseId);
  if (exerciseToComplete?.exerciseId) {
    markAsUsed(exerciseToComplete.exerciseId).catch((error: any) => {
      console.error("Failed to update exercise usage:", error);
    });
  }
  
  const exercise = todaysExercises.find((ex) => ex.id === exerciseId);
  const exerciseName = exercise
    ? exercises.find((e: any) => e.id === exercise.exerciseId)?.name || "Exercise"
    : "Exercise";

  toast({
    title: "Exercise Completed!",
    description: `${exerciseName} has been manually marked as completed.`,
  });
};

/**
 * Handle advancing to next exercise or set
 */
export const handleNextSegment = (
  params: ExerciseHandlerParams,
  activeTimer: { isRest: boolean },
  currentExercise: any,
  getCurrentExerciseDetails: () => { sets: number; reps: number; weight: number }
) => {
  const {
    todaysExercises,
    currentExerciseIndex,
    currentSet,
    setCurrentExerciseIndex,
    setCurrentSet,
    markExerciseCompleted,
    markAsUsed,
    stopTimer,
    switchTimerType,
    toast,
    exercises
  } = params;

  // Logic to handle advancing to next exercise or set
  if (activeTimer.isRest) {
    // End of rest period, check if we need to move to next exercise or stay on current
    const currentExDetails = getCurrentExerciseDetails();

    if (currentSet < currentExDetails.sets) {
      // Move to next set of same exercise
      setCurrentSet((prev) => prev + 1);
    } else {
      // All sets completed for current exercise - mark it as completed
      if (todaysExercises[currentExerciseIndex]) {
        const currentScheduledExercise = todaysExercises[currentExerciseIndex];
        markExerciseCompleted(currentScheduledExercise.id);
        
        // Track exercise usage in user preferences
        if (currentScheduledExercise.exerciseId) {
          markAsUsed(currentScheduledExercise.exerciseId).catch((error: any) => {
            console.error("Failed to update exercise usage:", error);
          });
        }

        // Get exercise name for toast
        const exerciseName = currentExercise?.name || "Exercise";

        toast({
          title: "Exercise Completed!",
          description: `${exerciseName} has been marked as completed.`,
        });
      }

      // Move to next exercise and reset set counter
      if (currentExerciseIndex < todaysExercises.length - 1) {
        setCurrentExerciseIndex((prev) => prev + 1);
        setCurrentSet(1);
      } else {
        // End of workout - all exercises completed
        stopTimer();
        toast({
          title: "Workout Complete!",
          description: "You've finished all exercises for today. Great job!",
        });
        return;
      }
    }
  }

  // Switch timer type (rest <-> active)
  switchTimerType();
};
