'use client';

import { useSession, useIsAdmin, useUser } from '@/lib/hooks/auth/use-session';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { redirectTo, navigateTo } from '@/lib/utils/navigation';

export interface UseAuthOptions {
  required?: boolean;
  adminRequired?: boolean;
  redirectPath?: string;  // Changed from redirectTo to avoid naming conflict
  excludePaths?: string[];
}

export function useAuth(options: UseAuthOptions = {}) {
  const {
    required = false,
    adminRequired = false,
    redirectPath = '/auth/signin',  // Changed from redirectTo to avoid naming conflict
    excludePaths = ['/auth/signin', '/auth/register'],
  } = options;

  const { data: session, status } = useSession();
  const { isAdmin } = useIsAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  const isExcludedPath = pathname ? excludePaths.includes(pathname) : false;
  const isAuthenticated = status === 'authenticated' && !!session;

  useEffect(() => {
    // Skip auth check if we're on an excluded path
    if (isExcludedPath) {
      setIsLoading(false);
      return;
    }

    // Wait until auth is determined
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }    
    
    // For admin-required routes
    if (adminRequired && !isAdmin) {
      navigateTo(router, '/unauthorized');
      return;
    }

    // For auth-required routes
    if (required && !isAuthenticated) {
      redirectTo(router, redirectPath, { callbackUrl: pathname || undefined });
      return;
    }

    // For auth pages, redirect to home if already logged in
    if (isExcludedPath && isAuthenticated) {
      redirectTo(router, '/');
      return;
    }

    setIsLoading(false);
  }, [
    status,
    isAuthenticated,
    isAdmin,
    required,
    adminRequired,
    router,
    pathname,
    redirectPath,  // Updated from redirectTo to redirectPath
    isExcludedPath,
  ]);

  return {
    session,
    status,
    isLoading,
    isAuthenticated,
    isAdmin,
  };
}

export default useAuth;
