import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
// Auth options are now directly used via getServerSession from auth-helpers;
import scheduledExercisesRepo from '@/lib/repositories/scheduled-exercises-repo';
import { z } from 'zod';

// Validation schema for reordering exercises
const reorderExercisesSchema = z.object({
  exerciseIds: z.array(z.string().min(1, { message: "Exercise ID is required" })),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in yyyy-MM-dd format" }),
});

/**
 * PUT /api/scheduled-exercises/reorder
 * Update the order of scheduled exercises for a specific date
 */
export async function PUT(req: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse and validate input data
    const data = await req.json();
    const validationResult = reorderExercisesSchema.safeParse(data);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid data', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }
    
    const { exerciseIds, date } = validationResult.data;
    
    // Get all exercises for this date and user
    const existingExercises = await scheduledExercisesRepo.findByUserAndDate(
      session.user.id, 
      date
    );
      // Map of exercise IDs to their database documents
    const exerciseMap: Record<string, any> = existingExercises.reduce((map: Record<string, any>, ex) => {
      map[ex.id] = ex;
      return map;
    }, {});
    
    // Update the order for each exercise
    const updatePromises = exerciseIds.map((id, index) => {
      // Verify the exercise exists and belongs to the user
      if (!exerciseMap[id]) {
        throw new Error(`Exercise with ID ${id} not found or does not belong to the user`);
      }
      
      // Update the order index
      return scheduledExercisesRepo.update(id, { orderIndex: index });
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    // Return the updated exercises
    const updatedExercises = await scheduledExercisesRepo.findByUserAndDate(
      session.user.id,
      date
    );
    
    // Sort by orderIndex before returning
    updatedExercises.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    
    return NextResponse.json(updatedExercises);
  } catch (error) {
    console.error('Error updating exercise order:', error);
    return NextResponse.json(
      { error: 'Failed to update exercise order' },
      { status: 500 }
    );
  }
}
