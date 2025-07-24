"use client";
import { useEffect } from "react";
import {useExerciseStore} from "../../lib/stores/exercise-store";
import { useScheduledExerciseStore } from "../../lib/stores/scheduled-exercise-store";
import { useWorkoutPlanStore } from "../../lib/stores/workout-plan-store";
export function StoreInit(){
    const { 
    initializeStore: initExerciseStore, 
    initialized: exerciseInitialized, 
    isLoading: exerciseLoading, 
    error: exerciseError
  } = useExerciseStore();
    const { 
    initializeStore: initScheduledStore, 
    initialized: scheduledInitialized, 
    isLoading: scheduledLoading, 
    error: scheduledError
  } = useScheduledExerciseStore();
    const { 
    initializeStore: initWorkoutPlanStore, 
    initialized: workoutPlanInitialized, 
    isLoading: workoutPlanLoading, 
    error: workoutPlanError
  } = useWorkoutPlanStore();
    useEffect(() => {
        initExerciseStore();
        initScheduledStore();
        initWorkoutPlanStore();
    }, [initExerciseStore, initScheduledStore, initWorkoutPlanStore, exerciseInitialized, scheduledInitialized, workoutPlanInitialized, exerciseLoading, scheduledLoading, workoutPlanLoading]);
    return null;
}