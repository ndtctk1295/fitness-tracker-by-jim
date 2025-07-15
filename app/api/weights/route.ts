import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
// Auth options are now directly used via getServerSession from auth-helpers;
import weightsRepo from '@/lib/repositories/weights-repo';

/**
 * GET /api/weights
 * Get all weight plates for the authenticated user
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
    const weights = await weightsRepo.findAllByUserId(userId);
    
    return NextResponse.json(weights);
  } catch (error) {
    console.error('Error fetching weights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weights' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/weights
 * Create a new weight plate for the authenticated user
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
    if (typeof data.value !== 'number' || !data.color) {
      return NextResponse.json(
        { error: 'Weight value and color are required' },
        { status: 400 }
      );
    }
    
    // Create the weight plate associated with the current user
    const weightPlate = await weightsRepo.create({
      userId: session.user.id,
      value: data.value,
      color: data.color,
    });
    
    return NextResponse.json(weightPlate, { status: 201 });
  } catch (error) {
    console.error('Error creating weight plate:', error);
    return NextResponse.json(
      { error: 'Failed to create weight plate' },
      { status: 500 }
    );
  }
}
