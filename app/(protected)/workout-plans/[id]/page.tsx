'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Play, 
  Pause, 
  Trash2, 
  Copy, 
  Calendar, 
  Target,
  Activity,
  BarChart3,
  Settings,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WeeklyScheduleGrid } from '@/components/workout-plans/weekly-schedule-grid';
import { PlanStatistics } from '@/components/workout-plans/plan-statistics';
import { ProgressionGraph } from '@/components/workout-plans/progression-graph';
import { PlanControls } from '@/components/workout-plans/plan-controls';
import { useWorkoutPlanStore } from '@/lib/stores/workout-plan-store';
import { useApiToast } from '@/lib/hooks/use-api-toast';
import { format } from 'date-fns';

export default function WorkoutPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params?.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);
    const { 
    workoutPlans,
    activePlan,
    loadPlanById,
    activatePlan,
    deactivatePlan,
    deletePlan,
    duplicatePlan,
    isLoading: storeLoading,
    error 
  } = useWorkoutPlanStore();
  
  const { showSuccessToast, showErrorToast } = useApiToast();
  useEffect(() => {
    const loadPlan = async () => {
      if (!planId) return;
      
      try {
        setIsLoading(true);
        const planData = await loadPlanById(planId);
        setPlan(planData);
      } catch (error) {
        showErrorToast('Failed to load workout plan', 'Plan may not exist or you may not have access');
        // router.push('/workout-plans');
      } finally {
        setIsLoading(false);
      }
    };    loadPlan();
  }, [planId, loadPlanById]); // Only include planId and stable store function
  
  const handleActivate = async () => {
    try {
      await activatePlan(planId);
      showSuccessToast('Workout plan activated! Exercises have been automatically scheduled on your calendar.');
      // Refresh plan data
      const updatedPlan = await loadPlanById(planId);
      setPlan(updatedPlan);
    } catch (error) {
      showErrorToast('Failed to activate workout plan', 'Please try again');
    }
  };
  const handleDeactivate = async () => {
    try {
      await deactivatePlan(planId);
      showSuccessToast('Workout plan deactivated successfully!');
      // Refresh plan data
      const updatedPlan = await loadPlanById(planId);
      setPlan(updatedPlan);
    } catch (error) {
      showErrorToast('Failed to deactivate workout plan', 'Please try again');
    }
  };  const handleDuplicate = async () => {
    try {
      const newPlan = await duplicatePlan(planId);
      if (newPlan) {
        showSuccessToast('Workout plan duplicated successfully!');
        router.push(`/workout-plans/${newPlan.id}`);
      }
    } catch (error) {
      showErrorToast('Failed to duplicate workout plan', 'Please try again');
    }
  };
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this workout plan? This action cannot be undone.')) {
      try {
        await deletePlan(planId);
        showSuccessToast('Workout plan deleted successfully!');
        router.push('/workout-plans');
      } catch (error) {
        showErrorToast('Failed to delete workout plan', 'Please try again');
      }
    }
  };

  const handleEdit = () => {
    router.push(`/workout-plans/${planId}/edit`);
  };

  if (isLoading || storeLoading) {
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

  if (!plan) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Workout plan not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isActive = plan.isActive;
  const isCurrentlyActive = activePlan?.id === plan.id;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{plan.name}</h1>
              {isCurrentlyActive && (
                <Badge variant="default" className="gap-1">
                  <Activity className="h-3 w-3" />
                  Currently Active
                </Badge>
              )}
              {isActive && !isCurrentlyActive && (
                <Badge variant="secondary">Active</Badge>
              )}
            </div>
            {plan.description && (
              <p className="text-muted-foreground mt-1">{plan.description}</p>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="h-4 w-4" />
          </Button>
          {isActive ? (
            <Button variant="outline" size="sm" onClick={handleDeactivate}>
              <Pause className="h-4 w-4" />
              Deactivate
            </Button>
          ) : (
            <Button size="sm" onClick={handleActivate}>
              <Play className="h-4 w-4" />
              Activate
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Plan Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Type</div>
                <div className="font-medium capitalize">{plan.mode || 'Ongoing'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="font-medium">
                  {plan.createdAt ? format(new Date(plan.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="font-medium">{isActive ? 'Active' : 'Inactive'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Exercises</div>
                <div className="font-medium">
                  {plan.weeklyTemplate ? 
                    plan.weeklyTemplate.reduce((total: number, day: any) => 
                      total + (day.exerciseTemplates?.length || 0), 0
                    ) : 0
                  } per week
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule" className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="statistics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="progression" className="gap-2">
            <Target className="h-4 w-4" />
            Progression
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>
                Your workout schedule for each day of the week
              </CardDescription>
            </CardHeader>            <CardContent>
              <WeeklyScheduleGrid 
                workoutPlan={plan}
                onUpdatePlan={(updates) => setPlan({...plan, ...updates})}
                readOnly={true}
              />
            </CardContent>
          </Card>
        </TabsContent>        <TabsContent value="statistics" className="space-y-4">
          <PlanStatistics workoutPlan={plan} />
        </TabsContent>

        <TabsContent value="progression" className="space-y-4">
          <ProgressionGraph workoutPlan={plan} />
        </TabsContent>        <TabsContent value="settings" className="space-y-4">
          <PlanControls 
            workoutPlan={plan} 
            onPlanUpdated={(updatedPlan: any) => setPlan(updatedPlan)}
            onPlanDeleted={() => router.push('/workout-plans')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
