import { getRelativeDates } from '../utils/date-helpers';

/**
 * Generate scheduled exercises with dynamic dates
 * This replaces the static JSON fixture with dynamic date generation
 */
export function generateScheduledExercises() {
  const dates = getRelativeDates();
  
  return [
    // Yesterday's exercises
    {
      exerciseName: "Push-ups",
      date: dates.yesterday,
      sets: 3,
      reps: 12,
      weight: 0,
      notes: "Bodyweight exercise",
      completed: false,
      orderIndex: 0
    },
    {
      exerciseName: "Squats", 
      date: dates.yesterday,
      sets: 3,
      reps: 15,
      weight: 0,
      notes: "Focus on form",
      completed: false,
      orderIndex: 1
    },
    {
      exerciseName: "Plank",
      date: dates.yesterday, 
      sets: 3,
      reps: 1,
      weight: 0,
      notes: "Hold for 30 seconds each set",
      completed: true,
      orderIndex: 2
    },
    
    // Today's exercises  
    {
      exerciseName: "Bicep Curls",
      date: dates.today,
      sets: 3,
      reps: 10,
      weight: 15,
      notes: "15lb dumbbells",
      completed: false,
      orderIndex: 0
    },
    {
      exerciseName: "Shoulder Press",
      date: dates.today,
      sets: 3,
      reps: 8,
      weight: 20,
      notes: "20lb dumbbells",
      completed: false,
      orderIndex: 1
    },
    
    // Tomorrow's exercises
    {
      exerciseName: "Pull-ups",
      date: dates.tomorrow,
      sets: 3,
      reps: 6,
      weight: 0,
      notes: "Assisted if needed",
      completed: false,
      orderIndex: 0
    },
    {
      exerciseName: "Deadlifts",
      date: dates.tomorrow,
      sets: 3,
      reps: 5,
      weight: 135,
      notes: "Focus on form over weight",
      completed: false,
      orderIndex: 1
    },
    
    // Two days from now
    {
      exerciseName: "Lunges",
      date: dates.twoDaysFromNow,
      sets: 3,
      reps: 12,
      weight: 0,
      notes: "12 reps each leg",
      completed: false,
      orderIndex: 0
    }
  ];
}

/**
 * Get scheduled exercises for a specific date offset
 * @param daysOffset - Days from today (-1 = yesterday, 0 = today, 1 = tomorrow)
 */
export function getScheduledExercisesForDate(daysOffset: number) {
  const allExercises = generateScheduledExercises();
  const dates = getRelativeDates();
  
  let targetDate: string;
  switch (daysOffset) {
    case -1:
      targetDate = dates.yesterday;
      break;
    case 0:
      targetDate = dates.today;
      break;
    case 1:
      targetDate = dates.tomorrow;
      break;
    case 2:
      targetDate = dates.twoDaysFromNow;
      break;
    default:
      // For other offsets, calculate dynamically
      const date = new Date();
      date.setDate(date.getDate() + daysOffset);
      targetDate = date.toISOString().split('T')[0];
  }
  
  return allExercises.filter(exercise => exercise.date === targetDate);
}
