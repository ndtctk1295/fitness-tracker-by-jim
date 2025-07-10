'use client';

import { useReducer, useCallback } from 'react';
import { getTodayString } from '@/lib/utils/date-utils';

// Define the state interface
interface TimerPageState {
  today: string;
  selectedDate: string;
  currentExerciseIndex: number;
  currentSet: number;
  soundTested: boolean;
}

// Define action types
type TimerPageAction =
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_CURRENT_EXERCISE_INDEX'; payload: number }
  | { type: 'SET_CURRENT_SET'; payload: number }
  | { type: 'MARK_SOUND_TESTED' }
  | { type: 'RESET_EXERCISE_TRACKING' }
  | { type: 'ADVANCE_SET' }
  | { type: 'ADVANCE_EXERCISE' };

// Define reducer function to handle state changes
function timerPageReducer(state: TimerPageState, action: TimerPageAction): TimerPageState {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload };
      
    case 'SET_CURRENT_EXERCISE_INDEX':
      return { ...state, currentExerciseIndex: action.payload };
      
    case 'SET_CURRENT_SET':
      return { ...state, currentSet: action.payload };
      
    case 'MARK_SOUND_TESTED':
      return { ...state, soundTested: true };
      
    case 'RESET_EXERCISE_TRACKING':
      return { ...state, currentExerciseIndex: 0, currentSet: 1 };
      
    case 'ADVANCE_SET':
      return { ...state, currentSet: state.currentSet + 1 };
      
    case 'ADVANCE_EXERCISE':
      return { ...state, currentExerciseIndex: state.currentExerciseIndex + 1, currentSet: 1 };
      
    default:
      return state;
  }
}

/**
 * Custom hook for managing timer page state using reducer pattern
 * Provides a more organized way to handle multiple related state values
 */
export function useTimerPageState() {
  // Use a stable value for today's date that won't change during hydration
  // and store it in a variable that can be referenced consistently
  const today = getTodayString();
  
  // Initialize state with useReducer
  const [state, dispatch] = useReducer(timerPageReducer, {
    today,
    selectedDate: today,
    currentExerciseIndex: 0,
    currentSet: 1,
    soundTested: false
  });

  // Create setState-like API functions that support both direct values and functional updates
  const setSelectedDate = useCallback((date: string | ((prev: string) => string)) => {
    if (typeof date === 'function') {
      dispatch({ type: 'SET_DATE', payload: date(state.selectedDate) });
    } else {
      dispatch({ type: 'SET_DATE', payload: date });
    }
  }, [state.selectedDate]);

  const setCurrentExerciseIndex = useCallback((index: number | ((prev: number) => number)) => {
    if (typeof index === 'function') {
      dispatch({ type: 'SET_CURRENT_EXERCISE_INDEX', payload: index(state.currentExerciseIndex) });
    } else {
      dispatch({ type: 'SET_CURRENT_EXERCISE_INDEX', payload: index });
    }
  }, [state.currentExerciseIndex]);

  const setCurrentSet = useCallback((set: number | ((prev: number) => number)) => {
    if (typeof set === 'function') {
      dispatch({ type: 'SET_CURRENT_SET', payload: set(state.currentSet) });
    } else {
      dispatch({ type: 'SET_CURRENT_SET', payload: set });
    }
  }, [state.currentSet]);

  // Additional semantic helper functions for common operations
  const markSoundTested = useCallback(() => {
    dispatch({ type: 'MARK_SOUND_TESTED' });
  }, []);

  const resetExerciseTracking = useCallback(() => {
    dispatch({ type: 'RESET_EXERCISE_TRACKING' });
  }, []);

  const advanceSet = useCallback(() => {
    dispatch({ type: 'ADVANCE_SET' });
  }, []);

  const advanceExercise = useCallback(() => {
    dispatch({ type: 'ADVANCE_EXERCISE' });
  }, []);

  return {
    ...state,
    setSelectedDate,
    setCurrentExerciseIndex,
    setCurrentSet,
    markSoundTested,
    resetExerciseTracking,
    advanceSet,
    advanceExercise
  };
}
