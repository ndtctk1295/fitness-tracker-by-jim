'use client';

import * as React from 'react';
import { AlertCircle, GripVertical, Play, Plus } from 'lucide-react';
import Link from 'next/link';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select-stable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface TimerSetupProps {
  timerStrategies: any[];
  selectedStrategyId: string;
  setSelectedStrategyId: (id: string) => void;
  handleStartTimer: () => void;
  soundPermissionStatus: string;
  todaysExercisesCount: number;
  todaysCompletedExercisesCount: number;
  isAutoSwitchEnabled: boolean;
  setIsAutoSwitchEnabled: (enabled: boolean) => void;
}

// Create a memoized Select component to prevent re-renders
const MemoizedSelect = React.memo(
  ({ value, onValueChange, children }: { 
    value: string; 
    onValueChange: (value: string) => void;
    children: React.ReactNode;
  }) => {
    // Create a ref to store the latest value/callback without triggering re-renders
    const valueRef = React.useRef(value);
    const callbackRef = React.useRef(onValueChange);
    
    // Update refs when props change
    React.useEffect(() => {
      valueRef.current = value;
      callbackRef.current = onValueChange;
    }, [value, onValueChange]);
    
    // Create a truly stable callback that never changes
    const handleChange = React.useCallback((newValue: string) => {
      if (newValue !== valueRef.current) {
        callbackRef.current(newValue);
      }
    }, []);
    
    return (
      <Select value={value} onValueChange={handleChange}>
        {children}
      </Select>
    );
  },
  // Custom comparison to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Only re-render if value actually changed
    return prevProps.value === nextProps.value;
  }
);
MemoizedSelect.displayName = 'MemoizedSelect';

/**
 * Timer setup component for selecting timer strategy and starting the timer
 */
export function TimerSetup({
  timerStrategies,
  selectedStrategyId,
  setSelectedStrategyId,
  handleStartTimer,
  soundPermissionStatus,
  todaysExercisesCount,
  todaysCompletedExercisesCount,
  isAutoSwitchEnabled,
  setIsAutoSwitchEnabled,
}: TimerSetupProps) {
  // Use memo to ensure the value is stable across renders
  const effectiveStrategyId = React.useMemo(() => {
    return selectedStrategyId || (timerStrategies.length > 0 ? timerStrategies[0].id : "");
  }, [selectedStrategyId, timerStrategies]);
    // Memoize the strategies list to prevent unnecessary re-renders
  const memoizedStrategies = React.useMemo(() => {
    return timerStrategies.map(strategy => ({
      id: strategy.id,
      name: strategy.name
    }));
  }, [timerStrategies]);

  // Check if all exercises are completed
  const allExercisesCompleted = React.useMemo(() => {
    return todaysExercisesCount > 0 && todaysCompletedExercisesCount === todaysExercisesCount;
  }, [todaysExercisesCount, todaysCompletedExercisesCount]);
  
  return (
    <Card className="mb-6" data-testid="timer-setup">
      <CardHeader>
        <CardTitle>Start New Timer</CardTitle>
        <CardDescription>Set up your workout timer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Timer Strategy</label>
          {timerStrategies.length === 0 ? (
            <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/50">
              <div className="text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  No Timer Strategies Found
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  You need to create a timer strategy before you can start a workout timer.
                </p>
                <Link href="/timer-strategies">
                  <Button variant="outline" size="sm" className="gap-2" data-testid="create-strategy-button">
                    <Plus className="h-4 w-4" />
                    Create Timer Strategy
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <MemoizedSelect
              value={effectiveStrategyId}
              onValueChange={setSelectedStrategyId}
            >
              <SelectTrigger data-testid="timer-strategy-selector">
                <SelectValue placeholder="Select a timer strategy" />
              </SelectTrigger>
              <SelectContent>
                {memoizedStrategies.map((strategy) => (
                  <SelectItem key={strategy.id} value={strategy.id} data-testid="strategy-option">
                    {strategy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </MemoizedSelect>
          )}
        </div>

        {/* Auto-switch toggle */}
        <div className="space-y-2 py-2 border-y">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="setup-auto-switch" className="text-sm font-medium">
                Auto Switch Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                {isAutoSwitchEnabled 
                  ? "Timer will auto-advance between active and rest periods" 
                  : "You'll need to manually advance between timer phases"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="setup-auto-switch"
                checked={isAutoSwitchEnabled}
                onCheckedChange={setIsAutoSwitchEnabled}
                data-testid="auto-switch-toggle"
              />
              <Label htmlFor="setup-auto-switch" className="text-xs">
                {isAutoSwitchEnabled ? "Auto" : "Manual"}
              </Label>
            </div>
          </div>
        </div>

        {todaysExercisesCount > 0 && (
          <div className="p-3 bg-muted/50 border border-muted rounded-md">
            <div className="flex items-center mb-2">
              <GripVertical className="h-4 w-4 mr-2 text-muted-foreground" />
              <p className="text-sm font-medium">Customize Exercise Order</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Drag exercises in the list below to customize your workout order before starting.
            </p>
          </div>        )}      </CardContent>
      <CardFooter className="flex-col space-y-4">
        {/* All exercises completed message */}
        {allExercisesCompleted && (
          <div className="w-full p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-green-800">
                  🎉 Congratulations!
                </p>
                <p className="text-xs text-green-600 mt-1">
                  You have completed all your exercises for today!
                </p>
              </div>
            </div>
          </div>
        )}     
        {}   
        <Button 
          onClick={handleStartTimer} 
          className="w-full" 
          disabled={!effectiveStrategyId || todaysExercisesCount === 0 || timerStrategies.length === 0}
          data-testid="start-timer-button"
        >
          <Play className="mr-2 h-4 w-4" />
          {timerStrategies.length === 0 
            ? "Create a Timer Strategy First" 
            : todaysExercisesCount === 0 
              ? "No Exercises Scheduled for Today"
              : "Start Timer"
          }
        </Button>
        {soundPermissionStatus === 'denied' && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sound Disabled</AlertTitle>
            <AlertDescription>
              Sound notifications are blocked by your browser. Please check site settings.
            </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
}
