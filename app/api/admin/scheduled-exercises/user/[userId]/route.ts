import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ScheduledExercise from '@/lib/models/scheduled-exercise';
import User from '@/lib/models/user';
import { isAdmin } from '@/middleware/isAdmin';
import connectToMongoDB from '@/lib/mongodb';
import mongoose from 'mongoose';

/**
 * GET /api/admin/scheduled-exercises/user/[userId]
 * Get all scheduled exercises for a specific user (admin only)
 * @param userId - The user ID to query for
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    const { userId } = params;
    
    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }
    
    await connectToMongoDB();
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Fetch exercises for the specified user
    const exercises = await ScheduledExercise.find({ userId })
      .sort({ date: -1, createdAt: -1 });
    
    // Add userName to each exercise
    const userName = user.name || user.email || 'Unknown User';
    const exercisesWithUserData = exercises.map(exercise => {
      const plainExercise = exercise.toObject();
      return {
        ...plainExercise,
        userName
      };
    });
    
    return NextResponse.json(exercisesWithUserData);
  } catch (error: any) {
    console.error(`Error fetching scheduled exercises for user:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch scheduled exercises" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/scheduled-exercises/user/[userId]
 * Delete all scheduled exercises for a specific user (admin only)
 * @param userId - The user ID to delete exercises for
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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
    }    const { userId } = params;
    
    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }
    
    await connectToMongoDB();
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Delete all exercises for the specified user
    const result = await ScheduledExercise.deleteMany({ userId });
    
    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount || 0,
      message: `Deleted ${result.deletedCount || 0} exercises for user ${userId}`
    });
  } catch (error: any) {
    console.error(`Error deleting scheduled exercises for user:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to delete scheduled exercises" },
      { status: 500 }
    );
  }
}
