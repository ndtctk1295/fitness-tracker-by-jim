'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, Target, Users, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WorkoutPlanCard } from '@/components/workout-plans/workout-plan-card';
import { WorkoutPlanWizard } from '@/components/workout-plans/workout-plan-wizard';
import { useWorkoutPlanData } from '@/lib/hooks/data-hook/use-workout-plan-data';
import { useApiToast } from '@/lib/hooks/use-api-toast';

export default function WorkoutPlansPage() {
  const [showWizard, setShowWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { 
    workoutPlans, 
    activePlan,
    isLoading: storeLoading,
    error,
    initialized,
    loadAllPlans
  } = useWorkoutPlanData();
  
  const { showSuccessToast, showErrorToast } = useApiToast();
  
  // Update local loading state based on store initialization
  useEffect(() => {
    if (!storeLoading && initialized) {
      setIsLoading(false);
    }
  }, [storeLoading, initialized]);  const handleWizardComplete = async () => {
    setShowWizard(false);
    showSuccessToast('Workout plan created successfully!');

    // Refresh the plans list
    try {
      // Refresh data using the loadAllPlans method
      await loadAllPlans();
    } catch (error) {
      showErrorToast('Failed to refresh workout plans', 'Please refresh the page');
    }
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
  };

  if (isLoading || storeLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeWorkoutPlans = workoutPlans.filter(plan => plan.isActive);
  const inactiveWorkoutPlans = workoutPlans.filter(plan => !plan.isActive);

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workout Plans</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your personalized workout routines
          </p>
        </div>
        <Button onClick={() => setShowWizard(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Plan
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Active Plan Section */}
      {activePlan && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>Active Plan</CardTitle>
              <Badge variant="secondary">Currently Active</Badge>
            </div>
            <CardDescription>
              Your currently active workout plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkoutPlanCard 
              plan={activePlan} 
              isActive={true}
              showActions={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Active Plans Section */}
      {/* {activeWorkoutPlans.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Active Plans</h2>
            <Badge variant="default">{activeWorkoutPlans.length}</Badge>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeWorkoutPlans.map((plan) => (
              <WorkoutPlanCard 
                key={plan.id} 
                plan={plan} 
                isActive={true}
                showActions={true}
              />
            ))}
          </div>
        </div>
      )} */}

      {/* Inactive Plans Section */}
      {inactiveWorkoutPlans.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Inactive Plans</h2>
            <Badge variant="outline">{inactiveWorkoutPlans.length}</Badge>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {inactiveWorkoutPlans.map((plan) => (
              <WorkoutPlanCard 
                key={plan.id} 
                plan={plan} 
                isActive={false}
                showActions={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {workoutPlans.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-muted p-6">
                <Calendar className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No workout plans yet</h3>
                <p className="text-muted-foreground">
                  Create your first workout plan to get started
                </p>
              </div>
              <Button onClick={() => setShowWizard(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {workoutPlans.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{workoutPlans.length}</div>
                  <div className="text-sm text-muted-foreground">Total Plans</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{activeWorkoutPlans.length}</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{inactiveWorkoutPlans.length}</div>
                  <div className="text-sm text-muted-foreground">Inactive</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-2xl font-bold">
                    {activePlan ? '1' : '0'}
                  </div>
                  <div className="text-sm text-muted-foreground">Currently Active</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Workout Plan Creation Wizard */}
      {showWizard && (
        <WorkoutPlanWizard
          open={showWizard}
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      )}
    </div>
  );
}
