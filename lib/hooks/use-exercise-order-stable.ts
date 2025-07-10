'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSensors, useSensor, KeyboardSensor, PointerSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { matchesDate } from '@/lib/utils/date-utils';

/**
 * Custom hook for managing exercise ordering and drag-and-drop functionality
 * Optimized with memoization to prevent unnecessary rerenders
 * 
 * @deprecated This hook is no longer used. Use useExerciseOrderStore from @/lib/stores/exercise-order-store instead.
 */
export function useExerciseOrderStable({
  scheduledExercises,
  selectedDate,
  activeTimer,
}: {
  scheduledExercises: any[];
  selectedDate: string;
  activeTimer: any;
}) {
  // Track ordered exercise IDs
  const [orderedExerciseIds, setOrderedExerciseIds] = useState<string[]>([]);

  // Filter exercises for today with memoization
  const todaysExercises = useMemo(() => {
    return scheduledExercises.filter((ex) => {
      if (!ex.date) return false;
      try {
        // Extract the yyyy-MM-dd part from ISO date string to match with selectedDate format
        return matchesDate(ex.date, activeTimer.scheduledDate ?? selectedDate);
      } catch (error) {
        console.error('Error processing exercise date:', error);
        return false;
      }
    });
  }, [scheduledExercises, selectedDate, activeTimer.scheduledDate]);
  
  // Function to get exercises in the user's ordered preference - memoized to prevent recreation
  const getOrderedExercises = useCallback(() => {
    if (todaysExercises.length === 0) {
      return [];
    }
    
    if (orderedExerciseIds.length === 0) {
      return todaysExercises;
    }
    
    // Get exercises in the ordered list
    const orderedExercises = orderedExerciseIds
      .map(id => todaysExercises.find(ex => ex.id === id))
      .filter(Boolean) as typeof todaysExercises;
    
    // Find any exercises not in the ordered list
    const remainingExercises = todaysExercises.filter(
      ex => !orderedExerciseIds.includes(ex.id)
    );
    
    // Return ordered exercises followed by any that might not be in the ordered list
    return [...orderedExercises, ...remainingExercises];
  }, [todaysExercises, orderedExerciseIds]);

  // Setup sensors for drag and drop - memoized to prevent recreation on every render
  const sensors = useMemo(() => {
    return useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );
  }, []); // Empty dependency array since these don't depend on props
  
  // Keep ordered exercise IDs in sync with today's exercises
  useEffect(() => {
    if (todaysExercises.length > 0) {
      setOrderedExerciseIds(prevIds => {
        // Get the IDs of all today's exercises
        const todayIds = todaysExercises.map(ex => ex.id);
        
        // Keep the existing ordered IDs that are still in today's exercises
        const existingValidIds = prevIds.filter(id => todayIds.includes(id));
        
        // Find new exercise IDs that aren't yet in the ordered list
        const newIds = todayIds.filter(id => !prevIds.includes(id));
        
        // Combine existing (in the same order) with new IDs
        return [...existingValidIds, ...newIds];
      });
    } else {
      // No exercises for today, clear the ordered list
      setOrderedExerciseIds([]);
    }
  }, [todaysExercises]);

  // Handle drag end event - memoized to prevent recreation
  const handleDragEnd = useCallback((event: any) => {
    // Don't allow reordering if timer is active
    if (activeTimer.currentStrategyId) return;

    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedExerciseIds((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, [activeTimer.currentStrategyId]);
  
  // Ensure ordered exercises are initialized before starting timer
  const ensureOrderedExercises = useCallback(() => {
    if (todaysExercises.length > 0 && orderedExerciseIds.length === 0) {
      setOrderedExerciseIds(todaysExercises.map(ex => ex.id));
    }
    return true;
  }, [todaysExercises, orderedExerciseIds]);

  return {
    orderedExerciseIds,
    setOrderedExerciseIds,
    todaysExercises,
    getOrderedExercises,
    sensors,
    handleDragEnd,
    ensureOrderedExercises
  };
}
