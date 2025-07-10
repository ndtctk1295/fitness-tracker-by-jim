/**
 * Check if an exercise has a valid workout plan ID
 */
export function hasValidWorkoutPlanId(exercise: any) {
  if (!exercise.workoutPlanId) return false; // null, undefined, 0, false, ""
  if (typeof exercise.workoutPlanId === 'string') {
    const trimmed = exercise.workoutPlanId.trim();
    return trimmed !== '' && trimmed !== 'null' && trimmed !== 'undefined';
  }
  return true; // non-empty non-string values are considered valid
}

/**
 * Categorize exercises by their source (manual, workout plan, template)
 */
export function categorizeExercises(scheduledExercises: any[], date: string) {
  // Filter out hidden exercises
  const scheduledForDate = scheduledExercises.filter((ex: any) => ex.date === date && !ex.isHidden);
  
  // Separate workout plan exercises from manual exercises
  const workoutPlanExercises = scheduledForDate.filter((ex: any) => hasValidWorkoutPlanId(ex));
  const manualExercises = scheduledForDate.filter((ex: any) => !hasValidWorkoutPlanId(ex));
  
  return {
    all: scheduledForDate,
    workoutPlan: workoutPlanExercises,
    manual: manualExercises
  };
}

/**
 * Get template exercises from a workout plan for a specific day
 */
export function getWorkoutPlanTemplateExercises(
  activePlan: any,
  date: Date,
  scheduledExercises: any[]
) {
  if (!activePlan || !activePlan.weeklyTemplate) {
    return {
      templateExercises: [],
      hasScheduledExercisesFromPlan: false,
      activePlanScheduledExercises: []
    };
  }

  const dateStr = date.toISOString().split('T')[0];
  const scheduledForDate = scheduledExercises.filter((ex: any) => ex.date === dateStr && !ex.isHidden);
  
  // Check if there are ANY scheduled exercises from this specific workout plan for this date
  const activePlanIdStr = String(activePlan.id).replace(/^[^a-z0-9]*/i, '');
  
  const activePlanScheduledExercises = scheduledForDate.filter((scheduled: any) => {
    // Ensure consistent string comparison by removing potential ObjectId wrapper
    const scheduledPlanIdStr = scheduled.workoutPlanId ? 
      String(scheduled.workoutPlanId).replace(/^[^a-z0-9]*/i, '') : 
      null;
    
    // Debug log to troubleshoot workoutPlanId comparison
    console.debug(`Comparing workoutPlanIds - Active: ${activePlanIdStr}, Scheduled: ${scheduledPlanIdStr}, Match: ${scheduledPlanIdStr === activePlanIdStr}`);
    
    return scheduledPlanIdStr === activePlanIdStr && !scheduled.isHidden;
  });
  
  const hasScheduledExercisesFromPlan = activePlanScheduledExercises.length > 0;
  
  // Debug log to see if we're correctly detecting scheduled exercises
  console.debug(`Date ${dateStr} - Found ${activePlanScheduledExercises.length} scheduled exercises for plan ${activePlanIdStr}`);
  
  // Check if this date is valid for the workout plan based on its mode and dates
  let isDateValidForPlan = false;
  const currentDateObj = new Date();
  
  // Check if date should be displayed based on workout plan mode
  if (activePlan.mode === 'ongoing') {
    // For ongoing plans, only show template exercises for days after the plan was created
    const planCreatedAtDate = activePlan.createdAt ? new Date(activePlan.createdAt) : currentDateObj;
    isDateValidForPlan = date >= planCreatedAtDate;
  } else if (activePlan.mode === 'dated') {
    // For dated plans, only show template exercises within the date range
    const startDate = activePlan.startDate ? new Date(activePlan.startDate) : currentDateObj;
    const endDate = activePlan.endDate ? new Date(activePlan.endDate) : null;
    
    isDateValidForPlan = date >= startDate && (!endDate || date <= endDate);
  }
  
  // Only proceed if the date is valid for the workout plan
  let templateExercises: any[] = [];
  
  if (isDateValidForPlan) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayTemplate = activePlan.weeklyTemplate.find((template: any) => template.dayOfWeek === dayOfWeek);
    
    // PRIORITIZATION LOGIC:
    // - If there are scheduled exercises from this workout plan for this day: ONLY show those, hide templates
    // - If there are NO scheduled exercises from this workout plan for this day: show templates
    if (!hasScheduledExercisesFromPlan && dayTemplate && dayTemplate.exerciseTemplates) {
      // Only show template exercises if there are no scheduled exercises from this plan
      templateExercises = dayTemplate.exerciseTemplates
        .filter((template: any) => {
          // Check if we have a hidden override for this template
          const isHidden = scheduledForDate.some((scheduled: any) => {
            const scheduledPlanIdStr = scheduled.workoutPlanId ? scheduled.workoutPlanId.toString() : null;
            return scheduled.exerciseId === template.exerciseId && 
                  scheduledPlanIdStr === activePlanIdStr && 
                  scheduled.isHidden;
          });
          
          return !isHidden;
        })
        .map((template: any) => {
          return {
            ...template,
            isTemplate: true,
            date: dateStr,
            workoutPlanId: activePlan.id
          };
        });
    }
  }
  
  return {
    templateExercises,
    hasScheduledExercisesFromPlan,
    activePlanScheduledExercises
  };
}

/**
 * Calculate the maximum number of exercises to display based on view mode
 */
export function getMaxExercisesToShow(calendarViewMode: 'simple' | 'detailed', calendarView: 'month' | 'week') {
  if (calendarViewMode === 'simple') {
    return calendarView === 'month' ? 2 : 4;
  } else {
    return calendarView === 'month' ? 5 : 10;
  }
}
