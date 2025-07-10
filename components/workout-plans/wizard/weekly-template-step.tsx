"use client";

import { useState } from "react";
import { Plus, Search, X, Clock, Target, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useExerciseStore } from "@/lib/stores/exercise-store";
import { Exercise, StoreExercise } from "@/lib/types";

interface WeeklyTemplateStepProps {
  data: {
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
  onDataChange: (data: any) => void;
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

interface ExerciseSelectorProps {
  onSelect: (exercise: StoreExercise) => void;
  onClose: () => void;
}

function ExerciseSelector({ onSelect, onClose }: ExerciseSelectorProps) {
  const { exercises } = useExerciseStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscleGroup = selectedMuscleGroup === "all" || 
      exercise.muscleGroups?.includes(selectedMuscleGroup);
    return matchesSearch && matchesMuscleGroup;
  });

  const muscleGroups = Array.from(
    new Set(exercises.flatMap(e => e.muscleGroups || []))
  ).sort();

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <div className="flex-1">
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All muscle groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All muscle groups</SelectItem>
            {muscleGroups.map(group => (
              <SelectItem key={group} value={group}>
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-96">
        <div className="space-y-2">
          {filteredExercises.map(exercise => (
            <Card
              key={exercise.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => {
                onSelect(exercise);
                onClose();
              }}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">                  <div className="flex-1">
                    <h4 className="font-medium">{exercise.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{exercise.description}</p>                    <div className="flex flex-wrap gap-1 mt-2">
                      {exercise.muscleGroups?.map(group => (
                        <Badge key={group} variant="secondary" className="text-xs">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface ScheduledExerciseCardProps {
  exercise: StoreExercise;
  scheduledExercise: {
    id: string;
    exerciseId: string;
    sets?: number;
    reps?: number;
    weight?: number;
    duration?: number;
    notes?: string;
  };
  onUpdate: (data: any) => void;
  onRemove: () => void;
}

function ScheduledExerciseCard({ exercise, scheduledExercise, onUpdate, onRemove }: ScheduledExerciseCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(scheduledExercise);

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(scheduledExercise);
    setIsEditing(false);
  };

  return (
    <Card className="mb-2">
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-sm">{exercise.name}</h4>
            </div>
            
            {!isEditing ? (
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                {scheduledExercise.sets && (
                  <div className="flex items-center space-x-1">
                    <Target className="h-3 w-3" />
                    <span>{scheduledExercise.sets} sets</span>
                  </div>
                )}
                {scheduledExercise.reps && (
                  <span>× {scheduledExercise.reps} reps</span>
                )}
                {scheduledExercise.weight && (
                  <span>@ {scheduledExercise.weight}kg</span>
                )}
                {scheduledExercise.duration && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{scheduledExercise.duration}min</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label className="text-xs">Sets</Label>
                  <Input
                    type="number"
                    value={editData.sets || ''}
                    onChange={(e) => setEditData({ ...editData, sets: parseInt(e.target.value) || undefined })}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Reps</Label>
                  <Input
                    type="number"
                    value={editData.reps || ''}
                    onChange={(e) => setEditData({ ...editData, reps: parseInt(e.target.value) || undefined })}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Weight (kg)</Label>
                  <Input
                    type="number"
                    value={editData.weight || ''}
                    onChange={(e) => setEditData({ ...editData, weight: parseFloat(e.target.value) || undefined })}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={editData.duration || ''}
                    onChange={(e) => setEditData({ ...editData, duration: parseInt(e.target.value) || undefined })}
                    className="h-8"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Notes</Label>
                  <Textarea
                    value={editData.notes || ''}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    className="h-16 text-xs"
                    placeholder="Add notes..."
                  />
                </div>
                <div className="col-span-2 flex space-x-2 mt-2">
                  <Button size="sm" onClick={handleSave}>Save</Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
                </div>
              </div>
            )}
            
            {scheduledExercise.notes && !isEditing && (
              <p className="text-xs text-muted-foreground mt-1">{scheduledExercise.notes}</p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRemove} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeeklyTemplateStep({ data, onDataChange }: WeeklyTemplateStepProps) {
  const { exercises } = useExerciseStore();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  const handleAddExercise = (day: string, exercise: StoreExercise) => {
    const newScheduledExercise = {
      id: Date.now().toString(),
      exerciseId: exercise.id,
      sets: 3, // Default sets
      reps: 10, // Default reps
      duration: 30, // Default duration (minutes)
    };

    const updatedSchedule = {
      ...data.weeklySchedule,
      [day]: [...(data.weeklySchedule[day] || []), newScheduledExercise]
    };

    onDataChange({
      ...data,
      weeklySchedule: updatedSchedule
    });
  };

  const handleUpdateExercise = (day: string, exerciseId: string, updatedData: any) => {
    const updatedSchedule = {
      ...data.weeklySchedule,
      [day]: data.weeklySchedule[day]?.map(ex => 
        ex.id === exerciseId ? { ...ex, ...updatedData } : ex
      ) || []
    };

    onDataChange({
      ...data,
      weeklySchedule: updatedSchedule
    });
  };

  const handleRemoveExercise = (day: string, exerciseId: string) => {
    const updatedSchedule = {
      ...data.weeklySchedule,
      [day]: data.weeklySchedule[day]?.filter(ex => ex.id !== exerciseId) || []
    };

    onDataChange({
      ...data,
      weeklySchedule: updatedSchedule
    });
  };

  const getTotalExercises = () => {
    return Object.values(data.weeklySchedule).reduce((total, dayExercises) => total + dayExercises.length, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Weekly Schedule Template</h3>
        <p className="text-muted-foreground mb-4">
          Plan your workout schedule for each day of the week. You can add exercises and set target sets, reps, and weights.
        </p>
      </div>

      {getTotalExercises() > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="text-sm">
              <span className="font-medium">Total exercises planned: {getTotalExercises()}</span>
            </div>
          </CardContent>
        </Card>
      )}      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DAYS.map(day => {
          const dayExercises = data.weeklySchedule[day.key] || [];
          
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
              <CardContent className="space-y-2 max-h-[250px] overflow-y-auto">
                {dayExercises.map(scheduledExercise => {
                  const exercise = exercises.find(ex => ex.id === scheduledExercise.exerciseId);
                  if (!exercise) return null;
                  
                  return (
                    <ScheduledExerciseCard
                      key={scheduledExercise.id}
                      exercise={exercise}
                      scheduledExercise={scheduledExercise}
                      onUpdate={(updatedData) => handleUpdateExercise(day.key, scheduledExercise.id, updatedData)}
                      onRemove={() => handleRemoveExercise(day.key, scheduledExercise.id)}
                    />
                  );
                })}
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedDay(day.key);
                    setShowExerciseSelector(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exercise
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>      <Dialog open={showExerciseSelector} onOpenChange={setShowExerciseSelector}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Exercise to {selectedDay && DAYS.find(d => d.key === selectedDay)?.label}</DialogTitle>
            <DialogDescription>
              Choose an exercise to add to your weekly schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto">
            <ExerciseSelector
              onSelect={(exercise) => {
                if (selectedDay) {
                  handleAddExercise(selectedDay, exercise);
                }
              }}
              onClose={() => setShowExerciseSelector(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
