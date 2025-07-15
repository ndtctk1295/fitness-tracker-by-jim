// This file provides compatibility functions for API routes during the migration to Auth.js v5
import { NextRequest } from 'next/server';
import { auth } from '@/auth';

// Helper function to get session in API routes
export async function getAuthSession(req: NextRequest | Request) {
  return auth();
}

// Legacy compatibility function for existing API routes
export async function isAuthenticated(req: NextRequest | Request) {
  const session = await auth();
  return !!session;
}

// Legacy compatibility function for admin-only routes
export async function isAdmin(req: NextRequest | Request) {
  const session = await auth();
  return !!session && session.user.role === 'admin';
}

// Export a replacement for getServerSession to be used in API routes
export async function getServerSession() {
  return auth();
}
