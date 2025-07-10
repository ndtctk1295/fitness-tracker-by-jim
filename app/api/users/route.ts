import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { verifyApiAuth } from '@/lib/utils/api-auth';
import usersRepo from '@/lib/repositories/users-repo';

/**
 * GET /api/users
 * Get all users (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication with admin privileges required
    const { authenticated, response } = await verifyApiAuth(req, { requireAdmin: true });
    
    // Return error response if not authenticated or not an admin
    if (!authenticated) {
      return response;
    }
    
    const users = await usersRepo.findAll();
    
    // Format users to remove sensitive data
    const formattedUsers = users.map(user => usersRepo.formatUserResponse(user));
    
    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create a new user (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication with admin privileges required
    const { authenticated, response } = await verifyApiAuth(req, { requireAdmin: true });
    
    // Return error response if not authenticated or not an admin
    if (!authenticated) {
      return response;
    }
    
    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Check if email is already in use
    const existingUser = await usersRepo.findByEmail(data.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }
    
    const user = await usersRepo.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'user',
      image: data.image
    });
    
    // Format user to remove sensitive data
    const formattedUser = usersRepo.formatUserResponse(user);
    
    return NextResponse.json(formattedUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' }, 
      { status: 500 }
    );
  }
}
