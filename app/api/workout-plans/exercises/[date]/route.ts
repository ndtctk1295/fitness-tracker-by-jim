import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
import { authOptions } from '../../../auth/[...nextauth]/route';
import WorkoutPlanRepository from '../../../../../lib/repositories/workout-plan-repo';

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date } = await params;
    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // Parse and validate date
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const workoutPlanId = searchParams.get('workoutPlanId');
    const includeCompleted = searchParams.get('includeCompleted') === 'true';

    const exercises = await WorkoutPlanRepository.getExercisesByDate(
      session.user.id,
      targetDate,
      workoutPlanId || undefined,
      includeCompleted
    );

    return NextResponse.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        exercises,
        exerciseCount: exercises.length,
        workoutPlanId: workoutPlanId || null
      }
    });

  } catch (error) {
    console.error('Error fetching exercises by date:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date } = params;
    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // Parse and validate date
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const body = await request.json();
    const { workoutPlanId, replaceExisting = false } = body;

    if (!workoutPlanId) {
      return NextResponse.json({ error: 'Workout plan ID is required' }, { status: 400 });
    }    // Check if workout plan exists and belongs to user
    const workoutPlan = await WorkoutPlanRepository.findByIdAndUser(workoutPlanId, session.user.id);
    if (!workoutPlan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 });
    }

    const generatedExercises = await WorkoutPlanRepository.generateExercisesForDate(
      workoutPlanId,
      session.user.id,
      targetDate,
      replaceExisting
    );

    return NextResponse.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        exercises: generatedExercises,
        exerciseCount: generatedExercises.length,
        workoutPlanId
      },
      message: `Generated ${generatedExercises.length} exercises for ${targetDate.toISOString().split('T')[0]}`
    });

  } catch (error) {
    console.error('Error generating exercises for date:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
