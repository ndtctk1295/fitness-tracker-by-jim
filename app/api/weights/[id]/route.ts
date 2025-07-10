import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import weightsRepo from '@/lib/repositories/weights-repo';
import mongoose from 'mongoose';

/**
 * GET /api/weights/[id]
 * Get a specific weight plate by ID (must belong to authenticated user)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid weight plate ID format' },
        { status: 400 }
      );
    }
    
    const weightPlate = await weightsRepo.findById(id);
    
    // Check if weight plate exists
    if (!weightPlate) {
      return NextResponse.json(
        { error: 'Weight plate not found' },
        { status: 404 }
      );
    }
    
    // Ensure user owns this weight plate
    if (weightPlate.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to access this weight plate' },
        { status: 403 }
      );
    }
      return NextResponse.json(weightPlate);
  } catch (error) {
    const { id } = await params;
    console.error(`Error fetching weight plate ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch weight plate' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/weights/[id]
 * Update a specific weight plate (must belong to authenticated user)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid weight plate ID format' },
        { status: 400 }
      );
    }
    
    // Check if weight plate exists and belongs to user
    const existingWeightPlate = await weightsRepo.findById(id);
    if (!existingWeightPlate) {
      return NextResponse.json(
        { error: 'Weight plate not found' },
        { status: 404 }
      );
    }
    
    // Ensure user owns this weight plate
    if (existingWeightPlate.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to update this weight plate' },
        { status: 403 }
      );
    }
    
    // Get data from request
    const data = await req.json();
    
    // Validate data
    if (data.value !== undefined && typeof data.value !== 'number') {
      return NextResponse.json(
        { error: 'Weight value must be a number' },
        { status: 400 }
      );
    }
    
    // Update the weight plate
    const updatedWeightPlate = await weightsRepo.update(id, {
      value: data.value,
      color: data.color,
    });
      return NextResponse.json(updatedWeightPlate);
  } catch (error) {
    const { id } = await params;
    console.error(`Error updating weight plate ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update weight plate' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/weights/[id]
 * Delete a specific weight plate (must belong to authenticated user)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid weight plate ID format' },
        { status: 400 }
      );
    }
    
    // Check if weight plate exists and belongs to user
    const existingWeightPlate = await weightsRepo.findById(id);
    if (!existingWeightPlate) {
      return NextResponse.json(
        { error: 'Weight plate not found' },
        { status: 404 }
      );
    }
    
    // Ensure user owns this weight plate
    if (existingWeightPlate.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to delete this weight plate' },
        { status: 403 }
      );
    }
    
    // Delete the weight plate
    await weightsRepo.delete(id);
      return NextResponse.json(
      { message: 'Weight plate deleted successfully' }
    );
  } catch (error) {
    const { id } = await params;
    console.error(`Error deleting weight plate ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete weight plate' },
      { status: 500 }
    );
  }
}
