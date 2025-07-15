// This file helps with migrating API routes to Auth.js v5
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

// Helper function to use in API routes
export async function withAuth(handler: (req: NextRequest, auth: any) => Promise<NextResponse>) {
  return async function(req: NextRequest) {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // Call the original handler with the session
    return handler(req, session);
  }
}

// Helper function for admin-only routes
export async function withAdminAuth(handler: (req: NextRequest, auth: any) => Promise<NextResponse>) {
  return async function(req: NextRequest) {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden', message: 'Admin access required' }, 
        { status: 403 }
      );
    }
    
    // Call the original handler with the session
    return handler(req, session);
  }
}
