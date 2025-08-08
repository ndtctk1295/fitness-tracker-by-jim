"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Clock, Target, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useExerciseData } from "@/lib/hooks/data-hook/use-exercise-data";
import { Exercise } from "@/lib/types";
import { WorkoutPlan } from "@/lib/services/clients-service/workout-plan-service";

interface WeeklyScheduleGridProps {
  workoutPlan: WorkoutPlan;
  onUpdatePlan: (updates: Partial<WorkoutPlan>) => void;
  readOnly?: boolean;
}

const DAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon', dayOfWeek: 1 },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue', dayOfWeek: 2 },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed', dayOfWeek: 3 },
  { key: 'thursday', label: 'Thursday', short: 'Thu', dayOfWeek: 4 },
  { key: 'friday', label: 'Friday', short: 'Fri', dayOfWeek: 5 },
  { key: 'saturday', label: 'Saturday', short: 'Sat', dayOfWeek: 6 },
  { key: 'sunday', label: 'Sunday', short: 'Sun', dayOfWeek: 0 },
];

export function WeeklyScheduleGrid({ workoutPlan, onUpdatePlan, readOnly = false }: WeeklyScheduleGridProps) {
  const { exercises } = useExerciseData();
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const getDayExercises = (dayOfWeek: number) => {
    const dayTemplate = workoutPlan.weeklyTemplate?.find((t: any) => t.dayOfWeek === dayOfWeek);
    return dayTemplate?.exerciseTemplates || [];
  };

  const handleAddExercise = (dayOfWeek: number) => {
    setSelectedDay(dayOfWeek);
    setEditingExercise({
      exerciseId: '',
      sets: 3,
      reps: 10,
      weight: 0,
      duration: 0,
      notes: ''
    });
    setShowExerciseDialog(true);
  };

  const handleEditExercise = (dayOfWeek: number, exercise: any) => {
    setSelectedDay(dayOfWeek);
    setEditingExercise({ ...exercise });
    setShowExerciseDialog(true);
  };

  const handleSaveExercise = () => {
    if (!selectedDay || !editingExercise?.exerciseId) return;

    const updatedTemplate = workoutPlan.weeklyTemplate?.map(day => {
      if (day.dayOfWeek === selectedDay) {
        const existingIndex = day.exerciseTemplates.findIndex(ex => 
          ex.exerciseId === editingExercise.exerciseId
        );
        
        if (existingIndex >= 0) {
          // Update existing
          return {
            ...day,
            exerciseTemplates: day.exerciseTemplates.map((ex, idx) =>
              idx === existingIndex ? editingExercise : ex
            )
          };
        } else {
          // Add new
          return {
            ...day,
            exerciseTemplates: [...day.exerciseTemplates, editingExercise]
          };
        }
      }
      return day;
    }) || [];    // If day doesn't exist yet, create it
    if (!workoutPlan.weeklyTemplate?.find(t => t.dayOfWeek === selectedDay)) {
      updatedTemplate.push({
        dayOfWeek: selectedDay as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        exerciseTemplates: [editingExercise]
      });
    }

    onUpdatePlan({ weeklyTemplate: updatedTemplate });
    setShowExerciseDialog(false);
    setEditingExercise(null);
    setSelectedDay(null);
  };

  const handleRemoveExercise = (dayOfWeek: number, exerciseId: string) => {
    const updatedTemplate = workoutPlan.weeklyTemplate?.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        return {
          ...day,
          exerciseTemplates: day.exerciseTemplates.filter(ex => ex.exerciseId !== exerciseId)
        };
      }
      return day;
    }) || [];

    onUpdatePlan({ weeklyTemplate: updatedTemplate });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {DAYS.map(day => {
          const dayExercises = getDayExercises(day.dayOfWeek);
          
          return (
            <Card key={day.key} className="h-fit">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">{day.label}</CardTitle>
                  <Badge variant="secondary">
                    {dayExercises.length} exercise{dayExercises.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayExercises.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-sm">No exercises planned</div>
                    <div className="text-xs">Rest day</div>
                  </div>
                ) : (
                  dayExercises.map((exerciseTemplate, index) => {
                    const exercise = exercises.find(ex => ex.id === exerciseTemplate.exerciseId);
                    if (!exercise) return null;

                    return (
                      <Card key={index} className="bg-muted/50">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-sm">{exercise.name}</h4>
                              </div>
                              
                              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                                {exerciseTemplate.sets > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <Target className="h-3 w-3" />
                                    <span>{exerciseTemplate.sets} sets</span>
                                  </div>
                                )}
                                {exerciseTemplate.reps > 0 && (
                                  <span>× {exerciseTemplate.reps} reps</span>
                                )}
                                {exerciseTemplate.weight > 0 && (
                                  <span>@ {exerciseTemplate.weight}kg</span>
                                )}                                {exerciseTemplate.duration && exerciseTemplate.duration > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{exerciseTemplate.duration}min</span>
                                  </div>
                                )}
                              </div>
                              
                              {exerciseTemplate.notes && (
                                <p className="text-xs text-muted-foreground mt-1">{exerciseTemplate.notes}</p>
                              )}
                            </div>
                            
                            {!readOnly && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditExercise(day.dayOfWeek, exerciseTemplate)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleRemoveExercise(day.dayOfWeek, exerciseTemplate.exerciseId)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
                
                {!readOnly && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAddExercise(day.dayOfWeek)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exercise
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Exercise Edit Dialog */}
      <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingExercise?.exerciseId ? 'Edit Exercise' : 'Add Exercise'}
            </DialogTitle>
            <DialogDescription>
              Configure the exercise details for your workout plan.
            </DialogDescription>
          </DialogHeader>
          
          {editingExercise && (
            <div className="space-y-4">
              <div>
                <Label>Exercise</Label>
                <Select 
                  value={editingExercise.exerciseId} 
                  onValueChange={(value) => setEditingExercise({...editingExercise, exerciseId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-48">
                      {exercises.map(exercise => (                        <SelectItem key={exercise.id} value={exercise.id}>
                          <div className="flex items-center space-x-2">
                            <span>{exercise.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>              {editingExercise.exerciseId && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label>Sets</Label>
                      <Input
                        type="number"
                        value={editingExercise.sets || ''}
                        onChange={(e) => setEditingExercise({
                          ...editingExercise, 
                          sets: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <Label>Reps</Label>
                      <Input
                        type="number"
                        value={editingExercise.reps || ''}
                        onChange={(e) => setEditingExercise({
                          ...editingExercise, 
                          reps: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <Label>Weight (kg)</Label>
                      <Input
                        type="number"
                        value={editingExercise.weight || ''}
                        onChange={(e) => setEditingExercise({
                          ...editingExercise, 
                          weight: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={editingExercise.duration || ''}
                      onChange={(e) => setEditingExercise({
                        ...editingExercise, 
                        duration: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>

                  <div>
                    <Label>Notes (optional)</Label>
                    <Textarea
                      value={editingExercise.notes || ''}
                      onChange={(e) => setEditingExercise({
                        ...editingExercise, 
                        notes: e.target.value
                      })}
                      placeholder="Add any notes or instructions..."
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowExerciseDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveExercise} disabled={!editingExercise.exerciseId}>
                      Save Exercise
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
