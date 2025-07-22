import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ensureExercisesGenerated } from '@/lib/services/clients-service/exercise-generation-service';
import workoutPlanRepo from '@/lib/repositories/workout-plan-repo';

/**
 * API endpoint to ensure scheduled exercises are generated for a workout plan
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Handle empty request body gracefully
    let requestBody = {};
    try {
      const text = await req.text();
      if (text) {
        requestBody = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ 
        error: 'Invalid JSON in request body' 
      }, { status: 400 });
    }
    
    const { workoutPlanId, minDaysInAdvance = 7 } = requestBody as any;
    
    let planId = workoutPlanId;
    
    // If no workoutPlanId provided, use the user's active plan
    if (!planId) {
      const activePlan = await workoutPlanRepo.findActiveByUser(session.user.id);
      if (!activePlan) {
        return NextResponse.json({ 
          error: 'No workoutPlanId provided and no active workout plan found',
          success: false,
          count: 0,
        }, { status: 400 });
      }
      planId = activePlan._id?.toString() || activePlan.id;
    }
    
    if (!planId) {
      return NextResponse.json({ 
        error: 'Unable to determine workout plan ID',
        success: false,
        count: 0,
      }, { status: 400 });
    }
    
    // Generate exercises if needed
    const result = await ensureExercisesGenerated(planId, minDaysInAdvance);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error ensuring exercises are generated:', error);
    return NextResponse.json({ 
      error: 'Failed to ensure exercises are generated',
      success: false,
      count: 0,
    }, { status: 500 });
  }
}

// Ensure this endpoint is only accessible via POST
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
