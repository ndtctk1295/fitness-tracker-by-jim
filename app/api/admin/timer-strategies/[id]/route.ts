import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import timerStrategiesRepo from '@/lib/repositories/timer-strategies-repo';
import mongoose from 'mongoose';
import { isAdmin } from '@/middleware/isAdmin';

/**
 * GET /api/admin/timer-strategies/[id]
 * Get a specific timer strategy by ID (admin access)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin role
    const isUserAdmin = await isAdmin(session.user.id);
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
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
 * PUT /api/admin/timer-strategies/[id]
 * Update a specific timer strategy (admin access)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin role
    const isUserAdmin = await isAdmin(session.user.id);
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
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
    
    // Check if timer strategy exists
    const existingTimerStrategy = await timerStrategiesRepo.findById(id);
    if (!existingTimerStrategy) {
      return NextResponse.json(
        { error: 'Timer strategy not found' },
        { status: 404 }
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
 * DELETE /api/admin/timer-strategies/[id]
 * Delete a specific timer strategy (admin access)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin role
    const isUserAdmin = await isAdmin(session.user.id);
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
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
    
    // Check if timer strategy exists
    const existingTimerStrategy = await timerStrategiesRepo.findById(id);
    if (!existingTimerStrategy) {
      return NextResponse.json(
        { error: 'Timer strategy not found' },
        { status: 404 }
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
