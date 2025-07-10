'use client';

import { useState } from 'react';
import { Check, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ExerciseCompletionToggleProps {
  exerciseId: string;
  completed?: boolean;
  completedAt?: string;
  onToggle?: (exerciseId: string, newStatus: boolean) => Promise<void>;
  onMarkCompleted?: (exerciseId: string) => Promise<void>;
  onMarkIncomplete?: (exerciseId: string) => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'badge' | 'checkbox';
  disabled?: boolean;
  showTimestamp?: boolean;
}

export function ExerciseCompletionToggle({
  exerciseId,
  completed = false,
  completedAt,
  onToggle,
  onMarkCompleted,
  onMarkIncomplete,
  size = 'md',
  variant = 'button',
  disabled = false,
  showTimestamp = false,
}: ExerciseCompletionToggleProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      if (onToggle) {
        await onToggle(exerciseId, !completed);
      } else if (!completed && onMarkCompleted) {
        await onMarkCompleted(exerciseId);
      } else if (completed && onMarkIncomplete) {
        await onMarkIncomplete(exerciseId);
      }
    } catch (error) {
      console.error('Failed to toggle exercise completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCompletedAt = (timestamp?: string) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return '';
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'h-7 w-7';
      case 'lg': return 'h-10 w-10';
      default: return 'h-8 w-8';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3';
      case 'lg': return 'h-5 w-5';
      default: return 'h-4 w-4';
    }
  };

  if (variant === 'badge') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={completed ? 'default' : 'secondary'}
              className={cn(
                'cursor-pointer transition-colors',
                completed 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={handleToggle}
            >
              {isLoading ? (
                <Loader2 className={cn(getIconSize(), 'animate-spin mr-1')} />
              ) : completed ? (
                <Check className={cn(getIconSize(), 'mr-1')} />
              ) : (
                <Clock className={cn(getIconSize(), 'mr-1')} />
              )}
              {completed ? 'Completed' : 'Pending'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p>{completed ? 'Mark as incomplete' : 'Mark as completed'}</p>
              {showTimestamp && completedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Completed: {formatCompletedAt(completedAt)}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'checkbox') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex items-center space-x-2 cursor-pointer p-2 rounded-md transition-colors hover:bg-muted',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={handleToggle}
            >
              <div
                className={cn(
                  'flex items-center justify-center rounded border-2 transition-colors',
                  getButtonSize(),
                  completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-gray-400'
                )}
              >
                {isLoading ? (
                  <Loader2 className={cn(getIconSize(), 'animate-spin')} />
                ) : completed ? (
                  <Check className={getIconSize()} />
                ) : null}
              </div>
              <span className={cn('text-sm', completed && 'line-through text-muted-foreground')}>
                {completed ? 'Completed' : 'Mark as completed'}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p>{completed ? 'Mark as incomplete' : 'Mark as completed'}</p>
              {showTimestamp && completedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Completed: {formatCompletedAt(completedAt)}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Default button variant
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={completed ? 'default' : 'outline'}
            size="sm"
            className={cn(
              getButtonSize(),
              'p-0',
              completed 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={handleToggle}
            disabled={disabled || isLoading}
          >
            {isLoading ? (
              <Loader2 className={cn(getIconSize(), 'animate-spin')} />
            ) : completed ? (
              <Check className={getIconSize()} />
            ) : (
              <Clock className={getIconSize()} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p>{completed ? 'Mark as incomplete' : 'Mark as completed'}</p>
            {showTimestamp && completedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Completed: {formatCompletedAt(completedAt)}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
