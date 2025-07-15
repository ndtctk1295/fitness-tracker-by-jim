import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
// Auth options are now directly used via getServerSession from auth-helpers;
import scheduledExercisesRepo from '@/lib/repositories/scheduled-exercises-repo';
import User from '@/lib/models/user';
import { isAdmin } from '@/middleware/isAdmin';
import mongoose from 'mongoose';
import { z } from 'zod';

// Validation schema for scheduled exercise
const scheduledExerciseSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  exerciseId: z.string().min(1, { message: "Exercise ID is required" }),
  categoryId: z.string().min(1, { message: "Category ID is required" }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in yyyy-MM-dd format" }),
  sets: z.number().int().min(1, { message: "Sets must be at least 1" }),
  reps: z.number().int().min(1, { message: "Reps must be at least 1" }),
  weight: z.number().min(0, { message: "Weight cannot be negative" }),
  weightPlates: z.record(z.string(), z.number()).optional(),
});

/**
 * GET /api/admin/scheduled-exercises
 * Get all scheduled exercises across all users (admin only)
 * @query userId - Optional: filter by specific user
 * @query date - Optional: filter by specific date (yyyy-MM-dd)
 * @query startDate - Optional: filter by date range start (yyyy-MM-dd)
 * @query endDate - Optional: filter by date range end (yyyy-MM-dd)
 */
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
      // Check if user is admin
    const isUserAdmin = await isAdmin(session.user.id);
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    // Add enhanced user information to each scheduled exercise
    const scheduledExercisesWithUserData = await scheduledExercisesRepo.findAllWithUserData();
    
    return NextResponse.json(scheduledExercisesWithUserData);
  } catch (error) {
    console.error('Error fetching scheduled exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled exercises' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/scheduled-exercises
 * Create a new scheduled exercise for any user (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
      // Check if user is admin
    const isUserAdmin = await isAdmin(session.user.id);
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const data = await req.json();
    
    // Validate input data
    const validationResult = scheduledExerciseSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid data',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }
    
    // Validate user ID format and existence
    if (!mongoose.Types.ObjectId.isValid(data.userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    const user = await User.findById(data.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Create the scheduled exercise
    const scheduledExercise = await scheduledExercisesRepo.create(validationResult.data);
    
    return NextResponse.json(scheduledExercise, { status: 201 });
  } catch (error) {
    console.error('Error creating scheduled exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduled exercise' },
      { status: 500 }
    );
  }
}
