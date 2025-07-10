import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/utils/api-auth';
import usersRepo from '@/lib/repositories/users-repo';
import mongoose from 'mongoose';

/**
 * GET /api/users/[id]
 * Get a user by ID (admin only)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication with admin privileges required
    const { authenticated, response } = await verifyApiAuth(req, { requireAdmin: true });
    
    // Return error response if not authenticated or not an admin
    if (!authenticated) {
      return response;
    }
    
    // Await params to get the id properly
    const { id } = await params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    const user = await usersRepo.findById(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Format user to remove sensitive data
    const formattedUser = usersRepo.formatUserResponse(user);
    
    return NextResponse.json(formattedUser);  } catch (error) {
    const { id } = await params;
    console.error(`Error getting user ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 * Update a user (admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication with admin privileges required
    const { authenticated, response } = await verifyApiAuth(req, { requireAdmin: true });
    
    // Return error response if not authenticated or not an admin
    if (!authenticated) {
      return response;
    }
    
    // Await params to get the id properly
    const { id } = await params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    // Get data from request
    const data = await req.json();
    
    // Check if user exists
    const existingUser = await usersRepo.findById(id);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // If email is being changed, check if it's already in use
    if (data.email && data.email !== existingUser.email) {
      const userWithEmail = await usersRepo.findByEmail(data.email);
      if (userWithEmail) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }
    
    // Update the user
    const updatedUser = await usersRepo.update(id, {
      name: data.name,
      email: data.email,
      role: data.role,
      image: data.image,
      // Only update password if provided
      ...(data.password ? { password: data.password } : {})
    });
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }
    
    // Format user to remove sensitive data
    const formattedUser = usersRepo.formatUserResponse(updatedUser);
    
    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Delete a user (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication with admin privileges required
    const { authenticated, response } = await verifyApiAuth(req, { requireAdmin: true });
    
    // Return error response if not authenticated or not an admin
    if (!authenticated) {
      return response;
    }
    
    // Await params to get the id properly
    const { id } = await params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    // Delete the user
    const success = await usersRepo.delete(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'User not found or could not be deleted' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(`Error deleting user ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
