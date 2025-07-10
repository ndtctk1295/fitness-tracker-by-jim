'use client';

import React, { useEffect, useRef, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExerciseList } from './ExerciseList';

// Define proper TypeScript interfaces
interface MemoizedExerciseListProps {
  title: string;
  description: string;
  exercises: any[];
  scheduledExercises: any[];
  categories: any[];
  orderedExerciseIds: string[];
  currentExerciseIndex: number;
  currentSet?: number;
  sensors: any;
  handleDragEnd: (event: any) => void;
  isTimerActive: boolean;
  orderedExercises: any[]; // Use pre-calculated ordered exercises instead of getter function
}

/**
 * MemoizedExerciseList component - A wrapper for the ExerciseList component
 * This prevents unnecessary re-renders of the ExerciseList
 */
const MemoizedExerciseList = React.memo(
  ({ 
    title, 
    description, 
    exercises, 
    scheduledExercises, 
    categories, 
    orderedExerciseIds, 
    currentExerciseIndex, 
    currentSet, 
    sensors, 
    handleDragEnd, 
    isTimerActive, 
    orderedExercises   }: MemoizedExerciseListProps) => {
    return (
      <ExerciseList
        title={title}
        description={description}
        exercises={exercises}
        scheduledExercises={scheduledExercises}
        categories={categories}
        orderedExerciseIds={orderedExerciseIds}
        currentExerciseIndex={currentExerciseIndex}
        currentSet={currentSet}
        sensors={sensors}
        handleDragEnd={handleDragEnd}
        isTimerActive={isTimerActive}
        orderedExercises={orderedExercises}
      />
    );
  },
  // Custom equality function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Check primitive props for equality
    if (prevProps.title !== nextProps.title) return false;
    if (prevProps.description !== nextProps.description) return false;
    if (prevProps.isTimerActive !== nextProps.isTimerActive) return false;
    if (prevProps.currentExerciseIndex !== nextProps.currentExerciseIndex) return false;
    if (prevProps.currentSet !== nextProps.currentSet) return false;
    
    // Check if orderedExerciseIds array has changed
    if (prevProps.orderedExerciseIds.length !== nextProps.orderedExerciseIds.length) return false;
    if (prevProps.orderedExerciseIds.some((id, i) => id !== nextProps.orderedExerciseIds[i])) return false;
    
    // Skip deep comparison of complex objects that rarely change
    // For exercises, categories, etc., we'll rely on reference equality
    
    // Consider props equal (don't re-render) if we reach this point
    return true;
  }
);

// Define interface for TimerSetup props
interface MemoizedTimerSetupProps {
  timerStrategies: any[];
  selectedStrategyId: string;
  setSelectedStrategyId: (id: string) => void;
  handleStartTimer: () => void;
  soundPermissionStatus: string;
  todaysExercisesCount: number;
}

/**
 * MemoizedTimerSetup component - A wrapper for the TimerSetup component
 * This prevents unnecessary re-renders of the TimerSetup
 */
const MemoizedTimerSetup = React.memo(
  ({ 
    timerStrategies, 
    selectedStrategyId, 
    setSelectedStrategyId, 
    handleStartTimer, 
    soundPermissionStatus, 
    todaysExercisesCount 
  }: MemoizedTimerSetupProps) => {    // Import the TimerSetup component with dynamic import to avoid circular dependencies
    // Using proper TypeScript import
    const { TimerSetup } = require('@/components/timer/TimerSetup');
    
    return (
      <TimerSetup
        timerStrategies={timerStrategies}
        selectedStrategyId={selectedStrategyId}
        setSelectedStrategyId={setSelectedStrategyId}
        handleStartTimer={handleStartTimer}
        soundPermissionStatus={soundPermissionStatus}
        todaysExercisesCount={todaysExercisesCount}
      />
    );
  }
);

// Define interface for ActiveTimer props
interface MemoizedActiveTimerProps {
  strategy: any;
  activeTimer: any;
  currentExercise: any;
  currentExerciseCategory: any;
  currentSet: number;
  getCurrentExerciseDetails: () => any;
  orderedExercises: any[];
  currentExerciseIndex: number;
  exercises: any[];
  categories: any[];
  displayTime: string;
  percentComplete: number;
  isRunning: boolean;
  minutes: number;
  seconds: number;
  handlePauseTimer: () => void;
  handleResumeTimer: () => void;
  handleNextSegment: () => void;
  skipToEnd: () => void;
  handleStopTimer: () => void;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  testSound: () => void;
  toast: any;
}

/**
 * MemoizedActiveTimer component - A wrapper for the ActiveTimer component
 * This prevents unnecessary re-renders of the ActiveTimer
 */
const MemoizedActiveTimer = React.memo(
  ({ 
    strategy,
    activeTimer,
    currentExercise,
    currentExerciseCategory,
    currentSet,
    getCurrentExerciseDetails,
    orderedExercises,
    currentExerciseIndex,
    exercises,
    categories,
    displayTime,
    percentComplete,
    isRunning,
    minutes,
    seconds,
    handlePauseTimer,
    handleResumeTimer,
    handleNextSegment,
    skipToEnd,
    handleStopTimer,
    isSoundEnabled,
    setIsSoundEnabled,
    testSound,
    toast
  }: MemoizedActiveTimerProps) => {
    // Import the ActiveTimer component here to avoid circular dependencies
    const ActiveTimer = require('@/components/timer/ActiveTimer').ActiveTimer;
    
    return (
      <ActiveTimer
        strategy={strategy}
        activeTimer={activeTimer}
        currentExercise={currentExercise}
        currentExerciseCategory={currentExerciseCategory}
        currentSet={currentSet}
        getCurrentExerciseDetails={getCurrentExerciseDetails}
        orderedExercises={orderedExercises}
        currentExerciseIndex={currentExerciseIndex}
        exercises={exercises}
        categories={categories}
        displayTime={displayTime}
        percentComplete={percentComplete}
        isRunning={isRunning}
        minutes={minutes}
        seconds={seconds}
        handlePauseTimer={handlePauseTimer}
        handleResumeTimer={handleResumeTimer}
        handleNextSegment={handleNextSegment}
        skipToEnd={skipToEnd}
        handleStopTimer={handleStopTimer}
        isSoundEnabled={isSoundEnabled}
        setIsSoundEnabled={setIsSoundEnabled}
        testSound={testSound}
        toast={toast}
      />
    );
  }
);

// Export the memoized components
export { MemoizedExerciseList, MemoizedTimerSetup, MemoizedActiveTimer };
