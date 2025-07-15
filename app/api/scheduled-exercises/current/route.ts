import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
// Auth options are now directly used via getServerSession from auth-helpers;
import scheduledExercisesRepo from '@/lib/repositories/scheduled-exercises-repo';
import { format } from 'date-fns';

/**
 * GET /api/scheduled-exercises/current
 * Get scheduled exercises for the current day
 */
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get today's date in YYYY-MM-DD format
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Get exercises for today
    const exercises = await scheduledExercisesRepo.findByUserAndDate(
      session.user.id,
      today
    );
    
    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching current scheduled exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled exercises' },
      { status: 500 }
    );
  }
}
