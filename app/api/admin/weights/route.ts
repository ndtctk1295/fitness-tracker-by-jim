import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import weightsRepo from '@/lib/repositories/weights-repo';
import User from '@/lib/models/user';
import { isAdmin } from '@/middleware/isAdmin';

/**
 * GET /api/admin/weights
 * Get all weight plates across all users (admin only)
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

    // Get all weight plates across all users
    const weights = await weightsRepo.findAll();
    
    // Fetch user information to add user names to the results
    const userIds = [...new Set(weights.map(weight => weight.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }, 'name');
    
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user._id.toString(), user.name);
    });
    
    // Add userName to each weight plate
    const weightsWithUserNames = weights.map(weight => {
      const userId = weight.userId.toString();
      return {
        ...weight.toObject(),
        userName: userMap.get(userId) || null
      };
    });
    
    return NextResponse.json(weightsWithUserNames);
  } catch (error) {
    console.error('Error fetching all weights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weights' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/weights
 * Create a new weight plate for any user (admin only)
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
    if (typeof data.value !== 'number' || !data.color || !data.userId) {
      return NextResponse.json(
        { error: 'Weight value, color, and userId are required' },
        { status: 400 }
      );
    }
    
    // Create the weight plate for the specified user
    const weightPlate = await weightsRepo.create({
      userId: data.userId,
      value: data.value,
      color: data.color,
    });
    
    return NextResponse.json(weightPlate, { status: 201 });
  } catch (error) {
    console.error('Error creating weight plate:', error);
    return NextResponse.json(
      { error: 'Failed to create weight plate' },
      { status: 500 }
    );
  }
}
