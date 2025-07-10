# Drag and Drop Fix Implementation

## Summary of Issue
When dragging template exercises in the workout plan calendar, the system creates copies instead of moving them. Even after the previous fix to update the `workoutPlanId` parameter in the repository layer, the issue persists - when users drag exercises (e.g., push-ups from Monday to Tuesday), both exercises remain visible.

## Fix Implementation

1. Added `isHidden` field to the ScheduledExercise model:
```typescript
isHidden?: boolean; // Indicates if this exercise should be hidden (used for template overrides)
```

2. Updated the `handleConvertTemplateToScheduled` function to create "hide" overrides for template exercises:
```typescript
// Create an override entry for the source date to hide the template exercise
if (templateExercise.date) {
  // Create a "hide" override for the original date
  await addScheduledExercise({
    exerciseId: templateExercise.exerciseId,
    categoryId: templateExercise.categoryId,
    workoutPlanId: templateExercise.workoutPlanId,
    date: templateExercise.date,
    sets: 0, // Using 0 as a signal that this is a hide override
    reps: 0,
    weight: 0,
    notes: 'Hidden (moved to another date)',
    completed: false,
    isHidden: true // New flag to indicate this is a hide override
  });
}
```

3. Updated the `getExercisesForDate` function to filter out hidden exercises:
```typescript
// Filter out hidden exercises
const scheduledForDate = scheduledExercises.filter((ex: any) => ex.date === dateStr && !ex.isHidden);
```

4. Added checks for hidden overrides in template processing:
```typescript
// Check if we have a hidden override for this template
const isHidden = scheduledForDate.some((scheduled: any) => 
  scheduled.exerciseId === template.exerciseId && 
  scheduled.workoutPlanId === activePlan.id && 
  scheduled.isHidden
);

// Only show if not already scheduled and not hidden
if (!alreadyScheduled && !isHidden) {
  // Add template to display
}
```

## Testing
- Drag a template exercise (e.g., push-ups) from Monday to Tuesday
- The template exercise should disappear from Monday and appear on Tuesday
- The template exercise on Tuesday should be editable (it's no longer a template)
- When refreshing the page, the changes should persist
