'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { useWorkoutPlanStore } from '@/lib/stores/workout-plan-store';
import { useApiToast } from '@/lib/hooks/use-api-toast';
import { WorkoutPlan } from '@/lib/services/workout-plan-service';
import { BasicInfoStep } from '@/components/workout-plans/wizard/basic-info-step';
import { ModeAndDatesStep } from '@/components/workout-plans/wizard/mode-and-dates-step';
import { WeeklyTemplateStep } from '@/components/workout-plans/wizard/weekly-template-step';

export default function EditWorkoutPlanPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params?.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);  const [editData, setEditData] = useState<{
    name: string;
    description: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    mode: 'ongoing' | 'dated';
    startDate?: Date;
    endDate?: Date;
    weeklySchedule: Record<string, any[]>;
  }>({
    name: '',
    description: '',
    level: 'beginner',
    mode: 'ongoing',
    startDate: undefined,
    endDate: undefined,
    weeklySchedule: {}
  });
  
  const { loadPlanById, updatePlan } = useWorkoutPlanStore();
  const { showSuccessToast, showErrorToast } = useApiToast();
  // Load plan data once - this prevents infinite loops
  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) return;
      
      try {
        setIsLoading(true);
        const plan = await loadPlanById(planId);
        
        if (plan) {
          // Transform weeklyTemplate to weeklySchedule format for wizard components
          const weeklySchedule: Record<string, any[]> = {};
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          
          plan.weeklyTemplate.forEach(dayTemplate => {
            const dayName = dayNames[dayTemplate.dayOfWeek];
            weeklySchedule[dayName] = dayTemplate.exerciseTemplates.map(et => ({
              id: `${et.exerciseId}_${Math.random().toString(36).substring(2, 9)}`, // Generate temp ID
              exerciseId: et.exerciseId,
              sets: et.sets,
              reps: et.reps,
              weight: et.weight,
              duration: et.duration,
              notes: et.notes
            }));
          });
          
          setEditData({
            name: plan.name,
            description: plan.description || '',
            level: plan.level,
            mode: plan.mode,
            startDate: plan.startDate ? new Date(plan.startDate) : undefined,
            endDate: plan.endDate ? new Date(plan.endDate) : undefined,
            weeklySchedule
          });
        }
      } catch (error) {
        showErrorToast('Failed to load workout plan', 'Plan may not exist or you may not have access');
        router.push('/workout-plans');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [planId, loadPlanById]); // Only include planId and stable store function

  const handleCancel = () => {
    router.push(`/workout-plans/${planId}`);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Map the weeklySchedule back to weeklyTemplate format
      const dayMap: { [key: string]: 0 | 1 | 2 | 3 | 4 | 5 | 6 } = {
        'sunday': 0,
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'saturday': 6
      };
      
      // Create a user-populated map of days from wizard data
      const userDayMap = Object.entries(editData.weeklySchedule).reduce((acc, [dayKey, exercises]) => {
        acc[dayMap[dayKey]] = (exercises as any[]).map((ex, index) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets || 0,
          reps: ex.reps || 0,
          weight: ex.weight || 0,
          duration: ex.duration || 0,
          notes: ex.notes || '',
          orderIndex: index
        }));
        return acc;
      }, {} as Record<number, any[]>);
      
      // Create a complete 7-day template, using empty exercise arrays for days not specified by user
      const weeklyTemplate = Array.from({ length: 7 }, (_, dayIndex) => ({
        dayOfWeek: dayIndex as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        exerciseTemplates: userDayMap[dayIndex] || []
      }));
      
      const updatePayload = {
        name: editData.name,
        description: editData.description,
        level: editData.level,
        mode: editData.mode,
        startDate: editData.startDate,
        endDate: editData.endDate,
        weeklyTemplate
      } as Partial<WorkoutPlan>;
      
      await updatePlan(planId, updatePayload);
      showSuccessToast('Workout plan updated successfully!');
      router.push(`/workout-plans/${planId}`);
    } catch (error) {
      showErrorToast('Failed to update workout plan', 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded w-1/3"></div>
          </div>
          <div className="h-48 bg-muted rounded"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Edit Workout Plan</h1>
        </div>
        
        <Button 
          onClick={handleSave}
          disabled={isSubmitting}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Edit Form */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <BasicInfoStep
              data={editData}
              onDataChange={(updates) => setEditData(prev => ({ ...prev, ...updates }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ModeAndDatesStep
              data={editData}
              onDataChange={(updates) => setEditData(prev => ({ ...prev, ...updates }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyTemplateStep
              data={editData}
              onDataChange={(updates) => setEditData(prev => ({ ...prev, ...updates }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
