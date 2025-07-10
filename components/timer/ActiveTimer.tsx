'use client';

import { 
  AlertCircle, 
  CheckCircle2, 
  Dumbbell, 
  Pause, 
  Play, 
  RotateCcw, 
  StopCircle, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ActiveTimerProps {
  strategy: any;
  activeTimer: any;
  currentExercise: any;
  currentExerciseCategory: any;
  currentSet: number;
  getCurrentExerciseDetails: () => { sets: number; reps: number; weight: number };
  orderedExercises: any[];
  currentExerciseIndex: number;
  exercises: any[];
  categories: any[];
  displayTime: () => string;
  percentComplete: () => number;
  isRunning: boolean;
  minutes: number;
  seconds: number;
  handlePauseTimer: () => void;
  handleResumeTimer: () => void;
  handleNextSegment: () => void;
  skipToEnd: () => void;
  handleStopTimer: () => void;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  isAutoSwitchEnabled: boolean; // Auto-switching between rest/active
  setIsAutoSwitchEnabled: (enabled: boolean) => void; // Toggle auto-switching
  testSound: () => Promise<boolean>;
  toast: any;
}

/**
 * Active timer component that displays the current exercise, timer, and controls
 */
export function ActiveTimer({
  strategy,
  activeTimer,
  currentExercise,
  currentExerciseCategory,
  currentSet,
  getCurrentExerciseDetails,
  orderedExercises,
  currentExerciseIndex,
  exercises,
  categories,
  displayTime,
  percentComplete,
  isRunning,
  minutes,
  seconds,
  handlePauseTimer,
  handleResumeTimer,
  handleNextSegment,
  skipToEnd,
  handleStopTimer,
  isSoundEnabled,
  setIsSoundEnabled,
  isAutoSwitchEnabled,
  setIsAutoSwitchEnabled,
  testSound,
  toast,
}: ActiveTimerProps) {
  return (
    <Card className="mb-6 overflow-hidden">
      <div
        className="h-2 w-full"
        style={{ backgroundColor: strategy.color }}
      >
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${percentComplete()}%` }}
        />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{strategy.name}</CardTitle>
          <Badge variant={activeTimer.isRest ? "secondary" : "default"}>
            {activeTimer.isRest ? "REST" : "ACTIVE"}
          </Badge>
        </div>
        <CardDescription>
          {activeTimer.isRest ? "Rest between sets" : "Active workout period"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {currentExercise && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Dumbbell className="mr-2 h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">{currentExercise.name}</h3>
              </div>
              <Badge variant={activeTimer.isRest ? "outline" : "default"}>
                {activeTimer.isRest ? "Coming up" : "Current"}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm mt-2">
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">Set:</span>
                <span className="font-medium">
                  {currentSet}/{getCurrentExerciseDetails().sets}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">Reps:</span>
                <span className="font-medium">{getCurrentExerciseDetails().reps}</span>
              </div>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">Weight:</span>
                <span className="font-medium">{getCurrentExerciseDetails().weight}kg</span>
              </div>
            </div>
          </div>
        )}

        {/* Show next exercise during rest if there is one */}
        {activeTimer.isRest && 
         currentExerciseIndex < orderedExercises.length - 1 && 
         currentSet >= getCurrentExerciseDetails().sets && (
          <div className="mb-6 p-4 bg-neutral-100 dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  Next Exercise
                </h3>
              </div>
            </div>

            {(() => {
              const nextExercise = exercises.find(
                (e) => e.id === orderedExercises[currentExerciseIndex + 1].exerciseId
              );
              const nextCategory = categories.find(
                (c) => c.id === orderedExercises[currentExerciseIndex + 1].categoryId
              );

              return nextExercise ? (
                <>
                  <div className="flex items-center mt-2">
                    <h4 className="font-semibold">{nextExercise.name}</h4>
                    {nextCategory && (
                      <Badge
                        className="ml-2"
                        variant="outline"
                        style={{ borderColor: nextCategory.color }}
                      >
                        {nextCategory.name}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm mt-2 text-muted-foreground">
                    <div>Sets: {orderedExercises[currentExerciseIndex + 1].sets}</div>
                    <div>Reps: {orderedExercises[currentExerciseIndex + 1].reps}</div>
                    <div>Weight: {orderedExercises[currentExerciseIndex + 1].weight}kg</div>
                  </div>
                </>
              ) : null;
            })()}
          </div>
        )}

        {/* Timer Display */}
        <div className="flex flex-col items-center">
          <div className="text-6xl font-bold mb-4">{displayTime()}</div>

          <div className="w-full flex items-center justify-center mb-4 gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                if (!isSoundEnabled) {
                  setIsSoundEnabled(true);
                  setTimeout(async () => {
                    const success = await testSound();
                    if (!success) {
                      toast({
                        title: "Sound test failed",
                        description:
                          "Sound notifications may not work. Try clicking somewhere on the page first.",
                        variant: "destructive",
                      });
                    } else {
                      toast({
                        title: "Sound enabled",
                        description: "Timer notifications will play sounds.",
                      });
                    }
                  }, 100);
                } else {
                  setIsSoundEnabled(false);
                  toast({
                    title: "Sound disabled",
                    description: "Timer notifications will be silent.",
                  });
                }
              }}
              title={isSoundEnabled ? "Mute sound" : "Enable sound"}
            >
              {isSoundEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>
            <div className="flex flex-col">
              <span className="text-xs font-medium">
                {isSoundEnabled ? "Sound on" : "Sound off"}
              </span>
              {isSoundEnabled && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={async () => {
                    const success = await testSound();
                    if (success) {
                      toast({ title: "Sound test successful!" });
                    } else {
                      toast({
                        title: "Sound test failed",
                        description: "Sound is blocked by your browser.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Test sound
                </Button>
              )}
            </div>          </div>
            {/* Auto-switch toggle */}
          <div className="flex items-center justify-between py-3 mb-4 border-t border-b">
            <div>
              <Label htmlFor="auto-switch-mode" className="text-sm font-medium">
                Auto Switch Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                {isAutoSwitchEnabled 
                  ? "Timer automatically advances to next phase" 
                  : "You'll need to manually click Next when timer ends"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="auto-switch-mode"
                checked={isAutoSwitchEnabled}
                onCheckedChange={setIsAutoSwitchEnabled}
              />
              <Label htmlFor="auto-switch-mode" className="text-xs font-medium">
                {isAutoSwitchEnabled ? "Auto" : "Manual"}
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">            {/* Primary action buttons */}
            {activeTimer.isActive && !activeTimer.isPaused && isRunning ? (
              <Button variant="outline" onClick={handlePauseTimer}>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            ) : minutes === 0 && seconds === 0 ? (
              <Button 
                variant={!isAutoSwitchEnabled ? "default" : "outline"}
                onClick={handleNextSegment}
                className={!isAutoSwitchEnabled ? "bg-green-600 hover:bg-green-700 animate-pulse" : ""}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {!isAutoSwitchEnabled ? "Next" : activeTimer.isRest ? "Start Set" : "Start Rest"}
              </Button>
            ) : activeTimer.isActive && activeTimer.isPaused ? (
              <Button variant="outline" onClick={handleResumeTimer}>
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
            ) : (
              <Button variant="outline" onClick={handleResumeTimer}>
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
            )}

            {/* Skip to end button */}
            <Button variant="secondary" onClick={skipToEnd}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Skip
            </Button>

            {/* Stop button */}
            <Button variant="destructive" onClick={handleStopTimer}>
              <StopCircle className="mr-2 h-4 w-4" />
              Stop
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
