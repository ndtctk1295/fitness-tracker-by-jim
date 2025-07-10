'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layouts/app-layout';
import { useExerciseStore } from '@/lib/stores/exercise-store';
import { useScheduledExerciseStore } from '@/lib/stores/scheduled-exercise-store';
import { useWorkoutPlanStore } from '@/lib/stores/workout-plan-store';
import { CircleAlert, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { redirectTo } from '@/lib/utils/navigation';
import { Button } from '@/components/ui/button';
import { StoreResetHandler } from '@/components/shared/store-reset-handler';

// This layout wraps all protected routes that require authentication
export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  const { data: session, status } = useSession();
  const router = useRouter();
  // Get store state and initialization functions
  const { 
    initializeStore: initExerciseStore, 
    initialized: exerciseInitialized, 
    isLoading: exerciseLoading, 
    error: exerciseError
  } = useExerciseStore();

  const { 
    initializeStore: initScheduledStore, 
    initialized: scheduledInitialized, 
    isLoading: scheduledLoading, 
    error: scheduledError
  } = useScheduledExerciseStore();
  
  // Get workout plan store initialization function
  const {
    initializeStore: initWorkoutPlanStore,
    initialized: workoutPlanInitialized,
    isLoading: workoutPlanLoading,
    error: workoutPlanError
  } = useWorkoutPlanStore();

  // Handle authentication check
  useEffect(() => {
    if (status === 'loading') return; // Still checking authentication
    
    if (status === 'unauthenticated' || !session) {
      console.log('[ProtectedLayout] User not authenticated, redirecting to sign-in');
      redirectTo(router, '/auth/signin');
      return;
    }
    
    console.log('[ProtectedLayout] User authenticated:', session.user?.email);
  }, [status, session, router]);

  // Initialize both stores once when the layout mounts and user is authenticated
  useEffect(() => {
    if (status !== 'authenticated' || !session) return;
    
    if (!exerciseInitialized && !exerciseLoading) {
      console.debug('[ProtectedLayout] Initializing exercise store');
      initExerciseStore().catch((error: unknown) => {
        console.error('[ProtectedLayout] Error initializing exercise store:', error);
      });
    }
  }, [exerciseInitialized, exerciseLoading, initExerciseStore, status, session]);

  useEffect(() => {
    if (status !== 'authenticated' || !session) return;
    
    if (!scheduledInitialized && !scheduledLoading) {
      console.debug('[ProtectedLayout] Initializing scheduled exercise store');
      initScheduledStore().catch((error: unknown) => {
        console.error('[ProtectedLayout] Error initializing scheduled exercise store:', error);
      });
    }
  }, [scheduledInitialized, scheduledLoading, initScheduledStore, status, session]);

  useEffect(() => {
    if (status !== 'authenticated' || !session) return;
    
    if (!workoutPlanInitialized && !workoutPlanLoading) {
      console.debug('[ProtectedLayout] Initializing workout plan store');
      initWorkoutPlanStore().catch((error: unknown) => {
        console.error('[ProtectedLayout] Error initializing workout plan store:', error);
      });
    }
  }, [workoutPlanInitialized, workoutPlanLoading, initWorkoutPlanStore, status, session]);
  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center bg-card p-4 rounded-lg shadow h-60 w-80">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <div className="text-muted-foreground">Checking authentication...</div>
          {/* Add error testing buttons during loading for development */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 space-x-2">
              <Button 
                onClick={() => setTestError("Test authentication error")}
                variant="destructive"
                size="sm"
              >
                Test Auth Error
              </Button>
              <Button 
                onClick={() => setTestError("Test session expired error")}
                variant="destructive"
                size="sm"
              >
                Test Session Error
              </Button>
              <Button 
                onClick={() => setTestError("Test database connection error")}
                variant="destructive"
                size="sm"
              >
                Test DB Error
              </Button>
            </div>
          )} */}
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (status === 'unauthenticated' || !session) {
    return null;
  }

  // Show error screen if there's a test error
  // if (testError) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center p-8 flex flex-col items-center">
  //           <CircleAlert accentHeight={48} height={96} width={96} className='text-red-600 mb-2'/>
  //         <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong
  //         </h1>
  //         <p className="text-gray-600 mb-4">{testError}</p>
  //         <Button 
  //           onClick={() => {
        
  //             router.push('/dashboard');
  //           }}
  //           variant="outline"
  //         >
  //           Go to Dashboard
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // }
  const isLoading = exerciseLoading || scheduledLoading;
  const isInitialized = exerciseInitialized && scheduledInitialized;
  const dataLoadingError = exerciseError || scheduledError;
  // console.log('error', exerciseError);
  
  return (

      <AppLayout>
        {isLoading && !isInitialized && (
          <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
            <div className="flex flex-col items-center justify-center bg-card p-4 rounded-lg shadow h-60 w-80">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <div className="text-muted-foreground">Loading...</div>
            </div>
          </div>
        )}
        {dataLoadingError && (
          <div className="p-4 mx-auto max-w-7xl mt-4 bg-destructive/10 border border-destructive rounded-md">
            <div className="text-destructive font-semibold">Error loading data</div>
            <div className="text-destructive/80 text-sm">{dataLoadingError}</div>
          </div>
        )}
        {children}
        {/* Store Reset Handler - manages store state across user sessions */}
        <StoreResetHandler />
        {/* Error tester component for development */}
      </AppLayout>

  );
}
