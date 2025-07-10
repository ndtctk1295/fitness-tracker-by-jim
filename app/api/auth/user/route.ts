import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { usersRepo } from '@/lib/repositories';

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }    
    // Get user data from repository
    const user = await usersRepo.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }    // Return user data (without password)
    return NextResponse.json({
      success: true,
      data: usersRepo.formatUserResponse(user),
    });
    
  } catch (error: any) {
    console.error('Get user error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get user data',
      },
      { status: 500 }
    );
  }
}
