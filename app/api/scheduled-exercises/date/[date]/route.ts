import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import scheduledExercisesRepo from '@/lib/repositories/scheduled-exercises-repo';
import { z } from 'zod';

// Validation schema for a single scheduled exercise in bulk operations
const scheduledExerciseSchema = z.object({
  exerciseId: z.string().min(1, { message: "Exercise ID is required" }),
  categoryId: z.string().min(1, { message: "Category ID is required" }),
  sets: z.number().int().min(1, { message: "Sets must be at least 1" }),
  reps: z.number().int().min(1, { message: "Reps must be at least 1" }),
  weight: z.number().min(0, { message: "Weight cannot be negative" }),
  weightPlates: z.record(z.string(), z.number()).optional(),
});

// Schema for bulk update/create operation
const bulkScheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in yyyy-MM-dd format" }),
  exercises: z.array(scheduledExerciseSchema),
});

/**
 * GET /api/scheduled-exercises/date/[date]
 * Get all scheduled exercises for a specific date
 */
export async function GET(
  req: NextRequest,
  context: { params: { date: string } }
) {
  try {
    // Extract the date parameter safely
    const { date } = await context.params;
    
    // Basic date format validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use yyyy-MM-dd' },
        { status: 400 }
      );
    }

    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get exercises for the specified date
    const scheduledExercises = await scheduledExercisesRepo.findByUserAndDate(session.user.id, date);
      return NextResponse.json(scheduledExercises);
  } catch (error) {
    // Use the already awaited date parameter
    const { date } = await context.params;
    console.error(`Error fetching scheduled exercises for date ${date || 'unknown date'}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled exercises' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/scheduled-exercises/date/[date]
 * Replace all scheduled exercises for a specific date
 */
export async function PUT(
  req: NextRequest,
  context: { params: { date: string } }
) {
  try {
    // Extract the date parameter safely
    const { date } = await context.params;
    
    // Basic date format validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use yyyy-MM-dd' },
        { status: 400 }
      );
    }
    
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse and validate input data
    const data = await req.json();
    const validationResult = bulkScheduleSchema.safeParse({
      date,
      exercises: data.exercises || []
    });
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid data', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }
    
    // Delete existing exercises for this date
    await scheduledExercisesRepo.deleteByUserAndDate(session.user.id, date);
      // Create new exercises
    const createdExercises = [];
    for (const [index, exercise] of validationResult.data.exercises.entries()) {
      const createdExercise = await scheduledExercisesRepo.create({
        userId: session.user.id,
        date,
        orderIndex: index, // Add order index based on array position
        ...exercise
      });
      createdExercises.push(createdExercise);
    }
    
    return NextResponse.json(createdExercises);  } catch (error) {
    // Use the already awaited date parameter
    const { date } = await context.params;
    console.error(`Error updating scheduled exercises for date ${date || 'unknown date'}:`, error);
    return NextResponse.json(
      { error: 'Failed to update scheduled exercises' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/scheduled-exercises/date/[date]
 * Delete all scheduled exercises for a specific date
 */
export async function DELETE(
  req: NextRequest,
  context: { params: { date: string } }
) {
  try {
    // Extract the date parameter safely
    const { date } = await context.params;
    
    // Basic date format validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use yyyy-MM-dd' },
        { status: 400 }
      );
    }
    
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Delete all exercises for this date
    const deletedCount = await scheduledExercisesRepo.deleteByUserAndDate(session.user.id, date);
    
    return NextResponse.json({ 
      message: 'Scheduled exercises deleted successfully',
      deletedCount
    });  } catch (error) {
    // Use the already awaited date parameter
    const { date } = await context.params;
    console.error(`Error deleting scheduled exercises for date ${date || 'unknown date'}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete scheduled exercises' },
      { status: 500 }
    );
  }
}
