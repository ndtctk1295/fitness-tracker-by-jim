'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CalendarIcon, CalendarDays, List, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

type CalendarViewMode = 'simple' | 'detailed';

interface CalendarViewToggleProps {
  currentView: CalendarViewMode;
  onViewChange: (view: CalendarViewMode) => void;
  className?: string;
}

const STORAGE_KEY = 'calendar-view-preference';

export function CalendarViewToggle({ 
  currentView, 
  onViewChange,
  className 
}: CalendarViewToggleProps) {
  // Load preference from localStorage on mount
  useEffect(() => {
    const savedView = localStorage.getItem(STORAGE_KEY) as CalendarViewMode;
    if (savedView && savedView !== currentView) {
      onViewChange(savedView);
    }
  }, [currentView, onViewChange]);

  const handleViewChange = (view: CalendarViewMode) => {
    onViewChange(view);
    localStorage.setItem(STORAGE_KEY, view);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm font-medium text-muted-foreground">View:</span>
      <ToggleGroup 
        type="single" 
        value={currentView} 
        onValueChange={(value) => value && handleViewChange(value as CalendarViewMode)}
        className="h-9"
      >
        <ToggleGroupItem 
          value="simple" 
          aria-label="Simple view"
          className="h-8 px-3"
        >
          <List className="h-4 w-4 mr-2" />
          Simple
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="detailed" 
          aria-label="Detailed view"
          className="h-8 px-3"
        >
          <Grid3X3 className="h-4 w-4 mr-2" />
          Detailed
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
