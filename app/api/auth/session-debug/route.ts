import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/utils/auth-helpers';

export async function GET(req: NextRequest) {
  try {
    // Get the server session
    const session = await getServerSession();
    
    // Get all request cookies for debugging
    const cookies = req.cookies;
    
    // Get all request headers for debugging
    const headers = Object.fromEntries(req.headers.entries());
    
    return NextResponse.json({
      hasSession: !!session,
      session: session ? {
        ...session,
        user: session.user ? {
          ...session.user,
          // Don't include email in response for privacy
          email: session.user.email ? 'Present' : 'Missing',
        } : null,
      } : null,
      hasSessionCookie: !!cookies.get('next-auth.session-token') || !!cookies.get('__Secure-next-auth.session-token'),
      cookieCount: cookies.size,
      headerCount: Object.keys(headers).length,
      // Include headers that are relevant to auth
      relevantHeaders: {
        cookie: headers.cookie ? 'Present' : 'Missing',
        authorization: headers.authorization ? 'Present' : 'Missing',
      }
    });
  } catch (error) {
    console.error('Error in session debug endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to get session information' },
      { status: 500 }
    );
  }
}
