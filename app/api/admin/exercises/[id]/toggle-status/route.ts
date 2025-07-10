import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import exercisesRepo from '@/lib/repositories/exercises-repo';
import { isAdmin } from '@/middleware/isAdmin';

/**
 * POST /api/admin/exercises/[id]/toggle-status
 * Toggle the active status of an exercise (admin only)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin privileges
    const userIsAdmin = await isAdmin(session.user.id);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }    const { id } = params;

    // First get current exercise to determine new status
    const currentExercise = await exercisesRepo.findById(id);
    if (!currentExercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    const newStatus = !currentExercise.isActive;
    const exercise = await exercisesRepo.toggleActiveStatus(id, newStatus, session.user.id);

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Exercise ${exercise.isActive ? 'activated' : 'deactivated'} successfully`,
      exercise
    });
  } catch (error) {
    console.error('Error toggling exercise status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle exercise status' },
      { status: 500 }
    );
  }
}
