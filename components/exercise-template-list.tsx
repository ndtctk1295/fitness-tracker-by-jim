'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Copy, Trash2, Save, Calendar, Plus, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useExerciseTemplates } from '@/lib/hooks/use-exercise-templates';
import { useExerciseData } from '@/lib/hooks/data-hook/use-exercise-data';
import { kgToLbs } from '@/lib/utils/weight-conversion';
import { useWeightStore } from '@/lib/stores/weight-store';
import { ExerciseTemplateListProps } from '@/lib/types';
import { validateScheduledExerciseBatch, formatValidationErrors } from '@/lib/utils/api-validation';

export function ExerciseTemplateList({ selectedDate, onTemplateApplied }: ExerciseTemplateListProps) {
  const {
    templates,
    addTemplate,
    removeTemplate,
    clearTemplates,
    applyTemplatesToDate,
    copyExercises,
    saveExercisesAsTemplates,
    templatesCount,
    isLoading
  } = useExerciseTemplates();

  const { exercises, categories } = useExerciseData();
  const { weightUnit } = useWeightStore();

  // Dialog states
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [localIsLoading, setLocalIsLoading] = useState(false);

  // Calendar states
  const [targetDate, setTargetDate] = useState<Date | undefined>(selectedDate || new Date());
  const [sourceDate, setSourceDate] = useState<Date>(new Date());
  const [copyTargetDate, setCopyTargetDate] = useState<Date>(new Date());

  // Get exercise and category data for display
  const getExerciseName = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    return exercise?.name || 'Unknown Exercise';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#888888';
  };

  // Format weight for display based on current unit
  const formatWeight = (weightInKg: number): string => {
    if (weightInKg === 0) return 'Bodyweight';
    const value = weightUnit === 'kg' ? weightInKg : kgToLbs(weightInKg);
    return `${value.toFixed(1)} ${weightUnit}`;
  };

  // Apply templates to selected date
  const handleApplyTemplates = async () => {
    if (!targetDate) return;

    setLocalIsLoading(true);
    try {
      // Validate templates before applying
      const validationResult = validateScheduledExerciseBatch(templates);
      if (!validationResult.isValid) {
        throw new Error(`Invalid template data: ${formatValidationErrors(validationResult.errors)}`);
      }

      await applyTemplatesToDate(targetDate);
      setApplyDialogOpen(false);
      if (onTemplateApplied) onTemplateApplied();
    } catch (error) {
      console.error('Failed to apply templates:', error);
    } finally {
      setLocalIsLoading(false);
    }
  };

  // Copy exercises between dates
  const handleCopyExercises = async () => {
    if (!sourceDate || !copyTargetDate) return;

    setLocalIsLoading(true);
    try {
      await copyExercises(sourceDate, copyTargetDate);
      setCopyDialogOpen(false);
      if (onTemplateApplied) onTemplateApplied();
    } catch (error) {
      console.error('Failed to copy exercises:', error);
    } finally {
      setLocalIsLoading(false);
    }
  };

  // Save current date's exercises as templates
  const handleSaveAsTemplates = () => {
    if (selectedDate) {
      saveExercisesAsTemplates(selectedDate);
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Exercise Templates</span>
            <div className="flex items-center gap-2">
              {selectedDate && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSaveAsTemplates}
                >
                  <Save className="h-4 w-4 mr-1" /> Save Current Exercises
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCopyDialogOpen(true)}
              >
                <Copy className="h-4 w-4 mr-1" /> Copy Between Dates
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Create reusable exercise templates to quickly schedule your workouts
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p>Loading templates...</p>
            </div>
          )}

          {!isLoading && templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No templates available</p>
              <p className="text-sm mt-1">Save exercises as templates or create new ones</p>
            </div>
          ) : (
            <ScrollArea className="h-[320px] px-4">
              {templates.map((template, index) => (
                <div
                  key={`template-${index}`}
                  className="border rounded-lg p-3 mb-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{getExerciseName(template.exerciseId)}</h4>
                      <Badge style={{ backgroundColor: getCategoryColor(template.categoryId) }}>
                        {getCategoryName(template.categoryId)}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTemplate(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-3 gap-1 text-sm">
                    <div>Sets: {template.sets}</div>
                    <div>Reps: {template.reps}</div>
                    <div>Weight: {formatWeight(template.weight)}</div>
                  </div>
                  
                  {template.notes && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {template.notes}
                    </p>
                  )}
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-4">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={clearTemplates}
            disabled={templates.length === 0}
          >
            Clear All
          </Button>
          <Button 
            variant="default" 
            onClick={() => setApplyDialogOpen(true)}
            disabled={templates.length === 0}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Apply Templates ({templatesCount})
          </Button>
        </CardFooter>
      </Card>

      {/* Apply Templates Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Templates to Date</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 flex flex-col items-center">
            <CalendarComponent
              mode="single"
              selected={targetDate}
              onSelect={setTargetDate}
              className="mx-auto"
            />
            
            <p className="mt-4 text-center">
              Apply {templatesCount} template{templatesCount !== 1 ? 's' : ''} to{' '}
              <strong>{targetDate ? format(targetDate, 'MMMM d, yyyy') : 'selected date'}</strong>
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleApplyTemplates} 
              disabled={!targetDate || localIsLoading}
            >
              {localIsLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Apply Templates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Copy Between Dates Dialog */}
      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Copy Exercises Between Dates</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Source Date</label>              <CalendarComponent
                mode="single"
                selected={sourceDate}
                onSelect={(date) => date && setSourceDate(date)}
                className="mx-auto"
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Target Date</label>              <CalendarComponent
                mode="single"
                selected={copyTargetDate}
                onSelect={(date) => date && setCopyTargetDate(date)}
                className="mx-auto"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCopyExercises} 
              disabled={!sourceDate || !copyTargetDate || localIsLoading}
            >
              {localIsLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Copy Exercises
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
