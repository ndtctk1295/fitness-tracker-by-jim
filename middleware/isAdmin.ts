import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
// Auth options are now directly used via getServerSession from auth-helpers;
import connectToMongoDB from '@/lib/mongodb';
import User from '@/lib/models/user';

/**
 * Function to check if a user has admin privileges.
 * Can be called either:
 * 1. With a userId directly (string)
 * 2. With a NextRequest object (for middleware use)
 * 
 * @param userIdOrReq - User ID or NextRequest object
 * @returns boolean value indicating if user is admin, or NextResponse for middleware use
 */
export async function isAdmin(userIdOrReq: string | NextRequest): Promise<boolean | NextResponse> {
  try {
    // Handle direct user ID check
    if (typeof userIdOrReq === 'string') {
      await connectToMongoDB();
      const userId = userIdOrReq;
      
      const user = await User.findById(userId);
      
      // Just return a boolean for direct user ID checks
      return Boolean(user && user.role === 'admin');
    }
    
    // Handle middleware request
    const req = userIdOrReq as NextRequest;
    const session = await getServerSession();
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in' }, 
        { status: 401 }
      );
    }
    
    await connectToMongoDB();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' }, 
        { status: 403 }
      );
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Error in admin middleware:', error);
    if (typeof userIdOrReq === 'string') {
      // For direct user ID checks, return false on error
      return false;
    }
    
    // For middleware, return error response
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

export default isAdmin;
