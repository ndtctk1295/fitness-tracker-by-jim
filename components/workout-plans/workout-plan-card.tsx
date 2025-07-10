'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  Pause, 
  Edit, 
  Copy, 
  Trash2, 
  Calendar, 
  Target, 
  Activity,
  Clock,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { PlanActivationConfirmDialog } from '@/components/workout-plans/plan-activation-confirm-dialog';
import { useWorkoutPlanStore } from '@/lib/stores/workout-plan-store';
import { useApiToast } from '@/lib/hooks/use-api-toast';
import { format } from 'date-fns';

interface WorkoutPlanCardProps {
  plan: any;
  isActive: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export function WorkoutPlanCard({ 
  plan, 
  isActive, 
  showActions = true, 
  compact = false 
}: WorkoutPlanCardProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activationConfirmOpen, setActivationConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  const { 
    activatePlan,
    deactivatePlan,
    deletePlan,
    duplicatePlan,
    loadAllPlans,
    loadActivePlan,
    activePlan,
    workoutPlans
  } = useWorkoutPlanStore();
  
  const { showSuccessToast, showErrorToast } = useApiToast();

  const handleView = () => {
    router.push(`/workout-plans/${plan.id}`);
  };

  const handleEdit = () => {
    router.push(`/workout-plans/${plan.id}/edit`);
  };  
  const handleActivate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if there's already an active plan
    if (activePlan && activePlan.id !== plan.id) {
      setActivationConfirmOpen(true);
      return;
    }
    
    // If no active plan or this is the active plan, proceed with activation
    await performActivation();
  };

  const performActivation = async () => {
    setIsLoading(true);
    try {
      await activatePlan(plan.id);
      showSuccessToast('Workout plan activated! Exercises have been automatically scheduled on your calendar.');
      // Refresh data
      await Promise.all([loadAllPlans(), loadActivePlan()]);
    } catch (error) {
      showErrorToast('Failed to activate workout plan', 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmActivation = async () => {
    setActivationConfirmOpen(false);
    await performActivation();
  };
  const handleDeactivate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      await deactivatePlan(plan.id);
      showSuccessToast('Workout plan deactivated successfully!');
      // Refresh data
      await Promise.all([loadAllPlans(), loadActivePlan()]);
    } catch (error) {
      showErrorToast('Failed to deactivate workout plan', 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };
  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {      const newPlan = await duplicatePlan(plan.id);
      if (newPlan) {
        showSuccessToast('Workout plan duplicated successfully!');
        await loadAllPlans();
        router.push(`/workout-plans/${newPlan.id}`);
      }
    } catch (error) {
      showErrorToast('Failed to duplicate workout plan', 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await deletePlan(plan.id);
      showSuccessToast('Workout plan deleted successfully!');
      await Promise.all([loadAllPlans(), loadActivePlan()]);
    } catch (error) {
      showErrorToast('Failed to delete workout plan', 'Please try again');
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // Calculate exercise count
  const exerciseCount = plan.weeklyTemplate ? 
    plan.weeklyTemplate.reduce((total: number, day: any) => 
      total + (day.exerciseTemplates?.length || 0), 0
    ) : 0;

  // Calculate active days
  const activeDays = plan.weeklyTemplate ? 
    plan.weeklyTemplate.filter((day: any) => day.exerciseTemplates?.length > 0).length : 0;

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isActive ? 'border-primary/50 bg-primary/5' : ''
      } ${isLoading ? 'opacity-50' : ''}`}
      onClick={(e) => {
        // Only navigate if the delete dialog is not open
        if (!deleteDialogOpen) {
          handleView();
        }
      }}
    >
      <CardHeader className={compact ? 'pb-2' : ''}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className={compact ? 'text-lg' : 'text-xl'}>
                {plan.name}
              </CardTitle>
              {isActive && (
                <Badge variant="default" className="gap-1">
                  <Activity className="h-3 w-3" />
                  Active
                </Badge>
              )}
            </div>
            {plan.description && !compact && (
              <CardDescription className="mt-1">
                {plan.description}
              </CardDescription>
            )}
          </div>
          
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  disabled={isLoading}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">                {isActive ? (
                  <DropdownMenuItem onClick={handleDeactivate}>
                    <Pause className="mr-2 h-4 w-4" />
                    Deactivate
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={handleActivate}>
                    <Play className="mr-2 h-4 w-4" />
                    Activate
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/workout-plans/${plan.id}`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={compact ? 'pt-0' : ''}>
        <div className="space-y-3">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Target className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="font-medium">{exerciseCount}</div>
              <div className="text-muted-foreground text-xs">Exercises</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="font-medium">{activeDays}</div>
              <div className="text-muted-foreground text-xs">Active Days</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="font-medium capitalize">{plan.mode || 'Ongoing'}</div>
              <div className="text-muted-foreground text-xs">Type</div>
            </div>
          </div>

          {/* Date Info */}
          {plan.createdAt && !compact && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              Created {format(new Date(plan.createdAt), 'MMM dd, yyyy')}
            </div>
          )}

          {/* Quick Actions */}
          {showActions && !compact && (
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleEdit}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              {isActive ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleDeactivate}
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={handleActivate}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Start
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <DeleteConfirmationDialog 
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Workout Plan"
        description="Are you sure you want to delete this workout plan? This action cannot be undone."
        itemToDelete={plan.name}
        isLoading={isLoading}
      />

      <PlanActivationConfirmDialog
        open={activationConfirmOpen}
        onOpenChange={setActivationConfirmOpen}
        onConfirm={handleConfirmActivation}
        newPlanName={plan.name}
        currentActivePlanName={activePlan?.name || ''}
      />
    </Card>
  );
}
