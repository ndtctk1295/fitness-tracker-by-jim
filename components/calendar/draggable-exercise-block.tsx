'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableExerciseBlockProps {
  exercise: {
    id: string;
    exerciseId: string;
    categoryId: string;
    workoutPlanId?: string;
    date: string;
    isTemplate?: boolean;
  };
  exerciseDetails: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    color?: string;
  };
  calendarViewMode: 'simple' | 'detailed';
  children: React.ReactNode;
}

export function DraggableExerciseBlock({
  exercise,
  exerciseDetails,
  category,
  calendarViewMode,
  children
}: DraggableExerciseBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: exercise.id,
    data: {
      type: 'exercise',
      exercise,
      exerciseDetails,
      category,
    },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 1000 : 'auto',
    transition: isDragging ? 'none' : 'all 0.2s ease',
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        cursor-grab active:cursor-grabbing
        transition-all duration-200 ease-in-out
        ${isDragging ? 'z-50 shadow-lg ring-2 ring-primary/50 scale-105' : 'hover:shadow-sm'}
      `}
      data-testid="calendar-exercise"
      data-date={exercise.date}
      data-type={exercise.workoutPlanId ? (exercise.isTemplate ? 'template' : 'scheduled') : 'manual'}
    >
      {children}
    </div>
  );
}
