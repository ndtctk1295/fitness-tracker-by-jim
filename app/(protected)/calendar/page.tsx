"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { AlertCircle, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ScopeSelectionDialog } from "@/components/calendar/scope-selection-dialog";
import { ExerciseDetailDialog } from "@/components/exercise-detail-dialog";
import { TimerSummary } from "@/components/timer-summary";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { CalendarLegend } from "@/components/calendar/calendar-legend";
import { LoadingOverlay } from "@/components/calendar/loading-overlay";

import { useExerciseStore } from "@/lib/stores/exercise-store";
import { useScheduledExerciseStoreWithGeneration } from "@/lib/stores/scheduled-exercise-store";
import { scheduledExerciseService } from "@/lib/services/scheduled-exercise-service";
import { useWorkoutPlanStore } from "@/lib/stores/workout-plan-store";
import { useCalendarStore, useCalendarData } from "@/lib/stores/calendar-store";
import { useUserExercisePreferenceStore } from "@/lib/stores/user-exercise-preference-store";
import { useApiToast } from "@/lib/hooks/use-api-toast";
import { isDateInSameWeek } from "@/lib/utils/calendar/date-utils";
import { categorizeExercises } from "@/lib/utils/calendar/exercise-utils";

export default function CalendarPage() {
  // Hooks
  const { showErrorToast, showSuccessToast } = useApiToast();

  // Access store state and actions
  const {
    exercises,
    categories,
    isLoading: exerciseLoading,
    error: exerciseError,
    initialized: exerciseInitialized,
  } = useExerciseStore();

  // Calendar store state and actions
  const {
    currentDate,
    selectedDate,
    calendarView,
    calendarDisplayMode: calendarViewMode,
    dialogOpen,
    isRescheduling,
    scopeDialogOpen,
    draggedExercise,
    pendingReschedule,
    setCurrentDate,
    setSelectedDate,
    setCalendarView,
    setCalendarDisplayMode,
    setDialogOpen,
    setScopeDialogOpen,
    setDraggedExercise,
    setPendingReschedule,
    setIsRescheduling,
  } = useCalendarStore();

  // Get pre-calculated calendar data
  const { dateRange, days, formattedStartDate, formattedEndDate } =
    useCalendarData();

  const {
    scheduledExercises,
    isLoading: scheduledLoading,
    error: scheduledError,
    fetchExercisesForDateRange,
    rescheduleExercise,
    addScheduledExercise,
    clearCache,
    initialized: scheduledInitialized,
    ensureExercisesGeneratedIfNeeded,
  } = useScheduledExerciseStoreWithGeneration();

  const {
    activePlan,
    isLoading: workoutPlanLoading,
    error: workoutPlanError,
    loadActivePlan,
    updatePlan,
  } = useWorkoutPlanStore();

  // Initialize user exercise preferences (favorites)
  const { initializeStore: initializeFavorites } =
    useUserExercisePreferenceStore();

  // Combined loading and error states
  const isLoading =
    exerciseLoading || scheduledLoading || workoutPlanLoading || isRescheduling;
  const error = exerciseError || scheduledError || workoutPlanError;
  const initialized = exerciseInitialized && scheduledInitialized;

  // Load active workout plan on mount and check generation
  useEffect(() => {
    if (initialized && !activePlan) {
      loadActivePlan();
    }

    // Check if exercises need to be generated (only once per session)
    if (initialized) {
      ensureExercisesGeneratedIfNeeded();
    }

    // Initialize favorites when the page loads
    initializeFavorites();
  }, [initialized, activePlan]);

  // Load exercises for current date range
  useEffect(() => {
    // Only proceed if the store is initialized
    if (!initialized) {
      return;
    }

    if (!isLoading) {
      // Use pre-formatted dates from our calendar data hook
      fetchExercisesForDateRange(formattedStartDate, formattedEndDate).catch(
        (error: any) => {
          showErrorToast("Failed to load exercises", "Please try again later");
          console.error("Error loading calendar exercises:", error);
        }
      );
    }
  }, [
    currentDate,
    calendarView,
    isLoading,
    initialized,
    formattedStartDate,
    formattedEndDate,
  ]);

  // Get exercises for a specific date
  const getExercisesForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return categorizeExercises(scheduledExercises, dateStr);
  };

  // Navigation handlers
  const handlePrevious = () => {
    useCalendarStore.getState().goToPreviousDate();
  };

  const handleNext = () => {
    useCalendarStore.getState().goToNextDate();
  };

  const handleToday = () => {
    useCalendarStore.getState().goToToday();
  };

  const toggleView = () => {
    setCalendarView(calendarView === "month" ? "week" : "month");
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setDialogOpen(true);
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const exercise = active.data.current?.exercise;
    setDraggedExercise(exercise);
    // console.log('Drag started with exercise:', exercise);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedExercise(null);
    // console.log('Drag ended:', active, over);

    if (!over) return;

    const exerciseId = active.id as string;
    const newDateObj = over.data.current?.date;
    const exercise = active.data.current?.exercise;

    if (!newDateObj || !exercise) return;

    // Format the date to yyyy-MM-dd string format required by the API
    const newDate = format(newDateObj, "yyyy-MM-dd");

    // Check if the exercise is being moved to a different date
    if (exercise.date === newDate) return;

    // Convert dates to Date objects for comparison
    const originalDate = new Date(exercise.date);
    const targetDate = new Date(newDate);

    // Check if the dates are in different weeks
    if (!isDateInSameWeek(originalDate, targetDate)) {
      showErrorToast(
        "Week restriction",
        "Exercises can only be rearranged within the same week (Sunday to Saturday)"
      );
      return;
    }

    // Handle both template exercises and workout plan exercises with scope dialog
    if (exercise.isTemplate || exercise.workoutPlanId) {
      setPendingReschedule({
        exerciseId,
        newDate,
        exercise,
      });
      setScopeDialogOpen(true);
    } else {
      // For manual exercises, reschedule directly
      handleRescheduleExercise(exerciseId, newDate);
    }
  };

  // Handle reschedule of an exercise (simple version for direct calls)
  const handleRescheduleExercise = async (
    exerciseId: string,
    newDate: string,
    scope: "this-week" | "whole-plan" = "this-week"
  ) => {
    try {
      await rescheduleExercise(exerciseId, newDate, scope);
      showSuccessToast("Exercise rescheduled successfully");
    } catch (error: any) {
      showErrorToast(
        "Failed to reschedule exercise",
        error?.message || "Please try again later"
      );
      console.error("Error rescheduling exercise:", error);
    }
  };

  // Handle scope selection from dialog
  const handleScopeSelection = async (scope: "this-week" | "whole-plan") => {
    if (!pendingReschedule) return;

    const { exerciseId, newDate, exercise } = pendingReschedule;
    setIsRescheduling(true);

    try {
      if (exercise.isTemplate) {
        // Handle template exercise rescheduling
        if (scope === "whole-plan") {
          // For whole-plan template moves, create a temporary scheduled exercise first
          // then use the reschedule logic to move it permanently
          const tempExercise = await addScheduledExercise({
            exerciseId: exercise.exerciseId,
            categoryId: exercise.categoryId,
            workoutPlanId: exercise.workoutPlanId,
            date: exercise.date,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            notes: exercise.notes,
            completed: false,
          });

          // Now reschedule this temporary exercise with whole-plan scope
          await rescheduleExercise(tempExercise.id, newDate, "whole-plan");
          showSuccessToast(
            "Exercise moved permanently in workout plan template and all future weeks updated"
          );
        } else {
          // For this-week scope, create the override exercises directly
          await scheduledExerciseService.convertTemplateToScheduled(
            exercise,
            newDate,
            "this-week"
          );

          // Refresh exercises to show the changes
          await fetchExercisesForDateRange(
            formattedStartDate,
            formattedEndDate
          );
          showSuccessToast("Exercise moved for this week only");
        }
      } else {
        // For regular scheduled exercises, use the store's reschedule method
        await rescheduleExercise(exerciseId, newDate, scope);
        showSuccessToast(
          `Exercise rescheduled for ${
            scope === "whole-plan" ? "whole plan" : "this week only"
          }`
        );
      }
    } catch (error: any) {
      showErrorToast(
        "Failed to reschedule exercise",
        error?.message || "Please try again later"
      );
      console.error("Error rescheduling exercise:", error);
    } finally {
      setIsRescheduling(false);
      setPendingReschedule(null);
      setScopeDialogOpen(false);
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="py-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CalendarHeader
            activePlanName={activePlan?.name}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToday={handleToday}
            onToggleView={toggleView}
          />

          <CardContent>
            {isLoading && !isRescheduling ? (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="relative">
                <LoadingOverlay isVisible={isRescheduling} />

                <ScrollArea className="w-full">
                  <div className="min-w-[640px]">
                    {/* Legend for exercise types */}
                    {calendarViewMode === "detailed" && (
                      <CalendarLegend
                        activePlanName={activePlan?.name || "Current Plan"}
                      />
                    )}

                    <CalendarGrid
                      scheduledExercises={scheduledExercises}
                      exercises={exercises}
                      activePlan={activePlan}
                      onSelectDate={handleDayClick}
                    />
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Show summary of exercises today */}
        <TimerSummary />

        {/* Exercise Detail Dialog - Always rendered, visibility controlled by open prop */}
        <ExerciseDetailDialog
          date={selectedDate}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />

        {/* Scope selection dialog for workout plan exercises */}
        <ScopeSelectionDialog
          open={scopeDialogOpen}
          onOpenChange={setScopeDialogOpen}
          onConfirm={handleScopeSelection}
          exerciseName={
            pendingReschedule?.exercise
              ? (pendingReschedule.exercise.isTemplate
                  ? pendingReschedule.exercise.name
                  : exercises.find(
                      (e) => e.id === pendingReschedule.exercise.exerciseId
                    )?.name) || "Exercise"
              : "Exercise"
          }
          fromDate={
            pendingReschedule?.exercise?.date ||
            format(new Date(), "yyyy-MM-dd")
          }
          toDate={
            pendingReschedule?.newDate || format(new Date(), "yyyy-MM-dd")
          }
        />
      </div>
    </DndContext>
  );
}
