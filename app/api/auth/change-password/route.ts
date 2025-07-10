import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { usersRepo } from '@/lib/repositories';
import { z } from 'zod';

// Schema for request validation
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
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
    const validation = changePasswordSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.errors },
        { status: 400 }
      );
    }
      const { currentPassword, newPassword } = validation.data;
    
    // Change password using repository
    const updatedUser = await usersRepo.changePassword(
      session.user.id,
      currentPassword,
      newPassword
    );
    
    if (!updatedUser) {
      // This covers both cases: user not found or incorrect current password
      return NextResponse.json(
        { success: false, error: 'Failed to change password. Please verify your current password.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
    
  } catch (error: any) {
    console.error('Password change error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update password',
      },
      { status: 500 }
    );
  }
}
