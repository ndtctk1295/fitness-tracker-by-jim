import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
// Auth options are now directly used via getServerSession from auth-helpers;
import ScheduledExercise from '@/lib/models/scheduled-exercise';
import User from '@/lib/models/user';
import { isAdmin } from '@/middleware/isAdmin';
import connectToMongoDB from '@/lib/mongodb';
import { z } from 'zod';
import mongoose from 'mongoose';

// Schema for validating copy between users request
const copyBetweenUsersSchema = z.object({
  fromUserId: z.string().min(1, { message: "Source user ID is required" }),
  toUserId: z.string().min(1, { message: "Target user ID is required" }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Source date must be in yyyy-MM-dd format" }),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Target date must be in yyyy-MM-dd format" }).optional(),
});

/**
 * POST /api/admin/scheduled-exercises/copy-between-users
 * Copy scheduled exercises from one user to another for a specific date (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession();
    
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
    const validationResult = copyBetweenUsersSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { fromUserId, toUserId, date, targetDate } = validationResult.data;
    const finalTargetDate = targetDate || date;
    
    // Validate user IDs format
    if (!mongoose.Types.ObjectId.isValid(fromUserId) || !mongoose.Types.ObjectId.isValid(toUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }
    
    await connectToMongoDB();
    
    // Verify both users exist
    const sourceUser = await User.findById(fromUserId);
    const targetUser = await User.findById(toUserId);
    
    if (!sourceUser) {
      return NextResponse.json(
        { error: "Source user not found" },
        { status: 404 }
      );
    }
    
    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }
    
    // Get source user's exercises for the specified date
    const sourceExercises = await ScheduledExercise.find({
      userId: fromUserId,
      date
    });
    
    if (sourceExercises.length === 0) {
      return NextResponse.json({
        message: "No exercises found for the source user on the specified date",
        copiedCount: 0
      });
    }
    
    // Create new exercises for the target user
    const createdExercises = [];
      for (const sourceExercise of sourceExercises) {
      const exerciseData: {
        userId: string;
        exerciseId: mongoose.Types.ObjectId;
        categoryId: mongoose.Types.ObjectId;
        date: string;
        sets: number;
        reps: number;
        weight: number;
        notes?: string;
        weightPlates?: Record<string, number>;
      } = {
        userId: toUserId,
        exerciseId: sourceExercise.exerciseId,
        categoryId: sourceExercise.categoryId,
        date: finalTargetDate,
        sets: sourceExercise.sets,
        reps: sourceExercise.reps,
        weight: sourceExercise.weight,
        notes: sourceExercise.notes,
      };
      
      if (sourceExercise.weightPlates) {
        exerciseData.weightPlates = sourceExercise.weightPlates;
      }
      
      const newExercise = new ScheduledExercise(exerciseData);
      await newExercise.save();
      
      const plainExercise = newExercise.toObject();
      createdExercises.push({
        ...plainExercise,
        userName: targetUser.name || 'Unknown User'
      });
    }
    
    return NextResponse.json({
      success: true,
      copiedCount: createdExercises.length,
      exercises: createdExercises
    });
  } catch (error: any) {
    console.error("Error copying exercises between users:", error);
    return NextResponse.json(
      { error: error.message || "Failed to copy scheduled exercises" },
      { status: 500 }
    );
  }
}
