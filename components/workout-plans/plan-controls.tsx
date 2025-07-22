"use client";

import { useState } from "react";
import { Settings, Edit, Copy, Trash2, Play, Pause, Calendar, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { WorkoutPlan } from "@/lib/services/clients-service/workout-plan-service";
import { useWorkoutPlanStore } from "@/lib/stores/workout-plan-store";
import { useApiToast } from "@/lib/hooks/use-api-toast";

// Use Store type for component props
type StoreWorkoutPlan = {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  isActive: boolean;
  mode: 'ongoing' | 'dated';
  startDate?: string;
  endDate?: string;
  weeklyTemplate: any[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

interface PlanControlsProps {
  workoutPlan: StoreWorkoutPlan;
  onPlanUpdated: (plan: StoreWorkoutPlan) => void;
  onPlanDeleted: () => void;
}

export function PlanControls({ workoutPlan, onPlanUpdated, onPlanDeleted }: PlanControlsProps) {
  const { updatePlan, deletePlan, duplicatePlan } = useWorkoutPlanStore();
  const { showSuccessToast, showErrorToast } = useApiToast();
  
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [editData, setEditData] = useState({
    name: workoutPlan.name,
    description: workoutPlan.description || '',
    mode: workoutPlan.mode,
    startDate: workoutPlan.startDate ? new Date(workoutPlan.startDate) : undefined,
    endDate: workoutPlan.endDate ? new Date(workoutPlan.endDate) : undefined,
  });  const handleToggleActive = async () => {
    try {
      if (!workoutPlan.id) return;
      const updatedPlan = await updatePlan(workoutPlan.id, {
        isActive: !workoutPlan.isActive
      });
      if (updatedPlan) {
        onPlanUpdated(updatedPlan);
        showSuccessToast(
          `Plan ${workoutPlan.isActive ? 'deactivated' : 'activated'} - Your workout plan is now ${workoutPlan.isActive ? 'inactive' : 'active'}`
        );
      }
    } catch (error) {
      showErrorToast('Failed to update plan status', 'Please try again');
    }
  };  const handleSaveBasicInfo = async () => {
    try {
      if (!workoutPlan.id) return;
      const updatedPlan = await updatePlan(workoutPlan.id, {
        name: editData.name,
        description: editData.description,
        mode: editData.mode,
        startDate: editData.startDate,
        endDate: editData.endDate,
      });
      if (updatedPlan) {
        onPlanUpdated(updatedPlan);
        setIsEditingBasic(false);
        showSuccessToast('Plan updated - Your changes have been saved');
      }
    } catch (error) {
      showErrorToast('Failed to update plan', 'Please try again');
    }
  };  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      if (!workoutPlan.id) return;
      const duplicatedPlan = await duplicatePlan(workoutPlan.id);
      showSuccessToast('Plan duplicated - A copy of your plan has been created');
      // Optionally navigate to the new plan
    } catch (error) {
      showErrorToast('Failed to duplicate plan', 'Please try again');
    } finally {
      setIsDuplicating(false);
    }
  };  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (!workoutPlan.id) return;
      await deletePlan(workoutPlan.id);
      showSuccessToast('Plan deleted - Your workout plan has been removed');
      onPlanDeleted();
    } catch (error) {
      showErrorToast('Failed to delete plan', 'Please try again');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Plan Settings</h3>
        <div className="flex items-center space-x-2">
          <Switch
            checked={workoutPlan.isActive}
            onCheckedChange={handleToggleActive}
          />
          <Label className="text-sm font-medium">
            {workoutPlan.isActive ? 'Active' : 'Inactive'}
          </Label>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditingBasic ? (
            <>
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="mt-1">{workoutPlan.name}</p>
              </div>
              {workoutPlan.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="mt-1 text-muted-foreground">{workoutPlan.description}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Type</Label>
                <p className="mt-1 capitalize">{workoutPlan.mode} plan</p>
              </div>
              {workoutPlan.mode === 'dated' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workoutPlan.startDate && (
                    <div>
                      <Label className="text-sm font-medium">Start Date</Label>
                      <p className="mt-1">{format(new Date(workoutPlan.startDate), 'PPP')}</p>
                    </div>
                  )}
                  {workoutPlan.endDate && (
                    <div>
                      <Label className="text-sm font-medium">End Date</Label>
                      <p className="mt-1">{format(new Date(workoutPlan.endDate), 'PPP')}</p>
                    </div>
                  )}
                </div>
              )}
              <Button variant="outline" onClick={() => setIsEditingBasic(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Information
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input
                  id="plan-name"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  placeholder="Enter plan name"
                />
              </div>
              
              <div>
                <Label htmlFor="plan-description">Description</Label>
                <Textarea
                  id="plan-description"
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  placeholder="Enter plan description"
                />
              </div>

              <div>
                <Label htmlFor="plan-mode">Plan Type</Label>
                <Select 
                  value={editData.mode} 
                  onValueChange={(value: 'ongoing' | 'dated') => setEditData({...editData, mode: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">Ongoing Plan</SelectItem>
                    <SelectItem value="dated">Time-Limited Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editData.mode === 'dated' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !editData.startDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {editData.startDate ? format(editData.startDate, "PPP") : "Select start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={editData.startDate}
                          onSelect={(date) => {
                            setEditData({...editData, startDate: date});
                            setShowDatePicker(false);
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>End Date (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !editData.endDate && "text-muted-foreground"
                          )}
                          disabled={!editData.startDate}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {editData.endDate ? format(editData.endDate, "PPP") : "Select end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={editData.endDate}
                          onSelect={(date) => setEditData({...editData, endDate: date})}
                          disabled={(date) => !editData.startDate || date <= editData.startDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button onClick={handleSaveBasicInfo}>Save Changes</Button>
                <Button variant="outline" onClick={() => {
                  setIsEditingBasic(false);
                  setEditData({
                    name: workoutPlan.name,
                    description: workoutPlan.description || '',
                    mode: workoutPlan.mode,
                    startDate: workoutPlan.startDate ? new Date(workoutPlan.startDate) : undefined,
                    endDate: workoutPlan.endDate ? new Date(workoutPlan.endDate) : undefined,
                  });
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Plan Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleDuplicate}
              disabled={isDuplicating}
              className="justify-start"
            >
              <Copy className="h-4 w-4 mr-2" />
              {isDuplicating ? 'Duplicating...' : 'Duplicate Plan'}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="justify-start">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Plan
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <span>Delete Workout Plan</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{workoutPlan.name}"? This action cannot be undone.
                    All scheduled exercises and progress data for this plan will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Plan'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Plan Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Status:</span>
            <span className={`text-sm font-medium ${workoutPlan.isActive ? 'text-green-600' : 'text-muted-foreground'}`}>
              {workoutPlan.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Created:</span>            <span className="text-sm text-muted-foreground">
              {workoutPlan.createdAt ? format(new Date(workoutPlan.createdAt), 'PPP') : 'Unknown'}
            </span>
          </div>
          
          {workoutPlan.updatedAt && workoutPlan.updatedAt !== workoutPlan.createdAt && (
            <div className="flex justify-between items-center">
              <span className="text-sm">Last Modified:</span>
              <span className="text-sm text-muted-foreground">
                {format(new Date(workoutPlan.updatedAt), 'PPP')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Workout Plan"
        description="Are you sure you want to delete this workout plan? This action cannot be undone."
        itemToDelete={workoutPlan.name}
        isLoading={isDeleting}
      />
    </div>
  );
}
