import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { usersRepo } from '@/lib/repositories';
import { z } from 'zod';

// Schema for request validation
const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export async function PUT(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validation = profileUpdateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.errors },
        { status: 400 }
      );
    }
      const { name } = validation.data;
    
    // Update user profile using repository
    const updatedUser = await usersRepo.update(session.user.id, { name });
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 404 }
      );
    }
      return NextResponse.json({
      success: true,
      data: usersRepo.formatUserResponse(updatedUser),
    });
    
  } catch (error: any) {
    console.error('Profile update error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update profile',
      },
      { status: 500 }
    );
  }
}
