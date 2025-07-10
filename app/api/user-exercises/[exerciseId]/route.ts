import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import userExercisePreferenceRepo from '@/lib/repositories/user-exercise-preference-repo';

/**
 * GET /api/user-exercises/[exerciseId]
 * Get user's preference for a specific exercise
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { exerciseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { exerciseId } = params;

    const preference = await userExercisePreferenceRepo.findByUserAndExercise(
      session.user.id,
      exerciseId
    );

    if (!preference) {
      return NextResponse.json(
        { error: 'Exercise preference not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(preference);
  } catch (error) {
    console.error('Error fetching user exercise preference:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user exercise preference' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user-exercises/[exerciseId]
 * Update user's preference for a specific exercise
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { exerciseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { exerciseId } = params;
    const body = await req.json();
    const { status, notes, customSettings } = body;    // Validation
    if (status && !['favorite'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value. Only "favorite" is allowed.' },
        { status: 400 }
      );
    }

    const preference = await userExercisePreferenceRepo.update(
      session.user.id,
      exerciseId,
      { status, notes, customSettings }
    );

    if (!preference) {
      return NextResponse.json(
        { error: 'Exercise preference not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(preference);
  } catch (error) {
    console.error('Error updating user exercise preference:', error);
    return NextResponse.json(
      { error: 'Failed to update user exercise preference' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user-exercises/[exerciseId]
 * Remove user's preference for a specific exercise
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { exerciseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { exerciseId } = params;    const success = await userExercisePreferenceRepo.delete(
      session.user.id,
      exerciseId
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Exercise preference not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Exercise preference removed successfully' });
  } catch (error) {
    console.error('Error removing user exercise preference:', error);
    return NextResponse.json(
      { error: 'Failed to remove user exercise preference' },
      { status: 500 }
    );
  }
}
