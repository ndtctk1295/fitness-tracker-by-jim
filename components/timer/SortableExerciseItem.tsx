'use client';

import React, { useState, useEffect } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { GripVertical } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Types
export interface SortableExerciseItemProps {
  id: string;
  exercise: any | null;
  category: any | null;
  scheduledEx: any;
  isCurrentExercise: boolean;
  currentSet?: number;
}

/**
 * A completely simplified sortable exercise item component for drag and drop functionality
 * Avoids React Hooks errors with DnD library
 */
export function SortableExerciseItem({
  id,
  exercise,
  category,
  scheduledEx,
  isCurrentExercise,
  currentSet,
}: SortableExerciseItemProps) {
  // Add state to track if we're on the client side to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);
  
  // Set client-side flag after hydration is complete
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Safe sortable implementation - only use when on client
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
    disabled: isCurrentExercise || !isClient,
  });
  
  // Create a safe style object
  const style = {
    transform: isClient && transform ? CSS.Transform.toString(transform) : undefined,
    transition: isClient ? transition : undefined,
    position: 'relative' as const,
  };
  
  // Handle null exercise or category gracefully
  if (!exercise) {
    return null;
  }
  
  // Determine details to display based on exercise and schedule
  const sets = scheduledEx.sets || 0;
  const reps = scheduledEx.reps || 0;
  
  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-10' : ''} ${isCurrentExercise ? 'bg-primary-foreground border-primary' : ''}`}
    >
      <div className="absolute top-3 right-3">
        {category && (
          <Badge variant="secondary" className="mr-2">
            {category.name}
          </Badge>
        )}
        {isCurrentExercise && (
          <Badge variant="default">
            Active {currentSet ? `- Set ${currentSet}/${sets}` : ''}
          </Badge>
        )}
      </div>
      
      <CardHeader className="flex flex-row items-center gap-4 pb-2 space-y-0">
        {isClient && !isCurrentExercise && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none p-1"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <CardTitle className="text-lg font-semibold truncate max-w-[70%]">
          {exercise.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 pb-4">
        <div className="text-sm text-muted-foreground">
          {sets} sets × {reps} reps
          {scheduledEx.weight > 0 && ` - ${scheduledEx.weight} kg`}
        </div>
      </CardContent>
    </Card>
  );
}
