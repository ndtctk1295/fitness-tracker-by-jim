"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format, subDays, eachDayOfInterval, isSameDay } from "date-fns";
import { WorkoutPlan } from "@/lib/services/workout-plan-service";
import { useScheduledExerciseStore } from "@/lib/stores/scheduled-exercise-store";
import { useExerciseStore } from "@/lib/stores/exercise-store";

interface ProgressionGraphProps {
  workoutPlan: WorkoutPlan;
}

interface ProgressData {
  date: string;
  completionRate: number;
  exercisesCompleted: number;
  totalExercises: number;
}

interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  sessions: Array<{
    date: string;
    weight?: number;
    reps?: number;
    sets?: number;
    duration?: number;
  }>;
  trend: 'up' | 'down' | 'stable';
}

export function ProgressionGraph({ workoutPlan }: ProgressionGraphProps) {
  const { scheduledExercises } = useScheduledExerciseStore();
  const { exercises } = useExerciseStore();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | '3months'>('month');
  const [view, setView] = useState<'completion' | 'exercises'>('completion');
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);

  useEffect(() => {
    calculateProgressData();
  }, [workoutPlan, scheduledExercises, timeframe]);

  const calculateProgressData = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = subDays(now, 30);
        break;
      case '3months':
        startDate = subDays(now, 90);
        break;
    }    // Filter scheduled exercises for this plan and timeframe
    const planExercises = scheduledExercises.filter(ex => 
      ex.workoutPlanId === workoutPlan.id &&
      new Date(ex.date) >= startDate &&
      new Date(ex.date) <= now
    );

    // Calculate daily progress
    const dayRange = eachDayOfInterval({ start: startDate, end: now });
    const dailyProgress = dayRange.map(date => {
      const dayExercises = planExercises.filter(ex => 
        isSameDay(new Date(ex.date), date)
      );
      const completedOnDay = dayExercises.filter(ex => ex.completed).length;
      
      return {
        date: format(date, 'yyyy-MM-dd'),
        completionRate: dayExercises.length > 0 ? (completedOnDay / dayExercises.length) * 100 : 0,
        exercisesCompleted: completedOnDay,
        totalExercises: dayExercises.length
      };
    });

    setProgressData(dailyProgress);

    // Calculate exercise-specific progress
    const exerciseMap = new Map<string, ExerciseProgress>();
    
    planExercises
      .filter(ex => ex.completed)
      .forEach(scheduledEx => {
        const exercise = exercises.find(e => e.id === scheduledEx.exerciseId);
        if (!exercise) return;

        if (!exerciseMap.has(scheduledEx.exerciseId)) {
          exerciseMap.set(scheduledEx.exerciseId, {
            exerciseId: scheduledEx.exerciseId,
            exerciseName: exercise.name,
            sessions: [],
            trend: 'stable'
          });
        }

        const progress = exerciseMap.get(scheduledEx.exerciseId)!;        progress.sessions.push({
          date: format(new Date(scheduledEx.date), 'yyyy-MM-dd'),
          weight: scheduledEx.weight,
          reps: scheduledEx.reps,
          sets: scheduledEx.sets,
          duration: undefined // duration not available in current interface
        });
      });

    // Calculate trends for each exercise
    const exerciseProgressArray = Array.from(exerciseMap.values()).map(progress => {
      if (progress.sessions.length < 2) {
        return { ...progress, trend: 'stable' as const };
      }

      const recent = progress.sessions.slice(-3); // Last 3 sessions
      const older = progress.sessions.slice(-6, -3); // Previous 3 sessions

      // Calculate average performance for trend analysis
      let recentAvg = 0;
      let olderAvg = 0;

      if (recent.some(s => s.weight)) {
        recentAvg = recent.filter(s => s.weight).reduce((sum, s) => sum + (s.weight || 0), 0) / recent.filter(s => s.weight).length;
        olderAvg = older.filter(s => s.weight).reduce((sum, s) => sum + (s.weight || 0), 0) / (older.filter(s => s.weight).length || 1);
      } else if (recent.some(s => s.reps)) {
        recentAvg = recent.filter(s => s.reps).reduce((sum, s) => sum + (s.reps || 0), 0) / recent.filter(s => s.reps).length;
        olderAvg = older.filter(s => s.reps).reduce((sum, s) => sum + (s.reps || 0), 0) / (older.filter(s => s.reps).length || 1);
      } else if (recent.some(s => s.duration)) {
        recentAvg = recent.filter(s => s.duration).reduce((sum, s) => sum + (s.duration || 0), 0) / recent.filter(s => s.duration).length;
        olderAvg = older.filter(s => s.duration).reduce((sum, s) => sum + (s.duration || 0), 0) / (older.filter(s => s.duration).length || 1);
      }      const change = recentAvg - olderAvg;
      const trend: 'up' | 'down' | 'stable' = Math.abs(change) < 0.05 * olderAvg ? 'stable' : (change > 0 ? 'up' : 'down');

      return { ...progress, trend };
    });

    setExerciseProgress(exerciseProgressArray);
  };

  const getMaxValue = () => {
    return Math.max(...progressData.map(d => d.completionRate), 100);
  };

  const getAverageCompletion = () => {
    const validDays = progressData.filter(d => d.totalExercises > 0);
    if (validDays.length === 0) return 0;
    return validDays.reduce((sum, d) => sum + d.completionRate, 0) / validDays.length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Progress & Trends</h3>
        <div className="flex space-x-2">
          <Select value={view} onValueChange={(value: 'completion' | 'exercises') => setView(value)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completion">Completion</SelectItem>
              <SelectItem value="exercises">Exercises</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeframe} onValueChange={(value: 'week' | 'month' | '3months') => setTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 Days</SelectItem>
              <SelectItem value="month">30 Days</SelectItem>
              <SelectItem value="3months">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {view === 'completion' ? (
        <>
          {/* Completion Rate Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Completion Rate Trend</span>
              </CardTitle>
              <CardDescription>
                Daily workout completion over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">Average: </span>
                    <span className="text-primary font-bold">{Math.round(getAverageCompletion())}%</span>
                  </div>
                  <Badge variant={getAverageCompletion() >= 80 ? "default" : "secondary"}>
                    {getAverageCompletion() >= 80 ? "Great" : getAverageCompletion() >= 60 ? "Good" : "Needs Improvement"}
                  </Badge>
                </div>

                {/* Simple Bar Chart */}
                <div className="space-y-2">
                  {progressData.filter(d => d.totalExercises > 0).slice(-14).map((day, index) => (
                    <div key={day.date} className="flex items-center space-x-2">
                      <div className="w-16 text-xs text-muted-foreground">
                        {format(new Date(day.date), 'MMM dd')}
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-2 relative">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(day.completionRate / 100) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-xs text-right">
                        {Math.round(day.completionRate)}%
                      </div>
                      <div className="w-16 text-xs text-muted-foreground text-right">
                        {day.exercisesCompleted}/{day.totalExercises}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Exercise Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Exercise Progression</span>
              </CardTitle>
              <CardDescription>
                Individual exercise performance trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exerciseProgress.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No exercise data available yet</p>
                  <p className="text-sm">Complete some workouts to see your progress!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exerciseProgress.map(progress => (
                    <Card key={progress.exerciseId} className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">{progress.exerciseName}</h4>
                            <div className="text-sm text-muted-foreground mt-1">
                              {progress.sessions.length} session{progress.sessions.length !== 1 ? 's' : ''} completed
                            </div>
                            
                            {progress.sessions.length > 0 && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Latest: {format(new Date(progress.sessions[progress.sessions.length - 1].date), 'MMM dd')}
                                {progress.sessions[progress.sessions.length - 1].weight && 
                                  ` • ${progress.sessions[progress.sessions.length - 1].weight}kg`}
                                {progress.sessions[progress.sessions.length - 1].reps && 
                                  ` • ${progress.sessions[progress.sessions.length - 1].reps} reps`}
                                {progress.sessions[progress.sessions.length - 1].duration && 
                                  ` • ${progress.sessions[progress.sessions.length - 1].duration} min`}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {progress.trend === 'up' && (
                              <Badge className="bg-green-100 text-green-800">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Improving
                              </Badge>
                            )}
                            {progress.trend === 'down' && (
                              <Badge className="bg-red-100 text-red-800">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                Declining
                              </Badge>
                            )}
                            {progress.trend === 'stable' && (
                              <Badge variant="secondary">
                                Stable
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
