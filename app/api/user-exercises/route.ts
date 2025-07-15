import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
// Auth options are now directly used via getServerSession from auth-helpers;
import userExercisePreferenceRepo from '@/lib/repositories/user-exercise-preference-repo';

/**
 * GET /api/user-exercises
 * Get user's exercise preferences with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }    const url = new URL(req.url);
    const status = url.searchParams.get('status') as 'favorite' | null;
    const limit = url.searchParams.get('limit');

    const options: any = {};
    if (status) {
      options.status = status;
    }
    if (limit) {
      options.limit = parseInt(limit, 10);
    }

    const preferences = await userExercisePreferenceRepo.findByUserId(
      session.user.id,
      options
    );

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching user exercise preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user exercise preferences' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user-exercises
 * Create a new user exercise preference
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { exerciseId, status, notes, customSettings } = body;

    // Validation
    if (!exerciseId || !status) {
      return NextResponse.json(
        { error: 'exerciseId and status are required' },
        { status: 400 }
      );
    }    if (!['favorite'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400}
      );
    }

    const preference = await userExercisePreferenceRepo.create({
      userId: session.user.id,
      exerciseId,
      status,
      notes,
      customSettings
    });

    return NextResponse.json(preference, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user exercise preference:', error);
    
    if (error.message === 'User already has a preference for this exercise') {
      return NextResponse.json(
        { error: 'You already have a preference for this exercise' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user exercise preference' },
      { status: 500 }
    );
  }
}
