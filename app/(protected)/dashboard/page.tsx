'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Activity, Calendar, CheckCircle, Dumbbell, LineChart, Settings, Timer, Weight, Heart, Clock } from 'lucide-react';
import { navigateTo, redirectTo } from '@/lib/utils/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TimerSummary } from '@/components/timer-summary';
import { useExerciseStore } from '@/lib/stores/exercise-store';
import { useUserExercisePreferenceStore } from '@/lib/stores/user-exercise-preference-store';
import { useScheduledExerciseStore } from '@/lib/stores/scheduled-exercise-store';
import { useTimerStore } from '@/lib/stores/timer-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
    const { status } = useSession();
  const { exercises, isLoading: exercisesLoading } = useExerciseStore();
  const { 
    preferences, 
    isLoading: preferencesLoading 
  } = useUserExercisePreferenceStore();
  const { scheduledExercises } = useScheduledExerciseStore();
  const { timerStrategies, activeTimer } = useTimerStore();
  
  // Current date and week
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday as start of week
    // Get scheduled exercises for today
  const todaysExercises = scheduledExercises.filter(
    (exercise: any) => exercise.date === format(today, 'yyyy-MM-dd')
  );
  
  // Extract preference data
  const favoriteExercises = preferences.filter(p => p.status === 'favorite');
  const recentExercises = preferences
    .filter(p => p.lastUsed)
    .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime())
    .slice(0, 10);
  // Removed current exercises as only 'favorite' status is supported now
  
    // Calculate statistics
  const totalExercises = exercises.length;
  const totalFavorites = favoriteExercises.length;
  const totalRecent = recentExercises.length;
  const completedWorkouts = [...new Set(scheduledExercises.map((ex: any) => ex.date))].length;

  // Get unique categories from exercises
  const categories = Array.from(new Set(exercises.map(ex => ex.categoryId)))
    .map(categoryId => ({ id: categoryId, name: categoryId, color: '#3b82f6' }));
  const totalCategories = categories.length;
    // Navigation handlers have been replaced by importing navigation utility functions
  
  // Create week day headers
  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(currentWeekStart, index);
    const isToday = isSameDay(date, today);
      const exercisesForDay = scheduledExercises.filter(
      (exercise: any) => exercise.date === format(date, 'yyyy-MM-dd')
    );
    
    return {
      date,
      day: format(date, 'EEE'),
      dayOfMonth: format(date, 'd'),
      isToday,
      hasExercises: exercisesForDay.length > 0,
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
  
  // Helper functions instead of local navigateTo function
  const handleNavigation = (path: string) => {
    navigateTo(router, path);
  };
    return (
    <div className="py-6 space-y-6">
      {(exercisesLoading || preferencesLoading) && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || 'User'}!
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => handleNavigation('/calendar')}>
            <Calendar className="mr-2 h-4 w-4" />
            Calendar View
          </Button>
          <Avatar className="cursor-pointer" onClick={() => handleNavigation('/profile')}>
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
              Favorite Exercises
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFavorites}</div>
            <p className="text-xs text-muted-foreground">
              exercises marked as favorites
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
          </div>        </CardContent>
      </Card>
      
      {/* User Exercise Preferences */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Favorite Exercises */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Favorite Exercises</CardTitle>
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <CardDescription>
              Your most loved exercises
            </CardDescription>
          </CardHeader>
          <CardContent>
            {preferencesLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse" />
              </div>            ) : favoriteExercises.length > 0 ? (              <div className="space-y-2">
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
                No favorite exercises yet. Start favoriting exercises you enjoy!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Exercises */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recently Used</CardTitle>
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <CardDescription>
              Your recently performed exercises
            </CardDescription>
          </CardHeader>
          <CardContent>
            {preferencesLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse" />
              </div>            ) : recentExercises.length > 0 ? (              <div className="space-y-2">
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
                No recent exercises. Start using exercises to see them here!
              </p>
            )}
          </CardContent>
        </Card>        {/* Recent Exercises */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Exercises</CardTitle>
              <Activity className="h-5 w-5 text-blue-500" />
            </div><CardDescription>
              Your most recently used exercises
            </CardDescription>
          </CardHeader>
          <CardContent>
            {preferencesLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse" />
              </div>
            ) : recentExercises.length > 0 ? (
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
          <CardContent>            <div className="space-y-3">
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
