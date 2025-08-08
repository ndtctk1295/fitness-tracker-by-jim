'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Activity, Calendar, CheckCircle, Dumbbell, LineChart, Settings, Timer, Weight } from 'lucide-react';
import { navigateTo as navigationUtil } from '@/lib/utils/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TimerSummary } from '@/components/timer-summary';
import { useExerciseData } from '@/lib/hooks/data-hook/use-exercise-data';
import { useScheduledExerciseData } from '@/lib/hooks/data-hook/use-scheduled-exercise-data';
import { useScheduledExercises } from '@/lib/utils/queries/scheduled-exercises-queries';
import { useTimerStore } from '@/lib/stores/timer-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  // Get store data using the new pattern with enhanced selectors
  const { exercises, categories } = useExerciseData();
  const { exercises: scheduledExercises, selectors } = useScheduledExerciseData();
  
  // Get all scheduled exercises for statistics (using React Query directly)
  const { data: allScheduledExercises } = useScheduledExercises();
  
  const { timerStrategies, activeTimer } = useTimerStore();
  
  // Current date and week
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday as start of week
  
  // Use optimized selectors instead of manual filtering
  const todaysScheduledExercises = selectors.today;
  
  // Today's exercises are already filtered by the selector
  const todaysExercises = todaysScheduledExercises;
  
  // Use enhanced stats from selectors
  const totalExercises = exercises.length;
  const completedWorkouts = [...new Set((allScheduledExercises || []).map((ex: any) => ex.date))].length;
  const totalCategories = categories.length;
  const todayStats = selectors.stats.todayStats;
  const weekStats = selectors.stats.weekStats;
  
  // Navigation handler using the utility but with the same name to minimize changes
  const navigateTo = (path: string) => {
    navigationUtil(router, path);
  };
  
  // Create week day headers with optimized data access
  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(currentWeekStart, index);
    const isToday = isSameDay(date, today);
    const exercisesForDay = selectors.byDate(date);
    
    return {
      date,
      day: format(date, 'EEE'),
      dayOfMonth: format(date, 'd'),
      isToday,
      hasExercises: exercisesForDay.length > 0,
      exerciseCount: exercisesForDay.length,
      completedCount: exercisesForDay.filter(ex => ex.completed).length,
    };
  });
  
  // Get user initials for avatar
  const getUserInitials = () => {
    const name = session?.user?.name || '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || 'User'}!
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigateTo('/calendar')}>
            <Calendar className="mr-2 h-4 w-4" />
            Calendar View
          </Button>
          <Avatar className="cursor-pointer" onClick={() => navigateTo('/profile')}>
            <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Exercises
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExercises}</div>
            <p className="text-xs text-muted-foreground">
              exercises in your collection
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Workouts
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedWorkouts}</div>
            <p className="text-xs text-muted-foreground">
              workout days completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Categories
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              exercise categories
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Exercises
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats.completed} completed, {todayStats.pending} pending ({todayStats.completionRate.toFixed(0)}%)
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Weekly overview */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Weekly Overview</CardTitle>
          <CardDescription>
            Your scheduled workouts for this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <div 
                key={day.day} 
                className={`flex flex-col items-center p-2 rounded-lg border ${
                  day.isToday ? 'bg-primary/10 border-primary' : ''
                } ${
                  day.hasExercises ? 'border-primary/30' : ''
                }`}
              >
                <span className="text-sm font-medium">{day.day}</span>
                <span className={`text-lg font-bold ${
                  day.isToday ? 'text-primary' : ''
                }`}>{day.dayOfMonth}</span>
                {day.hasExercises && (
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Quick access */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Timer card */}
        <Card className="cursor-pointer hover:bg-muted/10 transition-colors" 
              onClick={() => navigateTo('/timer')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Timer</CardTitle>
              <Timer className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Start a workout timer session
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeTimer.isActive ? (
              <TimerSummary />
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-center text-muted-foreground mb-4">
                  Start a timer for your workout
                </p>
                <Button onClick={(e) => {
                  e.stopPropagation();
                  navigateTo('/timer');
                }}>Start Timer</Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Exercises card */}
        <Card className="cursor-pointer hover:bg-muted/10 transition-colors" 
              onClick={() => navigateTo('/exercises')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Exercises</CardTitle>
              <Dumbbell className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Manage your exercise library
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.slice(0, 3).map(category => (
                <div key={category.id} className="flex items-center">
                  <div className="h-3 w-3 rounded-full mr-2" 
                       style={{ backgroundColor: category.color }} />
                  <span>{category.name}</span>
                </div>
              ))}
              {categories.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  +{categories.length - 3} more categories
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Weights card */}
        <Card className="cursor-pointer hover:bg-muted/10 transition-colors" 
              onClick={() => navigateTo('/weights')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Weight Tracking</CardTitle>
              <Weight className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Track weights for your exercises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-24">
              <LineChart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
