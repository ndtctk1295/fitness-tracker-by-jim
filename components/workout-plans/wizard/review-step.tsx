"use client";

import { Calendar, Clock, Target, Infinity, CheckCircle, User, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useExerciseData } from "@/lib/hooks/data-hook/use-exercise-data";
import { StoreExercise } from "@/lib/types";

interface ReviewStepProps {
  data: {
    name: string;
    description: string;
    mode: 'ongoing' | 'dated';
    startDate?: Date;
    endDate?: Date;
    weeklySchedule: {
      [day: string]: Array<{
        id: string;
        exerciseId: string;
        sets?: number;
        reps?: number;
        weight?: number;
        duration?: number;
        notes?: string;
      }>;
    };
  };
}

const DAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

export function ReviewStep({ data }: ReviewStepProps) {
  const { exercises } = useExerciseData();

  const getTotalExercises = () => {
    return Object.values(data.weeklySchedule).reduce((total, dayExercises) => total + dayExercises.length, 0);
  };

  const getActiveDays = () => {
    return Object.entries(data.weeklySchedule).filter(([_, exercises]) => exercises.length > 0).length;
  };

  const getEstimatedWeeklyTime = () => {
    let totalMinutes = 0;
    Object.values(data.weeklySchedule).forEach(dayExercises => {
      dayExercises.forEach(scheduledExercise => {
        const exercise = exercises.find(ex => ex.id === scheduledExercise.exerciseId);
        if (exercise) {          if (scheduledExercise.duration) {
            totalMinutes += scheduledExercise.duration;
          } else if (scheduledExercise.sets) {
            // Rough estimate: 2 minutes per set (including rest)
            totalMinutes += scheduledExercise.sets * 2;
          }
        }
      });
    });
    return totalMinutes;
  };

  const getMuscleGroupCoverage = () => {
    const muscleGroups = new Set<string>();
    Object.values(data.weeklySchedule).forEach(dayExercises => {
      dayExercises.forEach(scheduledExercise => {
        const exercise = exercises.find(ex => ex.id === scheduledExercise.exerciseId);
        if (exercise) {          exercise.muscleGroups?.forEach(group => muscleGroups.add(group));
        }
      });
    });
    return Array.from(muscleGroups).sort();
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
      <div>
        <h3 className="text-lg font-semibold mb-2">Review Your Workout Plan</h3>
        <p className="text-muted-foreground mb-4">
          Review all the details of your workout plan before creating it.
        </p>
      </div>

      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Plan Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-lg">{data.name}</h4>
            {data.description && (
              <p className="text-muted-foreground mt-1">{data.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              {data.mode === 'ongoing' ? (
                <Infinity className="h-4 w-4 text-primary" />
              ) : (
                <Calendar className="h-4 w-4 text-primary" />
              )}
              <span className="font-medium">
                {data.mode === 'ongoing' ? 'Ongoing Plan' : 'Time-Limited Plan'}
              </span>
            </div>
            
            {data.mode === 'dated' && data.startDate && (
              <div className="text-muted-foreground">
                Starts: {format(data.startDate, 'PPP')}
                {data.endDate && ` • Ends: ${format(data.endDate, 'PPP')}`}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{getTotalExercises()}</div>
              <div className="text-sm text-muted-foreground">Total Exercises</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{getActiveDays()}</div>
              <div className="text-sm text-muted-foreground">Active Days</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatTime(getEstimatedWeeklyTime())}</div>
              <div className="text-sm text-muted-foreground">Est. Weekly Time</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{getMuscleGroupCoverage().length}</div>
              <div className="text-sm text-muted-foreground">Muscle Groups</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Muscle Group Coverage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Muscle Group Coverage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {getMuscleGroupCoverage().map(group => (
              <Badge key={group} variant="secondary">
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Weekly Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS.map(day => {
              const dayExercises = data.weeklySchedule[day.key] || [];
              
              return (
                <div key={day.key} className="flex">
                  <div className="w-24 flex-shrink-0">
                    <div className="font-medium text-sm">{day.short}</div>
                  </div>
                  <div className="flex-1">
                    {dayExercises.length === 0 ? (
                      <div className="text-muted-foreground text-sm">Rest day</div>
                    ) : (
                      <div className="space-y-1">
                        {dayExercises.map(scheduledExercise => {
                          const exercise = exercises.find(ex => ex.id === scheduledExercise.exerciseId);
                          if (!exercise) return null;
                          
                          return (
                            <div key={scheduledExercise.id} className="flex items-center space-x-2 text-sm">
                              <span className="font-medium">{exercise.name}</span>
                              <div className="flex items-center space-x-1 text-muted-foreground">
                                {scheduledExercise.sets && (
                                  <span>{scheduledExercise.sets} sets</span>
                                )}
                                {scheduledExercise.reps && (
                                  <span>× {scheduledExercise.reps}</span>
                                )}
                                {scheduledExercise.weight && (
                                  <span>@ {scheduledExercise.weight}kg</span>
                                )}
                                {scheduledExercise.duration && (
                                  <span>{scheduledExercise.duration}min</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ready to Create */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-primary" />
            <div>
              <h4 className="font-medium">Ready to Create Your Plan</h4>
              <p className="text-sm text-muted-foreground">
                Click "Create Plan" to save your workout plan and start using it.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
