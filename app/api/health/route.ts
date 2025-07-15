import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/health
 * Simple health check endpoint that can be used to test the API compatibility layer
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    apiType: 'App Router',
  });
}
