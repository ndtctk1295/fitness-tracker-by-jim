import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/health
 * Simple health check endpoint that can be used to test the API compatibility layer
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
}
