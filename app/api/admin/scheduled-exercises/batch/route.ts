import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import scheduledExercisesRepo from '@/lib/repositories/scheduled-exercises-repo';
import { isAdmin } from '@/middleware/isAdmin';
import { z } from 'zod';
import User from '@/lib/models/user';
import mongoose from 'mongoose';

// Schema for validating exercise items in batch
const exerciseItemSchema = z.object({
  exerciseId: z.string().min(1, { message: "Exercise ID is required" }),
  categoryId: z.string().min(1, { message: "Category ID is required" }),
  sets: z.number().int().min(1, { message: "Sets must be at least 1" }).default(3),
  reps: z.number().int().min(1, { message: "Reps must be at least 1" }).default(10),
  weight: z.number().min(0, { message: "Weight cannot be negative" }).default(0),
  weightPlates: z.record(z.string(), z.number()).optional(),
  notes: z.string().optional(),
});

// Schema for validating batch creation request
const batchCreateSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in yyyy-MM-dd format" }),
  exercises: z.array(exerciseItemSchema).min(1, { message: "At least one exercise is required" }),
});

/**
 * POST /api/admin/scheduled-exercises/batch
 * Create multiple scheduled exercises in a batch (admin only)
 */
export async function POST(req: NextRequest) {
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
    const validationResult = batchCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { userId, date, exercises } = validationResult.data;
    
    // Validate user ID format and existence
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Create exercises in batch
    const createdExercises = [];
    
    for (const exercise of exercises) {
      const scheduledExercise = await scheduledExercisesRepo.create({
        userId,
        date,
        ...exercise
      });
      
      createdExercises.push(scheduledExercise);
    }
    
    // Add user data for admin view
    const exercisesWithUserData = createdExercises.map(exercise => {
      const plainExercise = exercise.toObject ? exercise.toObject() : exercise;
      return {
        ...plainExercise,
        userName: user.name || 'Unknown User'
      };
    });
    
    return NextResponse.json(exercisesWithUserData, { status: 201 });
  } catch (error: any) {
    console.error("Error in batch creation of scheduled exercises:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create scheduled exercises" },
      { status: 500 }
    );
  }
}
