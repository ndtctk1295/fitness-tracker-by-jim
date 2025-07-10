import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface AuthOptions {
  requireAdmin?: boolean;
  allowInternal?: boolean;
}

/**
 * Helper function to verify authentication for API routes
 * 
 * @param req NextRequest object
 * @param options Authentication options
 * @returns Object containing authentication result and session if successful
 */
export async function verifyApiAuth(
  req: NextRequest,
  options: AuthOptions = { requireAdmin: false, allowInternal: true }
) {
  const { requireAdmin = false, allowInternal = true } = options;
  
  try {
    // Check for internal request header when allowed
    const isInternalRequest = 
      allowInternal && req.headers.get('x-client-auth') === 'internal-request';
    
    // Skip server-side session check for internal requests from our own client
    if (isInternalRequest) {
      console.log(`API Auth - Internal request to ${req.nextUrl.pathname}, skipping auth check`);
      return { 
        authenticated: true, 
        isAdmin: false, // We can't verify admin status without session check
        isInternal: true,
        session: null 
      };
    }
    
    // Get session for normal API requests
    const session = await getServerSession(authOptions);
    
    // Check for basic authentication
    if (!session || !session.user) {
      console.log(`API Auth - Unauthorized access to ${req.nextUrl.pathname} (no session)`);
      return { 
        authenticated: false, 
        isAdmin: false,
        isInternal: false,
        session: null,
        response: NextResponse.json(
          { error: 'Unauthorized: You must be logged in' }, 
          { status: 401 }
        )
      };
    }
    
    // Check for admin role when required
    const isAdmin = session.user.role === 'admin';
    if (requireAdmin && !isAdmin) {
      console.log(`API Auth - Admin access required for ${req.nextUrl.pathname}`);
      return {
        authenticated: true,
        isAdmin: false,
        isInternal: false,
        session,
        response: NextResponse.json(
          { error: 'Forbidden: Admin access required' }, 
          { status: 403 }
        )
      };
    }
    
    // Authentication successful
    return {
      authenticated: true,
      isAdmin,
      isInternal: false,
      session
    };
    
  } catch (error) {
    console.error(`API Auth Error - ${req.nextUrl.pathname}:`, error);
    return {
      authenticated: false,
      isAdmin: false,
      isInternal: false,
      session: null,
      response: NextResponse.json(
        { error: 'Authentication error' }, 
        { status: 500 }
      )
    };
  }
}
