"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, Calendar, Target, Clock, Award, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { WorkoutPlan } from "@/lib/services/clients-service/workout-plan-service";
import { useScheduledExercises } from "@/lib/queries";

interface PlanStatisticsProps {
  workoutPlan: WorkoutPlan;
}

interface WorkoutStats {
  totalWorkouts: number;
  completedWorkouts: number;
  totalExercises: number;
  completedExercises: number;
  weeklyCompletionRate: number;
  streakDays: number;
  totalTimeSpent: number; // in minutes
}

export function PlanStatistics({ workoutPlan }: PlanStatisticsProps) {
  const { data: scheduledExercisesData } = useScheduledExercises();
  const scheduledExercises = scheduledExercisesData || [];
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const [stats, setStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    completedWorkouts: 0,
    totalExercises: 0,
    completedExercises: 0,
    weeklyCompletionRate: 0,
    streakDays: 0,
    totalTimeSpent: 0
  });

  const calculateStats = useCallback(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'week':
        startDate = startOfWeek(now);
        break;
      case 'month':
        startDate = subDays(now, 30);
        break;
      case 'all':
        startDate = workoutPlan.startDate ? new Date(workoutPlan.startDate) : subDays(now, 365);
        break;
    }    // Filter scheduled exercises for this plan and timeframe
    const planExercises = scheduledExercises.filter(ex => 
      ex.workoutPlanId === workoutPlan.id &&
      new Date(ex.date) >= startDate &&
      new Date(ex.date) <= now
    );

    const totalExercises = planExercises.length;
    const completedExercises = planExercises.filter(ex => ex.completed).length;
    
    // Calculate daily workout completion
    const dayRange = eachDayOfInterval({ start: startDate, end: now });
    const workoutDays = dayRange.map(date => {
      const dayExercises = planExercises.filter(ex => 
        isSameDay(new Date(ex.date), date)
      );
      const completedOnDay = dayExercises.filter(ex => ex.completed).length;
      return {
        date,
        total: dayExercises.length,
        completed: completedOnDay,
        completionRate: dayExercises.length > 0 ? (completedOnDay / dayExercises.length) * 100 : 0
      };
    });

    const totalWorkouts = workoutDays.filter(day => day.total > 0).length;
    const completedWorkouts = workoutDays.filter(day => day.completionRate >= 100).length;
    
    // Calculate weekly completion rate
    const weeklyCompletionRate = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
    
    // Calculate streak (consecutive days with completed workouts)
    let streakDays = 0;
    for (let i = workoutDays.length - 1; i >= 0; i--) {
      const day = workoutDays[i];
      if (day.total > 0 && day.completionRate >= 100) {
        streakDays++;
      } else if (day.total > 0) {
        break; // Streak broken
      }
      // Skip rest days
    }

    // Estimate total time spent (rough calculation)
    const totalTimeSpent = completedExercises * 15; // Assume 15 minutes per exercise on average

    setStats({
      totalWorkouts,
      completedWorkouts,
      totalExercises,
      completedExercises,
      weeklyCompletionRate,
      streakDays,
      totalTimeSpent
    });
  }, [workoutPlan, scheduledExercisesData, timeframe]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Plan Statistics</h3>
        <Select value={timeframe} onValueChange={(value: 'week' | 'month' | 'all') => setTimeframe(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.completedWorkouts}</div>
              <div className="text-sm text-muted-foreground">Completed Workouts</div>
              <div className="text-xs text-muted-foreground mt-1">
                of {stats.totalWorkouts} planned
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.completedExercises}</div>
              <div className="text-sm text-muted-foreground">Exercises Done</div>
              <div className="text-xs text-muted-foreground mt-1">
                of {stats.totalExercises} scheduled
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.streakDays}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
              <div className="text-xs text-muted-foreground mt-1">
                consecutive days
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatTime(stats.totalTimeSpent)}</div>
              <div className="text-sm text-muted-foreground">Time Spent</div>
              <div className="text-xs text-muted-foreground mt-1">
                estimated
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Completion Rate</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className={`text-sm font-bold ${getCompletionColor(stats.weeklyCompletionRate)}`}>
                {Math.round(stats.weeklyCompletionRate)}%
              </span>
            </div>
            <Progress value={stats.weeklyCompletionRate} className="h-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Workout Completion:</span>
              <Badge variant={stats.totalWorkouts > 0 && stats.completedWorkouts === stats.totalWorkouts ? "default" : "secondary"}>
                {stats.totalWorkouts > 0 ? Math.round((stats.completedWorkouts / stats.totalWorkouts) * 100) : 0}%
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Exercise Completion:</span>
              <Badge variant={stats.totalExercises > 0 && stats.completedExercises === stats.totalExercises ? "default" : "secondary"}>
                {stats.totalExercises > 0 ? Math.round((stats.completedExercises / stats.totalExercises) * 100) : 0}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.streakDays >= 7 && (
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                  <Award className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-yellow-800">Week Warrior</div>
                  <div className="text-sm text-yellow-600">7+ day streak</div>
                </div>
              </div>
            )}

            {stats.completedExercises >= 50 && (
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-blue-800">Exercise Master</div>
                  <div className="text-sm text-blue-600">50+ exercises completed</div>
                </div>
              </div>
            )}

            {stats.weeklyCompletionRate >= 90 && (
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-green-800">Consistency Champion</div>
                  <div className="text-sm text-green-600">90%+ completion rate</div>
                </div>
              </div>
            )}

            {stats.totalTimeSpent >= 600 && ( // 10 hours
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-purple-800">Time Dedication</div>
                  <div className="text-sm text-purple-600">10+ hours of workouts</div>
                </div>
              </div>
            )}
          </div>

          {stats.streakDays < 7 && stats.completedExercises < 50 && stats.weeklyCompletionRate < 90 && stats.totalTimeSpent < 600 && (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm">Keep working out to unlock achievements!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
