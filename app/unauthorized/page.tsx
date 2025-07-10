'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Shield, Home } from 'lucide-react';
import { navigateTo } from '@/lib/utils/navigation';
import { useSession } from 'next-auth/react';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-4">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <Shield className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
        <p className="text-lg text-muted-foreground">
          {session ? 
            'You don\'t have permission to access this page. Please contact an administrator if you believe this is a mistake.' :
            'Please sign in to access this page.'}
        </p>        <div className="flex gap-4 mt-4">
          <Button variant="default" onClick={() => navigateTo(router, '/dashboard')} className="gap-2">
            <Home className="h-4 w-4" />
            Go to Home
          </Button>
          {!session && (
            <Button variant="outline" onClick={() => navigateTo(router, '/auth/signin')} className="gap-2">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
