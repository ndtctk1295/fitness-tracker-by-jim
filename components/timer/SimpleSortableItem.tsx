'use client';

import React, { useState, useEffect } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { GripVertical } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Types
export interface SimpleSortableItemProps {
  id: string;
  exercise: any | null;
  category: any | null;
  scheduledEx: any;
  isCurrentExercise: boolean;
  currentSet?: number;
}

/**
 * A simplified sortable exercise item component that avoids React hooks errors
 */
export function SimpleSortableItem({
  id,
  exercise,
  category,
  scheduledEx,
  isCurrentExercise,
  currentSet,
}: SimpleSortableItemProps) {
  // Add state to track if we're on the client side
  const [isClient, setIsClient] = useState(false);
  
  // Set client-side flag after hydration is complete
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Only use sortable on client side
  const sortable = useSortable({
    id,
    disabled: isCurrentExercise || !isClient,
  });
  
  // Create a safe style object
  const itemStyle = {
    transform: isClient && sortable.transform ? CSS.Transform.toString(sortable.transform) : undefined,
    transition: isClient ? sortable.transition : undefined,
    position: 'relative' as const,
  };
  
  // Handle null exercise gracefully
  if (!exercise) {
    return null;
  }
  
  // Get exercise details
  const numSets = scheduledEx.sets || 0;
  const numReps = scheduledEx.reps || 0;
  
  return (
    <Card
      ref={sortable.setNodeRef}
      style={itemStyle}
      className={`relative ${sortable.isDragging ? 'z-10' : ''} ${isCurrentExercise ? 'bg-primary-foreground border-primary' : ''}`}
    >
      <div className="absolute top-3 right-3">
        {category && (
          <Badge variant="secondary" className="mr-2">
            {category.name}
          </Badge>
        )}
        {isCurrentExercise && (
          <Badge variant="default">
            Active {currentSet ? `- Set ${currentSet}/${numSets}` : ''}
          </Badge>
        )}
      </div>
      
      <CardHeader className="flex flex-row items-center gap-4 pb-2 space-y-0">
        {isClient && !isCurrentExercise && (
          <div
            {...sortable.attributes}
            {...sortable.listeners}
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
          {numSets} sets × {numReps} reps
          {scheduledEx.weight > 0 && ` - ${scheduledEx.weight} kg`}
        </div>
      </CardContent>
    </Card>
  );
}
