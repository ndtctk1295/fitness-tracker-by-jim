import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { checkGenerationStatus } from '@/lib/services/exercise-generation-service';
import workoutPlanRepo from '@/lib/repositories/workout-plan-repo';

/**
 * API endpoint to check if scheduled exercise generation is needed for the user's active workout plan
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user's active workout plan using the repository
    const activePlan = await workoutPlanRepo.findActiveByUser(session.user.id);
    
    if (!activePlan) {
      return NextResponse.json({ 
        needsGeneration: false,
        message: 'No active workout plan found' 
      });
    }
    
    // Get the plan ID - handle both _id and id
    const planId = activePlan._id || activePlan.id;
    if (!planId) {
      return NextResponse.json({ 
        needsGeneration: false,
        message: 'Active workout plan has no valid ID' 
      });
    }
    
    // Check generation status for the active plan
    const status = await checkGenerationStatus(planId, 7); // Check for next 7 days
    
    return NextResponse.json({
      needsGeneration: status.needsGeneration,
      latestGeneratedDate: status.latestGeneratedDate,
      nextTargetDate: status.nextTargetDate,
      daysToGenerate: status.daysToGenerate,
      planId: planId,
    });
  } catch (error) {
    console.error('Error checking if exercises need generation:', error);
    return NextResponse.json({ 
      error: 'Failed to check generation status',
      needsGeneration: false,
    }, { status: 500 });
  }
}

// Ensure this endpoint is only accessible via GET
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
