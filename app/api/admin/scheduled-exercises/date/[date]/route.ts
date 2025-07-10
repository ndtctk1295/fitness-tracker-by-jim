import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ScheduledExercise from '@/lib/models/scheduled-exercise';
import User from '@/lib/models/user';
import { isAdmin } from '@/middleware/isAdmin';
import connectToMongoDB from '@/lib/mongodb';

/**
 * GET /api/admin/scheduled-exercises/date/[date]
 * Get all scheduled exercises for a specific date across users (admin only)
 * @param date - The date to query for (format: yyyy-MM-dd)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
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

    const { date } = params;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Valid date in yyyy-MM-dd format is required" },
        { status: 400 }
      );
    }

    await connectToMongoDB();
    
    // Fetch exercises for the specified date
    const exercises = await ScheduledExercise.find({ date }).sort({ createdAt: -1 });
    
    // Get unique user IDs
    const uniqueUserIds = [...new Set(exercises.map(exercise => exercise.userId.toString()))];
    
    // Fetch users in a single query
    const users = await User.find({ _id: { $in: uniqueUserIds } });
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user.name || user.email || 'Unknown User';
      return acc;
    }, {} as Record<string, string>);
    
    // Add userName to each exercise
    const exercisesWithUserData = exercises.map(exercise => {
      const plainExercise = exercise.toObject();
      return {
        ...plainExercise,
        userName: userMap[plainExercise.userId.toString()] || 'Unknown User'
      };
    });
    
    return NextResponse.json(exercisesWithUserData);
  } catch (error: any) {
    console.error(`Error fetching scheduled exercises for date:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch scheduled exercises" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/scheduled-exercises/date/[date]
 * Delete all scheduled exercises for a specific date (admin only)
 * @param date - The date to delete for (format: yyyy-MM-dd)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { date: string } }
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

    const { date } = params;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Valid date in yyyy-MM-dd format is required" },
        { status: 400 }
      );
    }

    await connectToMongoDB();
    
    // Delete all exercises for the specified date
    const result = await ScheduledExercise.deleteMany({ date });
    
    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount || 0,
      message: `Deleted ${result.deletedCount || 0} exercises for date ${date}`
    });
  } catch (error: any) {
    console.error(`Error deleting scheduled exercises for date:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to delete scheduled exercises" },
      { status: 500 }
    );
  }
}
