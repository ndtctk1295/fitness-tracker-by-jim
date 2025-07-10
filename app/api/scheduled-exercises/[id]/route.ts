import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import scheduledExercisesRepo from '@/lib/repositories/scheduled-exercises-repo';
import mongoose from 'mongoose';
import { z } from 'zod';

// Validation schema for scheduled exercise updates
const scheduledExerciseUpdateSchema = z.object({
  exerciseId: z.string().optional(),
  categoryId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in yyyy-MM-dd format" }).optional(),
  sets: z.number().int().min(0, { message: "Sets must be at least 0" }).optional(),
  reps: z.number().int().min(0, { message: "Reps must be at least 0" }).optional(),
  weight: z.number().min(0, { message: "Weight cannot be negative" }).optional(),
  weightPlates: z.record(z.string(), z.number()).optional(),
  notes: z.string().optional(),
  completed: z.boolean().optional(),
  completedAt: z.string().optional(),
  isHidden: z.boolean().optional(),
});

/**
 * GET /api/scheduled-exercises/[id]
 * Get a specific scheduled exercise by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract id directly from params (await for Next.js 15+)
    const { id } = await params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Find the scheduled exercise by ID for the authenticated user
    const scheduledExercise = await scheduledExercisesRepo.findByIdAndUser(id, userId);

    if (!scheduledExercise) {
      return NextResponse.json(
        { error: 'Scheduled exercise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(scheduledExercise);
  } catch (error) {
    console.error('Error fetching scheduled exercise:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/scheduled-exercises/[id]
 * Update a specific scheduled exercise by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract id directly from params (await for Next.js 15+)
    const { id } = await params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse and validate request body
    const body = await request.json();
    const validation = scheduledExerciseUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // Find and update the scheduled exercise
    const updatedExercise = await scheduledExercisesRepo.updateByIdAndUser(
      id,
      userId,
      updateData
    );

    if (!updatedExercise) {
      return NextResponse.json(
        { error: 'Scheduled exercise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedExercise);
  } catch (error) {
    console.error('Error updating scheduled exercise:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/scheduled-exercises/[id]
 * Delete a specific scheduled exercise by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract id directly from params (await for Next.js 15+)
    const { id } = await params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Find the scheduled exercise by ID for the authenticated user
    const existingExercise = await scheduledExercisesRepo.findByIdAndUser(id, userId);

    if (!existingExercise) {
      return NextResponse.json(
        { error: 'Scheduled exercise not found' },
        { status: 404 }
      );
    }

    // Delete the scheduled exercise
    await scheduledExercisesRepo.deleteByIdAndUser(id, userId);

    return NextResponse.json(
      { message: 'Scheduled exercise deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting scheduled exercise:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}