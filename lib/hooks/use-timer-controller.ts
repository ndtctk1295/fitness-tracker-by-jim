'use client';

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { useTimer as useReactTimer } from 'react-timer-hook';
import { useToast } from '@/components/ui/use-toast';
import { useTimerSound } from '@/lib/hooks/use-timer-sound';

interface TimerControllerProps {
  activeTimer: {
    currentStrategyId: string | null;
    isActive: boolean;
    isRest: boolean;
    scheduledDate?: string;
  };
  selectedStrategy: {
    id: string;
    name: string;
    color: string;
    activeDuration: number;
    restDuration: number;
  } | undefined;
  startTimer: (strategyId: string, isRest: boolean, date: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  switchTimerType: () => void;
  selectedDate: string;
  orderedExercises: any[];
  currentExerciseIndex: number;
  setCurrentExerciseIndex: Dispatch<SetStateAction<number>>;
  currentSet: number;
  setCurrentSet: Dispatch<SetStateAction<number>>;
  getCurrentExerciseDetails: () => { sets: number; reps: number; weight: number };
}

/**
 * Custom hook for timer control logic
 */
export function useTimerController({
  activeTimer,
  selectedStrategy,
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  switchTimerType,
  selectedDate,
  orderedExercises,
  currentExerciseIndex,
  setCurrentExerciseIndex,
  currentSet,
  setCurrentSet,
  getCurrentExerciseDetails,
}: TimerControllerProps) {
  const { toast } = useToast();
  const {
    isSoundEnabled,
    playTimerCompleteSound,
  } = useTimerSound();
  // Setup timer with react-timer-hook
  const getExpiryTimestamp = useCallback((seconds: number): Date => {
    const time = new Date();
    time.setSeconds(time.getSeconds() + seconds);
    return time;
  }, []);

  const getDurationForCurrentPhase = useCallback(() => {
    if (!selectedStrategy) return 60; // Default to 60 seconds
    return activeTimer.isRest
      ? selectedStrategy.restDuration
      : selectedStrategy.activeDuration;
  }, [activeTimer.isRest, selectedStrategy]);

  // Initialize the timer hook
  const {
    seconds,
    minutes,
    isRunning,
    pause,
    resume,
    restart
  } = useReactTimer({
    expiryTimestamp: getExpiryTimestamp(getDurationForCurrentPhase()),
    autoStart: false,
    onExpire: () => {
      if (isSoundEnabled) {
        playTimerCompleteSound();
      }
      toast({
        title: "Time's up!",
        description: `${activeTimer.isRest ? "Rest" : "Work"} period completed.`,
      });
    }
  } as any); // Type cast to avoid TS errors with library types

  // Format time for display
  const displayTime = () => {
    const minStr = String(minutes).padStart(2, '0');
    const secStr = String(seconds).padStart(2, '0');
    return `${minStr}:${secStr}`;
  };

  // Calculate percentage completion
  const percentComplete = () => {
    if (!selectedStrategy) return 0;

    const totalDuration = getDurationForCurrentPhase();
    const elapsed = totalDuration - (minutes * 60 + seconds);
    return Math.min(100, (elapsed / totalDuration) * 100);
  };
  // Start initial workout segment (active period)
  const handleStartTimer = useCallback(() => {
    if (!selectedStrategy) return;
    startTimer(selectedStrategy.id, false, selectedDate); // Start with workout period
    restart(getExpiryTimestamp(getDurationForCurrentPhase()), true); // Start the timer
  }, [startTimer, selectedStrategy, selectedDate, restart, getExpiryTimestamp, getDurationForCurrentPhase]);

  // Pause the timer
  const handlePauseTimer = useCallback(() => {
    pauseTimer();
    pause(); // Pause react-timer-hook timer
  }, [pauseTimer, pause]);

  // Resume the timer
  const handleResumeTimer = useCallback(() => {
    resumeTimer();
    resume(); // Resume react-timer-hook timer
  }, [resumeTimer, resume]);

  // Skip to the end of the current segment
  const skipToEnd = useCallback(() => {
    restart(getExpiryTimestamp(0), true);
  }, [restart, getExpiryTimestamp]);

  // Move to next phase: rest -> workout or workout -> rest
  const handleNextSegment = useCallback(() => {
    switchTimerType();

    // If switching from rest to workout, we might need to advance the exercise or set
    if (activeTimer.isRest) {
      // We're moving from rest to workout, so increment set or exercise
      const currentDetails = getCurrentExerciseDetails();

      if (currentSet < currentDetails.sets) {
        // Move to next set of the same exercise
        setCurrentSet(currentSet + 1);
      } else if (currentExerciseIndex < orderedExercises.length - 1) {
        // Move to first set of next exercise
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSet(1);
      }
      // Otherwise we're done with all exercises
    }

    // Reset and start the timer with new duration
    restart(getExpiryTimestamp(getDurationForCurrentPhase()), true);
  }, [
    switchTimerType,
    activeTimer.isRest,
    getCurrentExerciseDetails,
    currentSet,
    setCurrentSet,
    currentExerciseIndex,
    orderedExercises.length,
    setCurrentExerciseIndex,
    restart,
    getExpiryTimestamp,
    getDurationForCurrentPhase
  ]);

  // Stop the timer completely
  const handleStopTimer = useCallback(() => {
    stopTimer();
    pause(); // Stop the react-timer-hook timer
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
  }, [stopTimer, pause, setCurrentExerciseIndex, setCurrentSet]);

  // Effect to update timer when the activeTimer state changes
  useEffect(() => {
    // If activeTimer is active but the timer isn't running, restart it
    if (activeTimer.isActive && !isRunning) {
      restart(getExpiryTimestamp(getDurationForCurrentPhase()), true);
    } else if (!activeTimer.isActive && isRunning) {
      pause();
    }
  }, [activeTimer.isActive, activeTimer.isRest, selectedStrategy, isRunning, restart, getExpiryTimestamp, getDurationForCurrentPhase, pause]);

  return {
    seconds,
    minutes,
    isRunning,
    displayTime,
    percentComplete,
    handleStartTimer,
    handlePauseTimer,
    handleResumeTimer,
    handleNextSegment,
    skipToEnd,
    handleStopTimer
  };
}
