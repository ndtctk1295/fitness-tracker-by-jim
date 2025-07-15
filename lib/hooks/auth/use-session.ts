'use client';

/**
 * Custom hooks for authentication
 * Provides useSession, useUser and useIsAdmin hooks
 */

import { useSession as useNextAuthSession } from 'next-auth/react';
import type { Session } from 'next-auth';

/**
 * Re-export the useSession hook with the same API
 */
export const useSession = useNextAuthSession;

/**
 * Custom React hook for checking admin status
 * @returns Object with isAdmin boolean and status string
 */
export function useIsAdmin() {
  const { data: session, status } = useNextAuthSession();
  const isAdmin = session?.user?.role === 'admin';
  
  return { isAdmin, status };
}

/**
 * Custom React hook for user data
 * @returns Object with user data and status
 */
export function useUser() {
  const { data: session, status } = useNextAuthSession();
  const user = session?.user || null;
  
  return { user, status };
}

// Export Session type for convenience
export type { Session };
