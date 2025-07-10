"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarDays, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { useWorkoutPlanStore } from "@/lib/stores/workout-plan-store";
import { useScheduledExerciseStore } from "@/lib/stores/scheduled-exercise-store";
import { ExerciseConversionGuide } from "@/components/workout-plans/exercise-conversion-guide";
import { WorkoutPlanCard } from "@/components/workout-plans/workout-plan-card";

export default function ExerciseConversionDemoPage() {
  const { 
    workoutPlans, 
    activePlan, 
    isLoading, 
    error, 
    initializeStore,
    generateScheduledExercises 
  } = useWorkoutPlanStore();
  
  const { 
    scheduledExercises, 
    getExercisesByDateRange 
  } = useScheduledExerciseStore();

  const [demoResult, setDemoResult] = useState<{
    success: boolean;
    count: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const handleDemoGeneration = async () => {
    if (!activePlan) {
      setDemoResult({
        success: false,
        count: 0,
        message: "No active workout plan found. Please activate a plan first."
      });
      return;
    }

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 6); // Next 7 days

      const result = await generateScheduledExercises(startDate, endDate);
      setDemoResult(result);
    } catch (error) {
      setDemoResult({
        success: false,
        count: 0,
        message: error instanceof Error ? error.message : "Failed to generate exercises"
      });
    }
  };

  // Get exercises for the next week to show current scheduled count
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 6);
  
  const upcomingExercises = getExercisesByDateRange(
    today.toISOString().split('T')[0],
    nextWeek.toISOString().split('T')[0]
  );

  const plannedExercises = upcomingExercises.filter(ex => ex.workoutPlanId);
  const manualExercises = upcomingExercises.filter(ex => !ex.workoutPlanId);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading workout plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Exercise Conversion Demo</h1>
        <p className="text-muted-foreground">
          Learn how to convert your workout plan templates into scheduled exercises
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Workout Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workoutPlans.length}</div>
            <p className="text-xs text-muted-foreground">
              {activePlan ? `1 active plan` : 'No active plan'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Scheduled Exercises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingExercises.length}</div>
            <p className="text-xs text-muted-foreground">
              Next 7 days
            </p>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {plannedExercises.length} from plans
              </Badge>
              <Badge variant="outline" className="text-xs">
                {manualExercises.length} manual
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activePlan ? (
                <Badge variant="default" className="text-xs">
                  Ready to Generate
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Need Active Plan
                </Badge>
              )}
              <p className="text-xs text-muted-foreground">
                {activePlan ? activePlan.name : 'Activate a plan to start'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Plan Demo */}
      {activePlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Exercise Generation Demo
            </CardTitle>
            <CardDescription>
              Generate exercises from your active workout plan: {activePlan.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button onClick={handleDemoGeneration} className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Generate Next 7 Days
              </Button>
              <span className="text-sm text-muted-foreground">
                Creates scheduled exercises for the upcoming week
              </span>
            </div>

            {demoResult && (
              <Alert variant={demoResult.success ? "default" : "destructive"}>
                <div className="flex items-center gap-2">
                  {demoResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {demoResult.success 
                      ? `Success! Generated ${demoResult.count} exercises. Check your calendar to see them.`
                      : demoResult.message
                    }
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Workout Plans List */}
      {workoutPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Workout Plans</CardTitle>
            <CardDescription>
              Activate a plan to enable exercise generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {workoutPlans.slice(0, 3).map((plan) => (
                <WorkoutPlanCard
                  key={plan.id}
                  plan={plan}
                  isActive={plan.isActive}
                  compact={true}
                />
              ))}
              {workoutPlans.length > 3 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  ... and {workoutPlans.length - 3} more plans
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversion Guide */}
      <ExerciseConversionGuide hasActivePlan={!!activePlan} />

      {/* Technical Information */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
          <CardDescription>
            Behind-the-scenes information about exercise conversion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Available API Endpoints</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>/api/workout-plans/generate-exercises</code> - Bulk generation</li>
                <li>• <code>/api/workout-plans/exercises/[date]</code> - Single date</li>
                <li>• <code>/api/workout-plans/active</code> - Get active plan</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Store Methods</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>generateScheduledExercises()</code> - Main generation</li>
                <li>• <code>activatePlan()</code> - Plan activation</li>
                <li>• <code>getExercisesForDate()</code> - Template retrieval</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Data Flow</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="px-2 py-1 bg-orange-500/10 text-orange-600 rounded">Template</span>
              <span>→</span>
              <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded">Generation</span>
              <span>→</span>
              <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded">Scheduled</span>
              <span>→</span>
              <span className="px-2 py-1 bg-purple-500/10 text-purple-600 rounded">Execution</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
