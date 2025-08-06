'use client';

import { useDroppable } from '@dnd-kit/core';
import { format } from 'date-fns';

interface DroppableCalendarDateProps {
  date: Date;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  'data-testid'?: string;
  'data-date'?: string;
}

export function DroppableCalendarDate({ 
  date, 
  children, 
  className = '',
  onClick,
  'data-testid': testId,
  'data-date': dataDate,
  ...props
}: DroppableCalendarDateProps) {
  const {
    isOver,
    setNodeRef,
    active
  } = useDroppable({
    id: `calendar-date-${date.toISOString()}`,
    data: {
      type: 'calendar-date',
      date,
      dateString: format(date, 'yyyy-MM-dd'), // Also provide formatted string
    },
  });
  
  // Check if the current drag operation would violate week restriction
  const draggedExercise = active?.data.current?.exercise;
  const isValidDrop = !draggedExercise || (() => {
    // If no exercise is being dragged, all drops are valid
    if (!draggedExercise) return true;
    
    try {
      // Import startOfWeek from date-fns
      const { startOfWeek } = require('date-fns');
      
      // Get the original exercise date
      const originalDate = new Date(draggedExercise.date);
      
      // Get start of week for both dates (Sunday as start of week - weekStartsOn: 0)
      const originalWeekStart = startOfWeek(originalDate, { weekStartsOn: 0 });
      const targetWeekStart = startOfWeek(date, { weekStartsOn: 0 });
      
      // Check if the dates are in the same week
      return format(originalWeekStart, 'yyyy-MM-dd') === format(targetWeekStart, 'yyyy-MM-dd');
    } catch (error) {
      // If there's any error in calculation, default to allowing the drop
      console.error('Error checking week validity:', error);
      return true;
    }
  })();

  return (
    <div
      ref={setNodeRef}
      className={`
        relative
        ${className}
        ${isOver && isValidDrop ? 'ring-2 ring-primary ring-offset-2 bg-primary/10 border-primary shadow-lg' : ''}
        ${isOver && !isValidDrop ? 'ring-2 ring-destructive ring-offset-2 bg-destructive/10 border-destructive shadow-lg' : ''}
        transition-all duration-200 ease-in-out
      `}
      onClick={onClick}
      data-testid={testId}
      data-date={dataDate}
      {...props}
    >
      {children}
      {isOver && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-primary/5 rounded-lg">
          <div className={`text-xs font-medium ${isValidDrop ? 'text-primary bg-background/90' : 'text-destructive bg-background/90'} px-2 py-1 rounded-md shadow-sm`}>
            {isValidDrop 
              ? 'Drop here to reschedule' 
              : 'Same week only (Sun-Sat)'}
          </div>
        </div>
      )}
    </div>
  );
}
