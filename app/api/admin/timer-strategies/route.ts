import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import timerStrategiesRepo from '@/lib/repositories/timer-strategies-repo';
import User from '@/lib/models/user';
import { isAdmin } from '@/middleware/isAdmin';

/**
 * GET /api/admin/timer-strategies
 * Get all timer strategies across all users (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
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

    // Get all timer strategies across all users
    const timerStrategies = await timerStrategiesRepo.findAll();
    
    // Fetch user information to add user names to the results
    const userIds = [...new Set(timerStrategies.map(strategy => strategy.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }, 'name');
    
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user._id.toString(), user.name);
    });
    
    // Add userName to each timer strategy
    const strategiesWithUserNames = timerStrategies.map(strategy => {
      const userId = strategy.userId.toString();
      return {
        ...strategy.toObject(),
        userName: userMap.get(userId) || null
      };
    });
    
    return NextResponse.json(strategiesWithUserNames);
  } catch (error) {
    console.error('Error fetching all timer strategies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timer strategies' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/timer-strategies
 * Create a new timer strategy for any user (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
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

    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.color || !data.userId) {
      return NextResponse.json(
        { error: 'Name, color, and userId are required' },
        { status: 400 }
      );
    }
    
    if (typeof data.restDuration !== 'number' || data.restDuration < 5) {
      return NextResponse.json(
        { error: 'Rest duration must be a number of at least 5 seconds' },
        { status: 400 }
      );
    }
    
    if (typeof data.activeDuration !== 'number' || data.activeDuration < 5) {
      return NextResponse.json(
        { error: 'Active duration must be a number of at least 5 seconds' },
        { status: 400 }
      );
    }
    
    // Create the timer strategy for the specified user
    const timerStrategy = await timerStrategiesRepo.create({
      userId: data.userId,
      name: data.name,
      color: data.color,
      restDuration: data.restDuration,
      activeDuration: data.activeDuration,
    });
    
    return NextResponse.json(timerStrategy, { status: 201 });
  } catch (error) {
    console.error('Error creating timer strategy:', error);
    return NextResponse.json(
      { error: 'Failed to create timer strategy' },
      { status: 500 }
    );
  }
}
