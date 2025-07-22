import { NextResponse } from 'next/server';
import { generateExercisesForAllActivePlans } from '@/lib/services/clients-service/exercise-generation-service';

/**
 * CRON endpoint for automatically generating scheduled exercises for all active workout plans
 * This endpoint should be called by a scheduled job (e.g., daily at 2 AM)
 */
export async function POST(req: Request) {
  try {
    // Verify the request is from our cron system
    const authHeader = req.headers.get('Authorization');
    const cronSecretKey = process.env.CRON_SECRET_KEY;
    
    if (!cronSecretKey) {
      console.error('CRON_SECRET_KEY environment variable is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    if (authHeader !== `Bearer ${cronSecretKey}`) {
      console.error('Unauthorized CRON request attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Starting scheduled exercise generation for all active plans...');
    
    // Generate exercises for all active plans
    const result = await generateExercisesForAllActivePlans();
    
    console.log('Scheduled exercise generation completed:', {
      plansProcessed: result.plansProcessed,
      exercisesGenerated: result.exercisesGenerated,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error('Error in scheduled exercise generation:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
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
