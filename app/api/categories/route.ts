import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';
import { authOptions } from '../auth/[...nextauth]/route';
import { verifyApiAuth } from '@/lib/utils/api-auth';
import { categoriesRepo, usersRepo } from '@/lib/repositories';

// GET endpoint - accessible to all authenticated users
export async function GET(req: NextRequest) {
  try {
    console.log('Categories API - Request received');
    
    // Log request headers for debugging
    const clientAuth = req.headers.get('x-client-auth');
    const requestOrigin = req.headers.get('x-request-origin');
    console.log(`Request headers - x-client-auth: ${clientAuth}, origin: ${requestOrigin}`);
    
    // Check direct session first (bypass verifyApiAuth for debugging)
    const session = await getServerSession();
    console.log(`Categories API - Direct session check: ${!!session}`);
    
    // Special case: If this is a client request with proper headers, trust it
    if (clientAuth === 'internal-request') {
      console.log('Categories API - Internal request detected, bypassing strict auth');
      const categories = await categoriesRepo.findAll();
      console.log(`Categories API - Found ${categories.length} categories`);
      return NextResponse.json(categories);
    }
    
    // Normal authentication flow
    if (!session || !session.user) {
      console.log('Categories API - No session found');
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in' }, 
        { status: 401 }
      );
    }
    
    const categories = await categoriesRepo.findAll();
    console.log(`Categories API - Found ${categories.length} categories`);
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

// POST endpoint - accessible only to admins
export async function POST(req: NextRequest) {
  try {
    // Verify authentication with admin privileges required
    const { authenticated, response, session } = await verifyApiAuth(req, { requireAdmin: true });
    console.log(`Categories API - Authenticated: ${authenticated}`);
    console.log(`Categories API - Session: ${JSON.stringify(session)}`);
    console.log(`Categories API - Response: ${JSON.stringify(response)}`);
    // Return error response if not authenticated or not an admin
    if (!authenticated) {
      return response;
    }
    
    // Get user for database operations
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Invalid user session' }, 
        { status: 401 }
      );
    }
    
    const user = await usersRepo.findByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }
    
    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.color) {
      return NextResponse.json(
        { error: 'Name and color are required fields' },
        { status: 400 }
      );
    }
    
    const categoryData = {
      ...data,
      createdBy: user._id,
      updatedBy: user._id
    };
    
    const category = await categoriesRepo.create(categoryData);
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' }, 
      { status: 500 }
    );
  }
}
