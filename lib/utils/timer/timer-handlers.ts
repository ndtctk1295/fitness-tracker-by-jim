import { TimerStrategy } from '@/lib/services/clients-service/timer-strategy-service';
import { createExpiryTimestamp, playTimerEndSound } from '@/lib/utils/timer';

/**
 * Timer handler functions for managing timer state and operations
 */

export interface ActiveTimerState {
  isActive: boolean;
  isPaused: boolean;
  isRest: boolean;
  startTime: number | null;
  currentStrategyId: string | null;
  scheduledDate: string | null;
  elapsedTime: number;
}

export interface TimerHandlerParams {
  timerStrategies: TimerStrategy[];
  activeTimer: ActiveTimerState;
  setActiveTimer: React.Dispatch<React.SetStateAction<ActiveTimerState>>;
  currentStrategyRef: React.MutableRefObject<any>;
  restart: (expiryTime: Date, autoStart?: boolean) => void;
  pause: () => void;
  resume: () => void;
  isSoundEnabled: boolean;
  toast: any;
}

/**
 * Start a timer with the specified strategy
 */
export const startTimer = (
  params: TimerHandlerParams,
  strategyId: string,
  isRest: boolean,
  date: string
) => {
  const { timerStrategies, setActiveTimer, currentStrategyRef, restart } = params;
  const strategy = timerStrategies.find((s) => s._id === strategyId);
  if (!strategy) return;

  currentStrategyRef.current = strategy;
  const duration = isRest ? strategy.restDuration : strategy.activeDuration;
  const expiryTime = createExpiryTimestamp(duration);

  setActiveTimer({
    isActive: true,
    isPaused: false,
    isRest,
    startTime: Date.now(),
    currentStrategyId: strategyId,
    scheduledDate: date,
    elapsedTime: 0,
  });

  restart(expiryTime, true); // Start the timer immediately
};

/**
 * Pause the timer
 */
export const pauseTimer = (params: TimerHandlerParams) => {
  const { pause, setActiveTimer } = params;
  pause(); // Pause the react-timer-hook timer

  setActiveTimer((prev) => ({
    ...prev,
    isPaused: true, // Set paused state to true, but keep isActive true
  }));
};

/**
 * Resume the timer
 */
export const resumeTimer = (params: TimerHandlerParams) => {
  const { resume, setActiveTimer } = params;
  resume(); // Resume the react-timer-hook timer

  setActiveTimer((prev) => ({
    ...prev,
    isPaused: false, // Set paused state to false
  }));
};

/**
 * Stop the timer and reset state
 */
export const stopTimer = (params: TimerHandlerParams, initialActiveTimer: ActiveTimerState) => {
  const { pause, setActiveTimer } = params;
  pause(); // Stop the react-timer-hook timer
  setActiveTimer(initialActiveTimer);
};

/**
 * Switch between rest and active timer
 */
export const switchTimerType = (params: TimerHandlerParams) => {
  const { activeTimer, currentStrategyRef, setActiveTimer, restart } = params;
  const currentStrategy = currentStrategyRef.current;
  if (!currentStrategy) return;

  const newIsRest = !activeTimer.isRest;
  const duration = newIsRest
    ? currentStrategy.restDuration
    : currentStrategy.activeDuration;
  const expiryTime = createExpiryTimestamp(duration);

  setActiveTimer((prev) => ({
    ...prev,
    isRest: newIsRest,
  }));

  restart(expiryTime, true); // Start the new timer segment immediately
};

/**
 * Handle starting the timer with validation
 */
export const handleStartTimer = (
  params: TimerHandlerParams,
  selectedStrategyId: string,
  todaysExercises: any[],
  today: string,
  setCurrentExerciseIndex: React.Dispatch<React.SetStateAction<number>>,
  setCurrentSet: React.Dispatch<React.SetStateAction<number>>
) => {
  const { toast } = params;
  
  if (todaysExercises.length === 0) {
    toast({
      title: "No exercises scheduled",
      description: "Please schedule exercises for today before starting the timer.",
      variant: "destructive",
    });
    return;
  }

  startTimer(params, selectedStrategyId, false, today);
  setCurrentExerciseIndex(0);
  setCurrentSet(1);
};

/**
 * Handle pausing the timer
 */
export const handlePauseTimer = (params: TimerHandlerParams) => {
  pauseTimer(params);
};

/**
 * Handle resuming the timer
 */
export const handleResumeTimer = (params: TimerHandlerParams) => {
  resumeTimer(params);
};

/**
 * Handle stopping the timer and resetting state
 */
export const handleStopTimer = (
  params: TimerHandlerParams,
  initialActiveTimer: ActiveTimerState,
  setCurrentExerciseIndex: React.Dispatch<React.SetStateAction<number>>,
  setCurrentSet: React.Dispatch<React.SetStateAction<number>>
) => {
  stopTimer(params, initialActiveTimer);
  setCurrentExerciseIndex(0);
  setCurrentSet(1);
};

/**
 * Skip to end of current timer segment
 */
export const skipToEnd = (
  params: TimerHandlerParams,
  activeTimer: ActiveTimerState,
  handleNextSegment: () => void
) => {
  const { isSoundEnabled } = params;
  // Play sound to indicate skipped timer
  playTimerEndSound(isSoundEnabled);

  // Handle completion based on current timer state
  if (activeTimer.isRest) {
    // Skip rest period and move to active timer
    handleNextSegment();
  } else {
    // Skip active period and move to rest
    handleNextSegment();
  }
};
