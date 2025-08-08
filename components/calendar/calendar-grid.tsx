'use client';

import { DroppableCalendarDate } from "./droppable-calendar-date";
import { DraggableExerciseBlock } from "./draggable-exercise-block";
import { format, isSameDay, isSameMonth, isBefore, startOfDay } from "date-fns";
import { isToday } from "@/lib/utils/calendar/date-utils";
import { categorizeExercises, getMaxExercisesToShow, getWorkoutPlanTemplateExercises, hasValidWorkoutPlanId } from "@/lib/utils/calendar/exercise-utils";
import { useCalendarStore } from "@/lib/stores/calendar-store";
import { useEffect } from "react";

interface CalendarGridProps {
  scheduledExercises: any[];
  exercises: any[];
  activePlan: any;
  onSelectDate: (date: Date) => void;
}

export function CalendarGrid({
  scheduledExercises,
  exercises,
  activePlan,
  onSelectDate
}: CalendarGridProps) {
  // Track scheduled exercises changes
  useEffect(() => {
    // Silent effect for tracking exercises changes
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayExercises = scheduledExercises.filter(ex => ex.date === today);
    // Exercises tracked silently
  }, [scheduledExercises]);
  
  // Get state from calendar store
  const { 
    currentDate,
    calendarView,
    calendarDisplayMode,
    getCalendarDays
  } = useCalendarStore();
  
  // Get calendar days directly
  const days = getCalendarDays();
  
  // Calculate max exercises to display
  const maxExercisesToShow = getMaxExercisesToShow(calendarDisplayMode, calendarView as 'month' | 'week');

  return (
    <div className="grid grid-cols-7 gap-2" data-testid="calendar-grid">
      {/* Day headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div 
          key={day} 
          className={`text-center text-sm font-medium py-1 min-w-[90px] ${calendarView === 'week' ? 'data-week-day' : ''}`}
          data-testid={calendarView === 'week' ? 'calendar-week-day' : undefined}
        >
          {day}
        </div>
      ))}

      {/* Calendar cells */}
      {days.map((date) => {
        const isCurrentMonth = isSameMonth(date, currentDate);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        // Get exercises for this date
        const { all: allExercises, manual: manualExercises } = categorizeExercises(
          scheduledExercises, dateStr
        );

        // Get template exercises from the workout plan
        const { templateExercises, hasScheduledExercisesFromPlan } = getWorkoutPlanTemplateExercises(
          activePlan, date, scheduledExercises
        );

        // Sort exercises by different categories for display purposes
        const dayExercises = {
          scheduled: allExercises.filter((ex: any) => {
            if (!activePlan?.id || !ex.workoutPlanId) return false;
            // Convert both to strings and clean them to ensure consistent comparison
            const planId = String(activePlan.id).replace(/^[^a-z0-9]*/i, '');
            const exPlanId = String(ex.workoutPlanId).replace(/^[^a-z0-9]*/i, '');
            return planId === exPlanId;
          }),
          template: templateExercises,
        };

        // Combine all exercise types for display - prioritizing scheduled exercises over templates
        const allDayExercises = [
          ...dayExercises.scheduled,
          ...(dayExercises.scheduled.length === 0 ? dayExercises.template : []),
          ...manualExercises
        ];

        return (
          <DroppableCalendarDate
            key={date.toString()}
            date={date}
            onClick={() => onSelectDate(date)}
            className={`
              rounded-lg border border-border p-2 min-h-28 min-w-[90px]
              transition-all hover:border-primary/50 cursor-pointer
              ${!isCurrentMonth && calendarView === 'month' ? 'opacity-30' : ''}
              ${isToday(date) ? 'bg-primary/5 border-primary/30' : ''}
            `}
            data-testid="calendar-date-cell"
            data-date={format(date, 'yyyy-MM-dd')}
          >
            <div className="flex flex-col h-full">
              {/* Date number */}
              <div className={`
                text-right text-sm font-medium p-1
                ${isToday(date) ? 'text-primary' : 'text-muted-foreground'}
              `}>
                {format(date, 'd')}
              </div>

              {/* Exercise list */}
              <div className="flex-1 p-1 text-xs space-y-1">
                {allDayExercises.slice(0, maxExercisesToShow).map((ex: any) => {
                  const isTemplate = ex.isTemplate;
                  const isWorkoutPlanExercise = hasValidWorkoutPlanId(ex) && ex.workoutPlanId === activePlan?.id;
                  const exerciseDetails = exercises.find((e) => e.id === ex.exerciseId) || { id: ex.exerciseId, name: 'Unknown Exercise' };
                  
                  const category = ex.categoryId
                    ? { id: ex.categoryId, color: '#888888' }
                    : { id: 'unknown', color: '#888888' };

                  // Check if exercise is overdue (past due date and not completed)
                  const exerciseDate = new Date(ex.date);
                  const today = startOfDay(new Date());
                  const isOverdue = !ex.completed && !isTemplate && isBefore(exerciseDate, today);
                  const isCompleted = ex.completed;

                  // Determine styling based on exercise type and status
                  let bgColor, textColor, darkBgColor, darkTextColor, borderColor;
                  
                  if (isCompleted) {
                    // Completed exercises - green theme
                    bgColor = 'bg-green-100';
                    textColor = 'text-green-800';
                    darkBgColor = 'dark:bg-green-900/30';
                    darkTextColor = 'dark:text-green-300';
                    borderColor = 'border-green-500';
                  } else if (isOverdue) {
                    // Overdue exercises - red theme
                    bgColor = 'bg-red-100';
                    textColor = 'text-red-800';
                    darkBgColor = 'dark:bg-red-900/30';
                    darkTextColor = 'dark:text-red-300';
                    borderColor = 'border-red-500';
                  } else {
                    // Default styling based on exercise type
                    bgColor = isWorkoutPlanExercise ? 'bg-blue-100' : 'bg-gray-100';
                    textColor = isWorkoutPlanExercise ? 'text-blue-800' : 'text-gray-700';
                    darkBgColor = isWorkoutPlanExercise ? 'dark:bg-blue-900/30' : 'dark:bg-gray-800/50';
                    darkTextColor = isWorkoutPlanExercise ? 'dark:text-blue-300' : 'dark:text-gray-400';
                    borderColor = isWorkoutPlanExercise ? 'border-blue-500' : 'border-gray-400';
                  }

                  const borderStyle = isTemplate ? 'border-dashed' : 'border-solid';

                  return (
                    <DraggableExerciseBlock
                      key={isTemplate ? `template-${ex.exerciseId}-${date}` : ex.id}
                      exercise={ex}
                      exerciseDetails={exerciseDetails}
                      category={category}
                      calendarViewMode={calendarDisplayMode}
                    >
                      <div
                        className={`
                          truncate px-1.5 py-0.5 rounded-sm border ${borderStyle} ${borderColor}
                          ${bgColor} ${textColor} ${darkBgColor} ${darkTextColor}
                          ${ex.completed ? 'line-through opacity-70' : ''}
                          text-xs font-medium mb-1 w-full
                        `}
                      >
                        {calendarDisplayMode === 'detailed' && (
                          <>
                            {isCompleted && (
                              <span className="inline-block w-2 h-2 bg-green-500 mr-1" />
                            )}
                            {isOverdue && !isCompleted && (
                              <span className="inline-block w-2 h-2 bg-red-500 mr-1" />
                            )}
                            {!isCompleted && !isOverdue && isTemplate && isWorkoutPlanExercise && (
                              <span className="inline-block w-2 h-2 border border-blue-500 mr-1" />
                            )}
                            {!isCompleted && !isOverdue && isWorkoutPlanExercise && !isTemplate && (
                              <span className="inline-block w-2 h-2 bg-blue-500 mr-1" />
                            )}
                            {!isCompleted && !isOverdue && !isWorkoutPlanExercise && (
                              <span className="inline-block w-2 h-2 bg-gray-400 mr-1" />
                            )}
                          </>
                        )}
                        {exerciseDetails.name}
                      </div>
                    </DraggableExerciseBlock>
                  );
                })}

                {allDayExercises.length > maxExercisesToShow && (
                  <div className="text-xs text-muted-foreground px-1">
                    +{allDayExercises.length - maxExercisesToShow} more
                  </div>
                )}

                {calendarDisplayMode === 'detailed' && allDayExercises.length > 0 && (
                  <div className="text-xs text-muted-foreground px-1 pt-1 border-t border-border/20">
                    {dayExercises?.scheduled?.length > 0 && `${dayExercises?.scheduled?.length} scheduled`}
                    {dayExercises?.scheduled?.length > 0 && (dayExercises?.template?.length > 0 || manualExercises.length > 0) && ' • '}
                    {dayExercises?.template?.length > 0 && `${dayExercises?.template?.length} planned`}
                    {dayExercises?.template?.length > 0 && manualExercises.length > 0 && ' • '}
                    {manualExercises.length > 0 && `${manualExercises.length} manual`}
                  </div>
                )}
              </div>
            </div>
          </DroppableCalendarDate>
        );
      })}
    </div>
  );
}
