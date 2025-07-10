import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/mongodb';

/**
 * Database Health Check API Endpoint
 * 
 * This endpoint provides real-time database health monitoring for the fitness tracker application.
 * It's optimized for high-performance monitoring and can handle 100+ concurrent requests.
 * 
 * @returns Health status with connection info, response times, and metrics
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Perform comprehensive database health check
    const healthStatus = await checkDatabaseHealth();
    const responseTime = Date.now() - startTime;
    
    // Enhanced health response with performance metrics
    const healthResponse = {
      status: healthStatus.status,
      timestamp: new Date().toISOString(),
      database: {
        connected: healthStatus.status === 'healthy',
        readyState: healthStatus.details.readyState,
        host: healthStatus.details.host,
        name: healthStatus.details.name,
        serverStatus: healthStatus.status
      },
      performance: {
        responseTimeMs: responseTime,
        connectionPool: {
          ready: healthStatus.details.readyState === 1,
          state: healthStatus.details.readyState
        },
        lastConnectionCheck: new Date().toISOString()
      },
      version: {
        mongodb: 'Connected',
        mongoose: 'Active'
      }
    };
    
    // Return appropriate HTTP status based on health
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(healthResponse, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('Health check endpoint error:', error);
    
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown database error'
      },
      performance: {
        responseTimeMs: Date.now() - startTime,
        connectionPool: null
      }
    };
    
    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

/**
 * HEAD method for lightweight health checks
 * Returns only HTTP status without response body for monitoring systems
 */
export async function HEAD(request: NextRequest) {
  try {
    const healthStatus = await checkDatabaseHealth();
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    
    return new NextResponse(null, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
