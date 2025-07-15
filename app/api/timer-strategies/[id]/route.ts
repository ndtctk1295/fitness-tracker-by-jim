import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
// Auth options are now directly used via getServerSession from auth-helpers;
import timerStrategiesRepo from '@/lib/repositories/timer-strategies-repo';
import mongoose from 'mongoose';

/**
 * GET /api/timer-strategies/[id]
 * Get a specific timer strategy by ID (must belong to authenticated user)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid timer strategy ID format' },
        { status: 400 }
      );
    }
    
    const timerStrategy = await timerStrategiesRepo.findById(id);
    
    // Check if timer strategy exists
    if (!timerStrategy) {
      return NextResponse.json(
        { error: 'Timer strategy not found' },
        { status: 404 }
      );
    }
    
    // Ensure user owns this timer strategy
    if (timerStrategy.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to access this timer strategy' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(timerStrategy);
  } catch (error) {
    console.error(`Error fetching timer strategy ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch timer strategy' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/timer-strategies/[id]
 * Update a specific timer strategy (must belong to authenticated user)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid timer strategy ID format' },
        { status: 400 }
      );
    }
    
    // Check if timer strategy exists and belongs to user
    const existingTimerStrategy = await timerStrategiesRepo.findById(id);
    if (!existingTimerStrategy) {
      return NextResponse.json(
        { error: 'Timer strategy not found' },
        { status: 404 }
      );
    }
    
    // Ensure user owns this timer strategy
    if (existingTimerStrategy.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to update this timer strategy' },
        { status: 403 }
      );
    }
    
    // Get data from request
    const data = await req.json();
    
    // Validate data
    if (data.name !== undefined && typeof data.name !== 'string') {
      return NextResponse.json(
        { error: 'Strategy name must be a string' },
        { status: 400 }
      );
    }

    if (data.restDuration !== undefined && 
       (typeof data.restDuration !== 'number' || data.restDuration < 5)) {
      return NextResponse.json(
        { error: 'Rest duration must be a number of at least 5 seconds' },
        { status: 400 }
      );
    }
    
    if (data.activeDuration !== undefined && 
       (typeof data.activeDuration !== 'number' || data.activeDuration < 5)) {
      return NextResponse.json(
        { error: 'Active duration must be a number of at least 5 seconds' },
        { status: 400 }
      );
    }
    
    // Update the timer strategy
    const updatedTimerStrategy = await timerStrategiesRepo.update(id, {
      name: data.name,
      color: data.color,
      restDuration: data.restDuration,
      activeDuration: data.activeDuration,
    });
    
    return NextResponse.json(updatedTimerStrategy);
  } catch (error) {
    console.error(`Error updating timer strategy ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update timer strategy' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/timer-strategies/[id]
 * Delete a specific timer strategy (must belong to authenticated user)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid timer strategy ID format' },
        { status: 400 }
      );
    }
    
    // Check if timer strategy exists and belongs to user
    const existingTimerStrategy = await timerStrategiesRepo.findById(id);
    if (!existingTimerStrategy) {
      return NextResponse.json(
        { error: 'Timer strategy not found' },
        { status: 404 }
      );
    }
    
    // Ensure user owns this timer strategy
    if (existingTimerStrategy.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to delete this timer strategy' },
        { status: 403 }
      );
    }
    
    // Delete the timer strategy
    await timerStrategiesRepo.delete(id);
    
    return NextResponse.json(
      { message: 'Timer strategy deleted successfully' }
    );
  } catch (error) {
    console.error(`Error deleting timer strategy ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete timer strategy' },
      { status: 500 }
    );
  }
}
