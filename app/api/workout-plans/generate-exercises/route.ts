import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import WorkoutPlanRepository from '../../../../lib/repositories/workout-plan-repo';
import { z } from 'zod';

const generateExercisesSchema = z.object({
  workoutPlanId: z.string().min(1, 'Workout plan ID is required'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  replaceExisting: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = generateExercisesSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { workoutPlanId, startDate, endDate, replaceExisting } = validation.data;

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }    // Check if workout plan exists and belongs to user
    const workoutPlan = await WorkoutPlanRepository.findByIdAndUser(workoutPlanId, session.user.id);
    if (!workoutPlan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 });
    }

    const generatedExercises = await WorkoutPlanRepository.generateExercises(
      workoutPlanId,
      session.user.id,
      start,
      end,
      replaceExisting
    );

    return NextResponse.json({
      success: true,
      data: {
        exerciseCount: generatedExercises.length,
        exercises: generatedExercises,
        dateRange: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        }
      },
      message: `Generated ${generatedExercises.length} exercises for the specified date range`
    });

  } catch (error) {
    console.error('Error generating exercises:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
