import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import WorkoutPlan from '../../../../lib/models/workout-plan';
import mongoose from 'mongoose';
import { z } from 'zod';

const checkConflictsSchema = z.object({
  workoutPlanId: z.string().min(1, 'Workout plan ID is required'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = checkConflictsSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { workoutPlanId, startDate, endDate } = validation.data;    const conflicts = await WorkoutPlan.checkConflicts(
      new mongoose.Types.ObjectId(workoutPlanId),
      new mongoose.Types.ObjectId(session.user.id),
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return NextResponse.json({
      success: true,
      data: {
        hasConflicts: conflicts.length > 0,
        conflicts,
        conflictCount: conflicts.length
      }
    });

  } catch (error) {
    console.error('Error checking conflicts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
