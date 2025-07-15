import { NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * Route to debug session state
 * Can be called from client components to check session status
 */
export async function GET(request: Request) {
  const session = await auth();
  
  // Return session info without sensitive data
  return NextResponse.json({
    authenticated: !!session,
    user: session ? {
      id: session.user?.id,
      name: session.user?.name,
      email: session.user?.email,
      role: (session.user as any)?.role,
    } : null,
    sessionTimestamp: new Date().toISOString(),
  });
}
