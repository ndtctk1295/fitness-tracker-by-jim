import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
import { authOptions } from '../../../auth/[...nextauth]/route';
import WorkoutPlanRepository from '../../../../../lib/repositories/workout-plan-repo';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const workoutPlan = await WorkoutPlanRepository.activate(id, session.user.id);
    
    if (!workoutPlan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: workoutPlan,
      message: 'Workout plan activated successfully'
    });

  } catch (error) {
    console.error('Error activating workout plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
