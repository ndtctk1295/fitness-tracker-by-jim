'use client';

import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area-stable';
import { SimpleSortableItem } from './SimpleSortableItem';

interface ExerciseListProps {
  title: string;
  description: string;
  exercises: any[];
  scheduledExercises: any[];
  categories: any[];
  orderedExerciseIds: string[];
  currentExerciseIndex: number;
  currentSet?: number;
  sensors: any;
  handleDragEnd: (event: any) => void;
  isTimerActive: boolean;
  orderedExercises: any[]; // Pre-calculated ordered exercises
}

/**
 * Exercise list component with drag-and-drop reordering capability
 */
export const ExerciseList = React.memo(function ExerciseList({
  title,
  description,
  exercises,
  scheduledExercises,
  categories,
  orderedExerciseIds,
  currentExerciseIndex,
  currentSet,
  sensors,
  handleDragEnd,
  isTimerActive,
  orderedExercises,
}: ExerciseListProps) {  // Use the pre-calculated ordered exercises
  const orderedExercisesList = orderedExercises;  // Debug log using regular console.log when needed, not in useEffect
  /*
  console.log("ExerciseList received:", {
    orderedExercisesCount: orderedExercises?.length || 0,
    orderedIdsCount: orderedExerciseIds?.length || 0,
    scheduledExercisesCount: scheduledExercises?.length || 0,
    timerId: Math.random().toString(36).substring(2, 9) // Random ID to track component instances
  });
  */
    
  // Make sure we have items to sort, using the orderedExercises directly
  const sortableItems = React.useMemo(() => {
    // First check if we have ordered exercises already calculated
    if (orderedExercisesList.length > 0) {
      return orderedExercisesList.map(ex => ex.id);
    }
    
    // Fallback to ordered IDs if available
    if (orderedExerciseIds.length > 0) {
      return orderedExerciseIds;
    }
    
    // Last resort: use all scheduled exercises
    return scheduledExercises.map(ex => ex.id);
  }, [orderedExercisesList, orderedExerciseIds, scheduledExercises]);
  
  // Create a stable renderContent function to avoid creating new function instances
  const renderExerciseItems = React.useCallback(() => {
    return orderedExercisesList.map((scheduledEx, index) => {
      const exercise = exercises.find(e => e.id === scheduledEx.exerciseId);
      const category = categories.find(c => c.id === scheduledEx.categoryId);
      
      // Highlight current exercise
      const isCurrentExercise = isTimerActive && index === currentExerciseIndex;
        return (
        <SimpleSortableItem
          key={scheduledEx.id}
          id={scheduledEx.id}
          exercise={exercise}
          category={category}
          scheduledEx={scheduledEx}
          isCurrentExercise={isCurrentExercise}
          currentSet={isCurrentExercise ? currentSet : undefined}
        />
      );
    });
  }, [orderedExercisesList, exercises, categories, isTimerActive, currentExerciseIndex, currentSet]);
  
  // Memoize the empty state to avoid rerendering
  const emptyState = React.useMemo(() => (
    <div className="text-center py-4 text-muted-foreground">
      No exercises scheduled for today
    </div>
  ), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {orderedExercisesList.length === 0 ? (
            emptyState
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={sortableItems}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {renderExerciseItems()}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

ExerciseList.displayName = 'ExerciseList';
