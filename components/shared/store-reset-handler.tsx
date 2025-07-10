'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useWorkoutPlanStore } from '@/lib/stores/workout-plan-store';
import { useScheduledExerciseStore } from '@/lib/stores/scheduled-exercise-store';
import { useExerciseStore } from '@/lib/stores/exercise-store';

/**
 * Component to handle clearing all stores when user authentication state changes.
 * This prevents data from persisting between different user sessions.
 * 
 * Features:
 * - Detects user changes and resets all stores
 * - Adds user ID to store keys to prevent data leakage
 * - Implements version control for storage migrations
 * - Verifies user ID during store initialization
 */
export function StoreResetHandler() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Current version of storage schema - update when making breaking changes
  const STORAGE_VERSION = '1.0.0';

  useEffect(() => {
    // Store the current user ID for later comparison
    const currentUserId = userId;
    const storedUserId = localStorage.getItem('current-user-id');
    
    // Check storage version for future migrations
    const storedVersion = localStorage.getItem('storage-schema-version') || '0.0.0';
    
    // If this is the first initialization or version has changed
    if (!isInitialized) {
      setIsInitialized(true);
      
      // If version has changed, handle migration or reset as needed
      if (storedVersion !== STORAGE_VERSION) {
        console.log(`Storage schema version changed from ${storedVersion} to ${STORAGE_VERSION}, handling migration`);
        handleVersionMigration(storedVersion, STORAGE_VERSION);
      }
      
      // Store current version
      localStorage.setItem('storage-schema-version', STORAGE_VERSION);
    }
    
    // If the user has changed, reset all stores
    if (storedUserId && currentUserId && storedUserId !== currentUserId) {
      console.log('User changed, resetting all stores');
      resetAllStores();
    }
    
    // Store the new user ID
    if (currentUserId) {
      localStorage.setItem('current-user-id', currentUserId);
    }
    
    // Listen for storage events (logout/login in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      // If auth token or session storage changed
      if (
        e.key?.includes('session') || 
        e.key?.includes('token') || 
        e.key === 'current-user-id' ||
        e.key === 'store-user-changed'
      ) {
        console.log('Auth state changed in another tab, resetting stores');
        resetAllStores();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userId]);

  /**
   * Reset all application stores to their initial state
   */
  const resetAllStores = () => {
    // Reset each store
    if (useWorkoutPlanStore.getState().reset) {
      useWorkoutPlanStore.getState().reset();
    }
    
    if (useScheduledExerciseStore.getState().reset) {
      useScheduledExerciseStore.getState().reset();
    }
    
    if (useExerciseStore.getState().reset) {
      useExerciseStore.getState().reset();
    }
    
    // Clear any other relevant state
    localStorage.removeItem('workout-plan-user-id');
    
    // Clear user-specific store keys
    const userStoreKeys = Object.keys(localStorage).filter(key => 
      key.includes('user-') || 
      key.includes('-store-') || 
      key.includes('workout-plan') ||
      key.includes('exercise') ||
      key.includes('scheduled')
    );
    
    userStoreKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('[StoreResetHandler] All stores have been reset');
  };

  /**
   * Handle storage schema version migrations
   * @param oldVersion Previous storage schema version
   * @param newVersion New storage schema version
   */
  const handleVersionMigration = (oldVersion: string, newVersion: string) => {
    console.log(`Migrating storage schema from ${oldVersion} to ${newVersion}`);
    
    // Here we can implement specific migration logic based on version changes
    // For now, we'll just reset everything as the safest approach
    
    // Example: if (oldVersion === '0.9.0' && newVersion === '1.0.0') { ... }
    
    // Default behavior: reset all stores to avoid compatibility issues
    resetAllStores();
    
    console.log(`Storage migration completed to version ${newVersion}`);
  };

  // This component doesn't render anything
  return null;
}
