import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
// Auth options are now directly used via getServerSession from auth-helpers;
import workoutPlanRepo from '@/lib/repositories/workout-plan-repo';

/**
 * GET /api/workout-plans/active
 * Get the currently active workout plan for the authenticated user
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

    const userId = session.user.id;

    // Find the active workout plan
    const activePlan = await workoutPlanRepo.findActiveByUser(userId);
    
    if (!activePlan) {
      return NextResponse.json(null);
    }

    return NextResponse.json(activePlan);
  } catch (error) {
    console.error('Error fetching active workout plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
