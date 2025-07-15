import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
// Auth options are now directly used via getServerSession from auth-helpers;
import weightsRepo from '@/lib/repositories/weights-repo';
import mongoose from 'mongoose';
import { isAdmin } from '@/middleware/isAdmin';

/**
 * GET /api/admin/weights/[id]
 * Get a specific weight plate by ID (admin access)
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
    
    return NextResponse.json(weightPlate);
  } catch (error) {
    console.error(`Error fetching weight plate ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch weight plate' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/weights/[id]
 * Update a specific weight plate (admin access)
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
        { error: 'Invalid weight plate ID format' },
        { status: 400 }
      );
    }
    
    // Check if weight plate exists
    const existingWeightPlate = await weightsRepo.findById(id);
    if (!existingWeightPlate) {
      return NextResponse.json(
        { error: 'Weight plate not found' },
        { status: 404 }
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
    console.error(`Error updating weight plate ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update weight plate' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/weights/[id]
 * Delete a specific weight plate (admin access)
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
        { error: 'Invalid weight plate ID format' },
        { status: 400 }
      );
    }
    
    // Check if weight plate exists
    const existingWeightPlate = await weightsRepo.findById(id);
    if (!existingWeightPlate) {
      return NextResponse.json(
        { error: 'Weight plate not found' },
        { status: 404 }
      );
    }
    
    // Delete the weight plate
    await weightsRepo.delete(id);
    
    return NextResponse.json(
      { message: 'Weight plate deleted successfully' }
    );
  } catch (error) {
    console.error(`Error deleting weight plate ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete weight plate' },
      { status: 500 }
    );
  }
}
