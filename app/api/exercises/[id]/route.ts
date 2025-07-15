import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
// Auth options are now directly used via getServerSession from auth-helpers;
import exercisesRepo from '@/lib/repositories/exercises-repo';
import isAdmin from '@/middleware/isAdmin';
import mongoose from 'mongoose';

/**
 * GET /api/exercises/[id]
 * Get a specific exercise by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid exercise ID format' },
        { status: 400 }
      );
    }
    
    const exercise = await exercisesRepo.findById(id);
    
    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }
      return NextResponse.json(exercise);
  } catch (error) {
    const { id } = await params;
    console.error(`Error fetching exercise ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch exercise' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/exercises/[id]
 * Update a specific exercise (admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    
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
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid exercise ID format' },
        { status: 400 }
      );
    }
    
    const data = await req.json();
    
    // Check if exercise exists
    const existingExercise = await exercisesRepo.findById(id);
    if (!existingExercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }
    
    // Update the exercise
    const updatedExercise = await exercisesRepo.update(id, {
      ...data,
      updatedBy: session.user.id
    });
      return NextResponse.json(updatedExercise);
  } catch (error) {
    const { id } = await params;
    console.error(`Error updating exercise ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update exercise' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/exercises/[id]
 * Delete a specific exercise (admin only)
 */
export async function DELETE(
  req: NextRequest,  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    
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
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid exercise ID format' },
        { status: 400 }
      );
    }
    
    const exercise = await exercisesRepo.delete(id);
    
    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }
      return NextResponse.json(
      { message: 'Exercise deleted successfully' }
    );
  } catch (error) {
    const { id } = await params;
    console.error(`Error deleting exercise ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete exercise' },
      { status: 500 }
    );
  }
}
