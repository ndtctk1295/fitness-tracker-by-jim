'use client';

import { create } from 'zustand';

// UI state interface - Exercise-specific UI state only (no calendar overlap)
interface ScheduledExerciseUIState {
  // Generation state
  hasCheckedGeneration: boolean;
  
  // Loading states for UI actions (not data loading)
  isGenerating: boolean;
  
  // Modal/dialog states
  showTemplateModal: boolean;
  showExerciseModal: boolean;
  selectedExerciseId: string | null;
}

interface ScheduledExerciseUIActions {
  // Generation actions
  setHasCheckedGeneration: (checked: boolean) => void;
  setIsGenerating: (generating: boolean) => void;
  
  // Modal actions
  setShowTemplateModal: (show: boolean) => void;
  setShowExerciseModal: (show: boolean) => void;
  setSelectedExerciseId: (id: string | null) => void;
  
  // Utility actions
  reset: () => void;
}

/**
 * Pure UI state store for scheduled exercises
 * Handles only exercise-specific UI state like modals, generation flags, etc.
 * For calendar UI state (dates, views, navigation), use useCalendarStore
 * For data operations, use the hooks from use-scheduled-exercise-data.ts
 */
export const useScheduledExerciseStore = create<ScheduledExerciseUIState & ScheduledExerciseUIActions>((set) => ({
  // UI State (exercise-specific only)
  hasCheckedGeneration: false,
  isGenerating: false,
  showTemplateModal: false,
  showExerciseModal: false,
  selectedExerciseId: null,

  // Generation Actions
  setHasCheckedGeneration: (checked: boolean) => 
    set((state) => ({ ...state, hasCheckedGeneration: checked })),
  
  setIsGenerating: (generating: boolean) => 
    set((state) => ({ ...state, isGenerating: generating })),
  
  // Modal Actions
  setShowTemplateModal: (show: boolean) => 
    set((state) => ({ ...state, showTemplateModal: show })),
  
  setShowExerciseModal: (show: boolean) => 
    set((state) => ({ ...state, showExerciseModal: show })),
  
  setSelectedExerciseId: (id: string | null) => 
    set((state) => ({ ...state, selectedExerciseId: id })),
  
  // Reset
  reset: () => set({
    hasCheckedGeneration: false,
    isGenerating: false,
    showTemplateModal: false,
    showExerciseModal: false,
    selectedExerciseId: null,
  }),
}));

/**
 * Legacy compatibility - use useScheduledExerciseStore directly
 * @deprecated Use useScheduledExerciseStore for UI state and use-scheduled-exercise-data hooks for data
 */
export const useScheduledExerciseUIStore = useScheduledExerciseStore;

export default useScheduledExerciseStore;
