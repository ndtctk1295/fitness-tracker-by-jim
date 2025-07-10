import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import scheduledExercisesRepo from '@/lib/repositories/scheduled-exercises-repo';
import { z } from 'zod';

// Validation schema for scheduled exercise
const scheduledExerciseSchema = z.object({
  exerciseId: z.string().min(1, { message: "Exercise ID is required" }),
  categoryId: z.string().min(1, { message: "Category ID is required" }),
  workoutPlanId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in yyyy-MM-dd format" }),
  sets: z.number().int().min(0, { message: "Sets must be at least 0" }),
  reps: z.number().int().min(0, { message: "Reps must be at least 0" }),
  weight: z.number().min(0, { message: "Weight cannot be negative" }),
  weightPlates: z.record(z.string(), z.number()).optional(),
  isHidden: z.boolean().optional(),
});

/**
 * GET /api/scheduled-exercises
 * Get all scheduled exercises for the authenticated user
 * @query date - Optional: filter by specific date (yyyy-MM-dd)
 * @query startDate - Optional: filter by date range start (yyyy-MM-dd)
 * @query endDate - Optional: filter by date range end (yyyy-MM-dd)
 */
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    
    // Get optional date parameters
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let scheduledExercises;
      // Fetch based on provided parameters
    if (date) {
      // Get exercises for a specific date
      scheduledExercises = await scheduledExercisesRepo.findByUserAndDate(userId, date);
    } else if (startDate && endDate) {
      // Get exercises for date range
      scheduledExercises = await scheduledExercisesRepo.findByUserAndDateRange(userId, startDate, endDate);
    } else {
      // Get all exercises for the user (for history page)
      scheduledExercises = await scheduledExercisesRepo.findAllByUser(userId);
    }
    
    return NextResponse.json(scheduledExercises);
  } catch (error) {
    console.error('Error fetching scheduled exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled exercises' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scheduled-exercises
 * Create a new scheduled exercise for the authenticated user
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await req.json();
    
    // Validate input data
    const validationResult = scheduledExerciseSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid data',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }
      try {
      // Create a validated data object with proper ID checks
      const validatedData = {
        userId: session.user.id,
        ...validationResult.data
      };
      
      // Log the data being sent to the repository for debugging
      console.log('Creating scheduled exercise with data:', JSON.stringify({
        userId: validatedData.userId,
        exerciseId: validatedData.exerciseId,
        categoryId: validatedData.categoryId
      }));
      
      // Create the scheduled exercise associated with the current user
      const scheduledExercise = await scheduledExercisesRepo.create(validatedData);
      
      return NextResponse.json(scheduledExercise, { status: 201 });
    } catch (error: any) {
      console.error('Error creating scheduled exercise:', error);
      
      // Return a more detailed error message with the actual error info
      return NextResponse.json(
        { 
          error: 'Failed to create scheduled exercise', 
          message: error.message,
          details: error.toString()
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
