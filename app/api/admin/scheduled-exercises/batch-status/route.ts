import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import scheduledExercisesRepo from '@/lib/repositories/scheduled-exercises-repo';
import { isAdmin } from '@/middleware/isAdmin';
import { z } from 'zod';

// Schema for validating batch update status request
const batchUpdateStatusSchema = z.object({
  ids: z.array(z.string()).min(1, { message: "At least one exercise ID is required" }),
  completed: z.boolean({ required_error: "Completed status is required" }),
});

/**
 * PATCH /api/admin/scheduled-exercises/batch-status
 * Update the completed status for multiple scheduled exercises at once (admin only)
 */
export async function PATCH(req: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
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

    const body = await req.json();
    
    // Validate request body
    const validationResult = batchUpdateStatusSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { ids, completed } = validationResult.data;
    
    // Update each exercise one by one
    const updatedExercises = [];
    const failedIds = [];
    
    for (const id of ids) {
      try {
        const updatedExercise = await scheduledExercisesRepo.update(id, { completed });
        if (updatedExercise) {
          updatedExercises.push(updatedExercise);
        } else {
          failedIds.push(id);
        }
      } catch (error) {
        console.error(`Error updating exercise ${id}:`, error);
        failedIds.push(id);
      }
    }
    
    return NextResponse.json({
      success: true,
      updatedCount: updatedExercises.length,
      failedIds: failedIds.length > 0 ? failedIds : undefined
    });
  } catch (error: any) {
    console.error("Error in batch update of scheduled exercises:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update scheduled exercises" },
      { status: 500 }
    );
  }
}
