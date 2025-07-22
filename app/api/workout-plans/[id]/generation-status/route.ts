import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { checkGenerationStatus } from '@/lib/services/clients-service/exercise-generation-service';

/**
 * API endpoint to check generation status for a specific workout plan
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const minDaysInAdvance = parseInt(searchParams.get('minDaysInAdvance') || '7');
    
    // Check generation status for the plan
    const status = await checkGenerationStatus(id, minDaysInAdvance);
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error checking generation status:', error);
    return NextResponse.json({ 
      error: 'Failed to check generation status',
      needsGeneration: false,
      nextTargetDate: new Date().toISOString().split('T')[0],
      daysToGenerate: 0,
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
