'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { status } = useSession();

  return (
    <div className="flex min-h-screen items-center justify-center mx-auto w-full p-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">Welcome to Fitness Tracker</h1>
        <p className="text-muted-foreground mb-6">
          Track your fitness journey with customizable workouts, exercises, and timers.
        </p>
        
        {status === 'loading' && (
          <p className="text-muted-foreground">Loading...</p>
        )}
        
        {status === 'authenticated' && (
          <div className="space-y-3">
            <p className="text-muted-foreground mb-4">Ready to continue your fitness journey?</p>
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        )}
        
        {status === 'unauthenticated' && (
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/auth/register">Register</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
