'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';
import { matchesDate } from '@/lib/utils/date-utils';
import { ExerciseOrderState } from '@/lib/types';

// Create the store with persistence
export const useExerciseOrderStore = create<ExerciseOrderState>()(
  persist(
    (set, get) => ({
      // Initial state
      orderedExerciseIds: [],
        // Action to set ordered exercise IDs directly
      setOrderedExerciseIds: (ids) => set({ orderedExerciseIds: ids }),
  
      // Handle drag-and-drop reordering
      updateOrderOnDrag: (activeId, overId) => 
        set((state) => {
          const oldIndex = state.orderedExerciseIds.indexOf(activeId);
          const newIndex = state.orderedExerciseIds.indexOf(overId);
          
          if (oldIndex === -1 || newIndex === -1) return state;
          
          return {
            orderedExerciseIds: arrayMove(state.orderedExerciseIds, oldIndex, newIndex)
          };
        }),
  
      // Sync ordered IDs with scheduled exercises based on selected date
      syncOrderedIdsWithScheduledExercises: (scheduledExercises, selectedDate, activeTimerScheduledDate) => {
    // Filter exercises for selected date
    const dateToUse = activeTimerScheduledDate ?? selectedDate;
    
    // Log to help debug date issues
    console.log('Syncing ordered IDs for date:', dateToUse);

    // Filter exercises that match today's date
    const todaysExercises = scheduledExercises.filter((ex) => {
      if (!ex.date) {
        console.log(`Exercise ${ex.id} has no date`);
        return false;
      }
      
      try {
        const isToday = matchesDate(ex.date, dateToUse);
        console.log(`Exercise ${ex.id} date:`, ex.date, 'matches today:', isToday);
        return isToday;
      } catch (error) {
        console.error('Error processing exercise date:', error);
        return false;
      }
    });
    
    console.log(`Found ${todaysExercises.length} exercises for today:`, todaysExercises.map(ex => ex.id));
    
    if (todaysExercises.length > 0) {
      set((state) => {
        // Get the IDs of all today's exercises
        const todayIds = todaysExercises.map(ex => ex.id);
        console.log('Today IDs:', todayIds);
        console.log('Current ordered IDs:', state.orderedExerciseIds);
        
        // Keep the existing ordered IDs that are still in today's exercises
        const existingValidIds = state.orderedExerciseIds.filter(id => 
          todayIds.includes(id)
        );
        
        // Find new exercise IDs that aren't yet in the ordered list
        const newIds = todayIds.filter(id => 
          !state.orderedExerciseIds.includes(id)
        );
        
        // Combine existing (in the same order) with new IDs
        const updatedOrderedIds = [...existingValidIds, ...newIds];
        
        console.log('Updated ordered IDs:', updatedOrderedIds);
        
        // Only update if the IDs actually changed
        if (JSON.stringify(state.orderedExerciseIds) !== JSON.stringify(updatedOrderedIds)) {
          return { orderedExerciseIds: updatedOrderedIds };
        }
        
        return state;
      });
    } else {
      // No exercises for today, clear the ordered list
      set((state) => {
        if (state.orderedExerciseIds.length > 0) {
          console.log('No exercises for today, clearing ordered IDs');
          return { orderedExerciseIds: [] };
        }
        return state;
      });
    }
  },
    // Ensure ordered exercises are initialized - with a forceful approach
  ensureOrderedExercises: (scheduledExercises, selectedDate, activeTimerScheduledDate) => {
    const dateToUse = activeTimerScheduledDate ?? selectedDate;
    
    console.log("Ensure ordered exercises for date:", dateToUse);
    
    const todaysExercises = scheduledExercises.filter((ex) => {
      if (!ex.date) return false;
      try {
        const matches = matchesDate(ex.date, dateToUse);
        // Debug logging
        if (matches) {
          console.log(`Exercise ${ex.id} matches date ${dateToUse} with date ${ex.date}`);
        }
        return matches;
      } catch (error) {
        console.error('Error processing exercise date:', error);
        return false;
      }
    });
    
    console.log(`Found ${todaysExercises.length} exercises for ${dateToUse} in ensureOrderedExercises`);
    
    if (todaysExercises.length > 0) {
      set((state) => {
        // Get the exercise IDs for today
        const todayIds = todaysExercises.map(ex => ex.id);
        
        // Check if current ordered IDs are valid
        const validOrdering = state.orderedExerciseIds.length > 0 && 
                            todayIds.some(id => state.orderedExerciseIds.includes(id));
        
        // If no valid ordering or force is true, replace with today's exercises
        if (!validOrdering) {
          console.log('Setting fresh ordered exercise IDs:', todayIds);
          return { orderedExerciseIds: todayIds };
        }
        return state;      });
    }
  },
  
  // Function to get ordered exercises without directly modifying the state
  getOrderedExercises: (scheduledExercises, selectedDate, activeTimerScheduledDate) => {
    const { orderedExerciseIds } = get();
    const dateToUse = activeTimerScheduledDate ?? selectedDate;
    
    // Filter exercises for today
    const todaysExercises = scheduledExercises.filter((ex) => {
      if (!ex.date) return false;
      try {
        return matchesDate(ex.date, dateToUse);
      } catch (error) {
        console.error('Error processing exercise date:', error);
        return false;
      }
    });
    
    // Log the number of exercises available for today to help with debugging
    console.log(`Found ${todaysExercises.length} exercises for date ${dateToUse}`);
    console.log('Today\'s exercise IDs:', todaysExercises.map(ex => ex.id));
    console.log('Current ordered IDs:', orderedExerciseIds);
    
    if (todaysExercises.length === 0) {
      // No exercises for today
      return [];
    }

    // Check if we have ordered IDs that are valid for today's exercises
    const validOrderedIds = orderedExerciseIds.filter(id => 
      todaysExercises.some(ex => ex.id === id)
    );
    
    // Get exercises in the ordered list
    const orderedExercises = validOrderedIds
      .map(id => todaysExercises.find(ex => ex.id === id))
      .filter(Boolean) as typeof todaysExercises;
    
    // Find any exercises not in the ordered list
    const remainingExercises = todaysExercises.filter(
      ex => !validOrderedIds.includes(ex.id)
    );    // Return ordered exercises followed by any that might not be in the ordered list
    const result = [...orderedExercises, ...remainingExercises];
    console.log(`Returning ${result.length} ordered exercises`);
    return result;
  }
}),
{
  name: 'exercise-order-storage',
  // Include version key for future migrations
  version: 1,
  // Skip hydration errors when state is hydrated from storage
  skipHydration: true,
}));
