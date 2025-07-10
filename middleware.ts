import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Check if this is a NextAuth API route (we want to skip middleware for these routes)
  if (path.startsWith('/api/auth')) {
    console.log('[Middleware] Skipping NextAuth route:', path);
    return NextResponse.next();
  }
  
  // Get the token from the request with secure options
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    });
    
    // Enhanced debugging
    console.log(`[Middleware] Path: ${path}, Has Token: ${!!token}, User ID: ${token?.id || 'None'}`);    // Define public paths that don't require authentication
    const publicPaths = [
      '/',
      '/auth/signin',
      '/auth/register',
      '/auth/error',      '/auth/callback',
      '/auth/verify-request',
      '/unauthorized',
      '/api/health',
      '/api/debug',
      '/test',
    ];
    
    // Define admin paths that require admin role
    const adminPaths = ['/admin'];
    
    const isPublicPath = publicPaths.some(publicPath => 
      path === publicPath || path.startsWith(`${publicPath}/`)
    );
    
    const isAdminPath = adminPaths.some(adminPath => 
      path === adminPath || path.startsWith(`${adminPath}/`)
    );
    
    // Protected paths include (protected) folder and specific protected routes
    const isProtectedPath = path.startsWith('/(protected)') || 
      ['/dashboard', '/calendar', '/categories', '/exercises', '/history', '/profile', '/settings', '/timer', '/timer-strategies', '/weights'].some(protectedPath => 
        path === protectedPath || path.startsWith(`${protectedPath}/`)
      );
    
    // 1. Handle public paths - allow access
    if (isPublicPath) {
      console.log(`[Middleware] Allowing access to public path: ${path}`);
      return NextResponse.next();
    }
    
    // 2. Handle admin paths - require admin role
    if (isAdminPath) {
      if (!token || token.role !== 'admin') {
        console.log(`[Middleware] Blocking admin access for path: ${path}, role: ${token?.role || 'none'}`);
        return NextResponse.redirect(new URL('/unauthorized', req.nextUrl));
      }
      console.log(`[Middleware] Allowing admin access to: ${path}`);
      return NextResponse.next();
    }
    
    // 3. Handle API paths - require authentication
    if (path.startsWith('/api/')) {
      if (!token) {
        console.log(`[Middleware] Blocking API access - no token for path: ${path}`);
        return NextResponse.json(
          { success: false, error: 'Unauthorized', message: 'Authentication required' }, 
          { status: 401 }
        );
      }
      console.log(`[Middleware] Allowing API access to: ${path}`);
      return NextResponse.next();
    }
    
    // 4. Handle protected app paths - require authentication
    if (isProtectedPath) {
      if (!token) {
        console.log(`[Middleware] Blocking protected path access - no token for path: ${path}`);
        return NextResponse.redirect(new URL('/auth/signin', req.nextUrl));
      }
      console.log(`[Middleware] Allowing protected path access to: ${path}`);
      return NextResponse.next();
    }
    
    // 5. Default - allow access to any other paths
    console.log(`[Middleware] Allowing default access to: ${path}`);
    return NextResponse.next();
    
  } catch (error) {
    console.error('[Middleware] Error checking token:', error);
    // On error, redirect to signin for protected paths, allow others
    if (path.startsWith('/dashboard') || path.startsWith('/(protected)')) {
      return NextResponse.redirect(new URL('/auth/signin', req.nextUrl));
    }
    return NextResponse.next();
  }
}

// Configure which paths this middleware applies to
export const config = {
  matcher: [
    // Match all routes except static files and images
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
