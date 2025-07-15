import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
import { authOptions } from '../../auth/[...nextauth]/route';
import WorkoutPlan from '../../../../lib/models/workout-plan';
import mongoose from 'mongoose';
import { z } from 'zod';

const resolveConflictsSchema = z.object({
  workoutPlanId: z.string().min(1, 'Workout plan ID is required'),
  conflictIds: z.array(z.string()).min(1, 'At least one conflict ID is required'),
  resolution: z.enum(['replace', 'keep_existing', 'merge']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = resolveConflictsSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { workoutPlanId, conflictIds, resolution, startDate, endDate } = validation.data;    const result = await WorkoutPlan.resolveConflicts(
      new mongoose.Types.ObjectId(workoutPlanId),
      new mongoose.Types.ObjectId(session.user.id),
      conflictIds,
      resolution,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: `Conflicts resolved using ${resolution} strategy`
    });

  } catch (error) {
    console.error('Error resolving conflicts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
