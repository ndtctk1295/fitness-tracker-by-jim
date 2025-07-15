import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
// Auth options are now directly used via getServerSession from auth-helpers;
import timerStrategiesRepo from '@/lib/repositories/timer-strategies-repo';

/**
 * GET /api/timer-strategies
 * Get all timer strategies for the authenticated user
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
    const timerStrategies = await timerStrategiesRepo.findAllByUserId(userId);
    
    return NextResponse.json(timerStrategies);
  } catch (error) {
    console.error('Error fetching timer strategies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timer strategies' },
      { status: 500 }
    );
  }
}

/**
 *   /api/timer-strategies
 * Create a new timer strategy for the authenticated user
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Strategy name is required' },
        { status: 400 }
      );
    }
    
    if (!data.color) {
      return NextResponse.json(
        { error: 'Strategy color is required' },
        { status: 400 }
      );
    }
    
    if (typeof data.restDuration !== 'number' || data.restDuration < 5) {
      return NextResponse.json(
        { error: 'Rest duration must be a number of at least 5 seconds' },
        { status: 400 }
      );
    }
    
    if (typeof data.activeDuration !== 'number' || data.activeDuration < 5) {
      return NextResponse.json(
        { error: 'Active duration must be a number of at least 5 seconds' },
        { status: 400 }
      );
    }
    
    // Create the timer strategy associated with the current user
    const timerStrategy = await timerStrategiesRepo.create({
      userId: session.user.id,
      name: data.name,
      color: data.color,
      restDuration: data.restDuration,
      activeDuration: data.activeDuration,
    });
    
    return NextResponse.json(timerStrategy, { status: 201 });
  } catch (error) {
    console.error('Error creating timer strategy:', error);
    return NextResponse.json(
      { error: 'Failed to create timer strategy' },
      { status: 500 }
    );
  }
}
