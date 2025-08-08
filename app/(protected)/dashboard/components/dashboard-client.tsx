'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Activity, Calendar, CheckCircle, Dumbbell, LineChart, Timer, Weight, Heart, Clock } from 'lucide-react';
import { navigateTo } from '@/lib/utils/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TimerSummary } from '@/components/timer-summary';
import { useUserExercisePreferenceData } from '@/lib/hooks/data-hook/use-user-exercise-preference-data';

import { useTimerStore } from '@/lib/stores/timer-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import { useExerciseData } from '@/lib/hooks/data-hook/use-exercise-data';
import { useScheduledExerciseData } from '@/lib/hooks/data-hook/use-scheduled-exercise-data';
interface DashboardClientProps {
  session: Session;
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const router = useRouter();
  // const { data: sessionData } = useSession();

  console.log('[DashboardClient] Component rendering with session:', {
    userEmail: session?.user?.email,
    userId: session?.user?.id
  });
  
  const { exercises, categories, isLoading: exercisesLoading } = useExerciseData();
  const { 
    preferences, 
    isLoading: preferencesLoading,
    selectors
  } = useUserExercisePreferenceData();
  const { exercises: scheduledExercises } = useScheduledExerciseData();
  const { activeTimer } = useTimerStore();
  
  // Current date and week
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday as start of week
  
  // Get scheduled exercises for today
  const todaysExercises = scheduledExercises.filter(
    (exercise: any) => exercise.date === format(today, 'yyyy-MM-dd')
  );
  
  // Extract preference data using enhanced selectors
  const favoriteExercises = selectors.favoriteExercises;
  const recentExercises = selectors.recentlyUsed;
  
  // Get exercises scheduled for each day of the week
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(currentWeekStart, index);
    const isToday = isSameDay(date, today);
    const dailyExercises = scheduledExercises.filter(
      (exercise: any) => exercise.date === format(date, 'yyyy-MM-dd')
    );
    
    return {
      day: format(date, 'EEE'),
      dayOfMonth: format(date, 'd'),
      exerciseCount: dailyExercises.length,
      isToday,
    };
  });
  
  // Get user initials for avatar
  const name = session?.user?.name || '';
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();
  
  // Handle navigation with debugging
  const handleNavigation = (path: string) => {
    console.log('[DashboardClient] Navigating to:', path);
    navigateTo(router, path);
  };
  
  // Calculate statistics
  const totalFavorites = favoriteExercises.length;
  const totalRecent = recentExercises.length;
  
  // Show loading state if stores are still loading
  if (exercisesLoading || preferencesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {session?.user?.name ? `Welcome back, ${session.user.name.split(' ')[0]}!` : 'Welcome to your dashboard!'}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your fitness journey today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Exercises
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exercises.length}</div>
            <p className="text-xs text-muted-foreground">
              available exercises
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Favorite Exercises
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFavorites}</div>
            <p className="text-xs text-muted-foreground">
              exercises you've favorited
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Exercises
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecent}</div>
            <p className="text-xs text-muted-foreground">
              recently used exercises
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
            <div className="text-2xl font-bold">{todaysExercises.length}</div>
            <p className="text-xs text-muted-foreground">
              exercises scheduled for today
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 overflow-x-auto">
            {weekDays.map((day) => (
              <div 
                key={day.day} 
                className={`flex flex-col items-center p-2 rounded-lg border ${
                  day.isToday ? 'bg-primary/10 border-primary' : ''
                } ${
                  day.exerciseCount > 0 ? 'bg-green-50 border-green-200' : ''
                }`}
              >
                <div className="font-medium text-sm text-muted-foreground">{day.day}</div>
                <div className="text-xs text-muted-foreground">{day.dayOfMonth}</div>
                <div className="mt-1 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-xs">{day.exerciseCount}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Secondary row with side-by-side cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Today's Scheduled Exercises */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
              <Calendar className="h-5 w-5 text-green-500" />
            </div>
            <CardDescription>
              Exercises you've scheduled for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaysExercises.length > 0 ? (
              <div className="space-y-2">
                {todaysExercises.slice(0, 3).map((scheduledExercise: any) => {
                  const exercise = exercises.find((ex: any) => ex.id === scheduledExercise.exerciseId);
                  return exercise ? (
                    <div key={scheduledExercise.id} className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm truncate">{exercise.name}</span>
                    </div>
                  ) : null;
                })}
                {todaysExercises.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{todaysExercises.length - 3} more scheduled
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No exercises scheduled for today. 
                <br />
                <Button 
                  variant="link" 
                  className="h-4 p-0 text-sm" 
                  onClick={() => handleNavigation('/calendar')}
                >
                  Schedule some workouts →
                </Button>
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Favorite Exercises */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Favorite Exercises</CardTitle>
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <CardDescription>
              Exercises you've marked as favorites
            </CardDescription>
          </CardHeader>
          <CardContent>
            {favoriteExercises.length > 0 ? (
              <div className="space-y-2">
                {favoriteExercises.slice(0, 3).map((preference: any) => {
                  const exercise = preference.exercise || exercises.find((ex: any) => ex.id === preference.exerciseId);
                  return exercise ? (
                    <div key={preference.id} className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-sm truncate">{exercise.name}</span>
                    </div>
                  ) : null;
                })}
                {favoriteExercises.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{favoriteExercises.length - 3} more favorites
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No favorite exercises yet. 
                <br />
                <Button 
                  variant="link" 
                  className="h-4 p-0 text-sm" 
                  onClick={() => handleNavigation('/exercises')}
                >
                  Explore exercises →
                </Button>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Third row - Recent exercises (full width) */}
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Exercises</CardTitle>
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
            <CardDescription>
              Your most recently used exercises
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentExercises.length > 0 ? (
              <div className="space-y-2">
                {recentExercises.slice(0, 3).map((preference: any) => {
                  const exercise = preference.exercise || exercises.find((ex: any) => ex.id === preference.exerciseId);
                  return exercise ? (
                    <div key={preference.id} className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-sm truncate">{exercise.name}</span>
                    </div>
                  ) : null;
                })}
                {recentExercises.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{recentExercises.length - 3} more recent
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent exercises. Start exercising to see them here!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Quick access */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Timer card */}
        <Card className="cursor-pointer hover:bg-muted/10 transition-colors" 
              onClick={() => handleNavigation('/timer')}>
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
                  handleNavigation('/timer');
                }}>Start Timer</Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Exercises card */}
        <Card className="cursor-pointer hover:bg-muted/10 transition-colors" 
              onClick={() => handleNavigation('/exercises')}>
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
              {categories.slice(0, 3).map((category: any) => (
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
              onClick={() => handleNavigation('/weights')}>
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