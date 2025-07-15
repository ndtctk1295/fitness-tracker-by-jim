import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
import { authOptions } from '../../../auth/[...nextauth]/route';
import WorkoutPlanRepository from '../../../../../lib/repositories/workout-plan-repo';
import { z } from 'zod';

const duplicateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  includeProgress: z.boolean().default(false),
});

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

    const body = await request.json();
    const validation = duplicateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, includeProgress } = validation.data;    const duplicatedPlan = await WorkoutPlanRepository.duplicate(
      id,
      session.user.id,
      name
    );
    
    if (!duplicatedPlan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: duplicatedPlan,
      message: 'Workout plan duplicated successfully'
    });

  } catch (error) {
    console.error('Error duplicating workout plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
