"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { format } from "date-fns";
import { AlertCircle, Loader2 } from "lucide-react";
import { useTimer } from "react-timer-hook";
import {
  useSensors,
  useSensor,
  PointerSensor,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatTime } from "@/lib/stores/timer-store";
import { useExerciseStore } from "@/lib/stores/exercise-store";
import { useUserExercisePreferenceStore } from "@/lib/stores/user-exercise-preference-store";
import { useScheduledExerciseStore } from "@/lib/stores/scheduled-exercise-store";
import { TimerSetup } from "@/components/timer/TimerSetup";
import { ActiveTimer } from "@/components/timer/ActiveTimer";
import { MemoizedExerciseList } from "@/components/timer/MemoizedComponents";
import { useToast } from "@/lib/hooks/use-toast";
import {
  timerStrategyService,
  TimerStrategy,
} from "@/lib/services/timer-strategy-service";
import {
  createExpiryTimestamp,
  testSound,
  playTimerEndSound,
  checkAudioPermission,
  displayTime,
  calculatePercentComplete,
  ActiveTimerState,
  TimerHandlerParams,
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  switchTimerType,
  handleStartTimer,
  handlePauseTimer,
  handleResumeTimer,
  handleStopTimer,
  skipToEnd,
  ExerciseHandlerParams,
  getCurrentExerciseDetails,
  handleManualCompleteExercise,
  handleNextSegment,
  fetchTimerStrategies,
  setupAudioPermissions,
  createDragSensors,
  handleDragEnd,
} from "@/lib/utils/timer";

const initialActiveTimer: ActiveTimerState = {
  isActive: false,
  isPaused: false,
  isRest: false,
  startTime: null,
  currentStrategyId: null,
  scheduledDate: null,
  elapsedTime: 0,
};

export default function TimerPage() {
  const { toast } = useToast();
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>("");
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isAutoSwitchEnabled, setIsAutoSwitchEnabled] = useState(true); // Controls auto switching between rest/active
  const [soundPermissionStatus, setSoundPermissionStatus] =
    useState<string>("unchecked");
  const [timerStrategies, setTimerStrategies] = useState<TimerStrategy[]>([]);
  const [activeTimer, setActiveTimer] =
    useState<ActiveTimerState>(initialActiveTimer);
  const [isLoading, setIsLoading] = useState(true); // Get exercise data from store
  const {
    exercises,
    isLoading: isExerciseLoading,
    error: exerciseError,
  } = useExerciseStore();
  const {
    preferences,
    markAsUsed,
    isLoading: isPreferencesLoading,
    error: preferencesError,
  } = useUserExercisePreferenceStore();
  const {
    scheduledExercises,
    calendarView,
    initialized: scheduledInitialized,
    isLoading: isScheduledLoading,
    error: scheduledError,
    markExerciseCompleted,
  } = useScheduledExerciseStore();
  // Set today's date for fetching exercises
  const today = format(new Date(), "yyyy-MM-dd");
  // Filter scheduled exercises for today
  const todaysExercises = scheduledExercises.filter(
    (ex: any) => ex.date === today
  );

  // Calculate completed exercises count
  const todaysCompletedExercisesCount = useMemo(() => {
    return todaysExercises.filter((ex: any) => ex.completed === true).length;
  }, [todaysExercises]);

  // Add a state to track the order of exercises (client-side only)
  // Initialize with empty array
  const [orderedExerciseIds, setOrderedExerciseIds] = useState<string[]>([]);

  // Use a ref to track if we've loaded the IDs initially
  const initialIdsLoadedRef = useRef(false);

  // Update orderedExerciseIds ONLY when todaysExercises changes AND we haven't loaded yet
  useEffect(() => {
    if (todaysExercises.length > 0 && !initialIdsLoadedRef.current) {
      // Set the IDs only once when exercises are available
      setOrderedExerciseIds(todaysExercises.map((ex: any) => ex.id));
      initialIdsLoadedRef.current = true;
    }
  }, [todaysExercises]);

  // Create ordered exercises list based on the orderedExerciseIds
  const orderedExercises = useMemo(() => {
    if (orderedExerciseIds.length === 0) return todaysExercises;

    // Create a map for O(1) lookup
    const exerciseMap = new Map(todaysExercises.map((ex: any) => [ex.id, ex]));

    // Return exercises in the order specified by orderedExerciseIds
    return orderedExerciseIds
      .filter((id) => exerciseMap.has(id)) // Only include IDs that exist in todaysExercises
      .map((id) => exerciseMap.get(id));
  }, [orderedExerciseIds, todaysExercises]);

  // Create a ref to store the current timer strategy
  const currentStrategyRef = useRef<any>(null);

  // Setup DnD sensors for proper drag and drop
  const sensors = createDragSensors(
    useSensors,
    useSensor,
    PointerSensor,
    MouseSensor,
    TouchSensor
  );

  // Implement the drag end handler
  const handleDragEndWrapper = useCallback(
    (event: any) => {
      handleDragEnd(event, setOrderedExerciseIds, toast);
    },
    [toast]
  );

  // Set up the timer using react-timer-hook
  const { seconds, minutes, isRunning, start, pause, resume, restart } =
    useTimer({
      expiryTimestamp: new Date(),
      onExpire: () => handleTimerComplete(),
      autoStart: false,
    });
  // Handle timer completion
  const handleTimerComplete = () => {
    playTimerEndSound(isSoundEnabled);

    // Prepare next phase information to show in toast
    const nextPhase = activeTimer.isRest ? "exercise set" : "rest period";

    // Notify user that timer is complete with different messages based on auto-switch setting
    if (isAutoSwitchEnabled) {
      toast({
        title: activeTimer.isRest ? "Rest Complete!" : "Set Complete!",
        description: `Automatically advancing to next ${nextPhase}...`,
      });

      // Auto-advance to next segment
      if (todaysExercises.length > 0) {
        handleNextSegmentWrapper();
      }
    } else {
      toast({
        title: activeTimer.isRest ? "Rest Complete!" : "Set Complete!",
        description: `Click Next to start ${nextPhase}`,
        duration: 5000, // Keep notification visible longer when manual action is needed
      });
      // In manual mode, the user will click the Next button themselves
    }
  };

  // Fetch timer strategies from API
  useEffect(() => {
    fetchTimerStrategies(setTimerStrategies, setIsLoading, setSelectedStrategyId, selectedStrategyId, toast);
  }, [toast]);

  // Check for audio permission
  useEffect(() => {
    setupAudioPermissions(setSoundPermissionStatus);
  }, []);
  // Update timer expiry time when strategy or timer type changes
  useEffect(() => {
    if (
      activeTimer.isActive &&
      !activeTimer.isPaused &&
      activeTimer.currentStrategyId
    ) {
      const strategy = timerStrategies.find(
        (s) => s._id === activeTimer.currentStrategyId
      );
      if (strategy) {
        currentStrategyRef.current = strategy;
        const duration = activeTimer.isRest
          ? strategy.restDuration
          : strategy.activeDuration;

        // Create a new expiry time based on the strategy duration
        const expiryTime = createExpiryTimestamp(duration);

        // Restart the timer with the new expiry time
        restart(expiryTime, true);
      }
    }
  }, [
    activeTimer.isActive,
    activeTimer.isRest,
    activeTimer.currentStrategyId,
    timerStrategies,
    restart,
  ]);

  // Combine loading states
  const isPageLoading = isLoading || isExerciseLoading;

  // Display loading state when data is being fetched
  if (isPageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading timer data...</p>
      </div>
    );
  }

  // Display error state if there's any error with exercise data
  if (exerciseError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was a problem loading exercise data. Please try refreshing the
          page.
        </AlertDescription>
      </Alert>
    );
  }

  // Get current timer strategy
  const currentStrategy = activeTimer.currentStrategyId
    ? timerStrategies.find((s) => s._id === activeTimer.currentStrategyId)
    : timerStrategies.find((s) => s._id === selectedStrategyId);
  // Get current exercise based on index
  const currentExercise = todaysExercises[currentExerciseIndex]
    ? exercises.find(
        (e: any) => e.id === todaysExercises[currentExerciseIndex].exerciseId
      )
    : null;

  // Get category for current exercise
  const currentExerciseCategory = currentExercise
    ? {
        id: currentExercise.categoryId,
        name: currentExercise.name,
        color: "#3b82f6",
      }
    : null;

  // Create timer handler parameters object
  const timerHandlerParams: TimerHandlerParams = {
    timerStrategies,
    activeTimer,
    setActiveTimer,
    currentStrategyRef,
    restart,
    pause,
    resume,
    isSoundEnabled,
    toast,
  };

  // Create exercise handler parameters object
  const exerciseHandlerParams: ExerciseHandlerParams = {
    exercises,
    todaysExercises,
    currentExerciseIndex,
    currentSet,
    setCurrentExerciseIndex,
    setCurrentSet,
    markExerciseCompleted,
    markAsUsed,
    stopTimer: () => stopTimer(timerHandlerParams, initialActiveTimer),
    switchTimerType: () => switchTimerType(timerHandlerParams),
    toast,
  };

  // Timer handler wrappers
  const handleStartTimerWrapper = () => {
    handleStartTimer(timerHandlerParams, selectedStrategyId, todaysExercises, today, setCurrentExerciseIndex, setCurrentSet);
  };

  const handleStopTimerWrapper = () => {
    handleStopTimer(timerHandlerParams, initialActiveTimer, setCurrentExerciseIndex, setCurrentSet);
  };

  const handleManualCompleteExerciseWrapper = (exerciseId: string) => {
    handleManualCompleteExercise(exerciseHandlerParams, exerciseId);
  };

  const handleNextSegmentWrapper = () => {
    handleNextSegment(exerciseHandlerParams, activeTimer, currentExercise, () => getCurrentExerciseDetails(currentExercise, currentExerciseIndex, todaysExercises));
  };

  return (
    <div className="py-6 space-y-6">
      <h1 className="text-3xl font-bold">Workout Timer</h1>

      {soundPermissionStatus === "denied" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sound Permission Required</AlertTitle>
          <AlertDescription>
            Please enable sound permissions for timer alerts to work properly.
          </AlertDescription>
        </Alert>
      )}
      {!activeTimer.isActive ? (
        <>
          {" "}
          <TimerSetup
            timerStrategies={timerStrategies.map((strategy) => ({
              id: strategy._id,
              name: strategy.name,
            }))}
            selectedStrategyId={selectedStrategyId}
            setSelectedStrategyId={setSelectedStrategyId}
            handleStartTimer={handleStartTimerWrapper}
            soundPermissionStatus={soundPermissionStatus}
            todaysExercisesCount={todaysExercises.length}
            todaysCompletedExercisesCount={todaysCompletedExercisesCount}
            isAutoSwitchEnabled={isAutoSwitchEnabled}
            setIsAutoSwitchEnabled={setIsAutoSwitchEnabled}
          />
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Today's Exercises</h2>
            <MemoizedExerciseList
              title="Today's Workout"
              description="These are the exercises scheduled for today"
              exercises={exercises}
              categories={[]} // No categories needed for now
              scheduledExercises={scheduledExercises}
              orderedExerciseIds={orderedExerciseIds}
              currentExerciseIndex={0}
              sensors={sensors}
              handleDragEnd={handleDragEndWrapper}
              isTimerActive={false}
              orderedExercises={orderedExercises}
            />
          </div>
        </>
      ) : (
        <ActiveTimer
          strategy={
            currentStrategyRef.current
              ? {
                  id: currentStrategyRef.current._id,
                  name: currentStrategyRef.current.name,
                  color: currentStrategyRef.current.color,
                  restDuration: currentStrategyRef.current.restDuration,
                  activeDuration: currentStrategyRef.current.activeDuration,
                }
              : null
          }
          activeTimer={activeTimer}
          currentExercise={currentExercise}
          currentExerciseCategory={currentExerciseCategory}
          currentSet={currentSet}
          getCurrentExerciseDetails={() => getCurrentExerciseDetails(currentExercise, currentExerciseIndex, todaysExercises)}
          orderedExercises={orderedExercises}
          currentExerciseIndex={currentExerciseIndex}
          exercises={exercises}
          categories={[]} // No categories needed for now
          displayTime={() => displayTime(minutes, seconds)}
          percentComplete={() => calculatePercentComplete(activeTimer, currentStrategy || null, minutes, seconds)}
          isRunning={isRunning}
          minutes={minutes}
          seconds={seconds}
          handlePauseTimer={() => handlePauseTimer(timerHandlerParams)}
          handleResumeTimer={() => handleResumeTimer(timerHandlerParams)}
          handleNextSegment={handleNextSegmentWrapper}
          skipToEnd={() => skipToEnd(timerHandlerParams, activeTimer, handleNextSegmentWrapper)}
          handleStopTimer={handleStopTimerWrapper}
          isSoundEnabled={isSoundEnabled}
          setIsSoundEnabled={setIsSoundEnabled}
          isAutoSwitchEnabled={isAutoSwitchEnabled}
          setIsAutoSwitchEnabled={setIsAutoSwitchEnabled}
          testSound={() => testSound(setSoundPermissionStatus)}
          toast={toast}
        />
      )}
    </div>
  );
}
