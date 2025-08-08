'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BasicInfoStep } from './wizard/basic-info-step';
import { ModeAndDatesStep } from './wizard/mode-and-dates-step';
import { WeeklyTemplateStep } from './wizard/weekly-template-step';
import { ReviewStep } from './wizard/review-step';
import { useWorkoutPlanData } from '@/lib/hooks/data-hook/use-workout-plan-data';
import { useApiToast } from '@/lib/hooks/use-api-toast';

interface WorkoutPlanWizardProps {
  open: boolean;
  onComplete: (plan: any) => void;
  onCancel: () => void;
  embedded?: boolean;
}

interface WizardData {
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
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
}

const STEPS = [
  { id: 'basic', title: 'Basic Information', description: 'Name and description' },
  { id: 'mode', title: 'Plan Type', description: 'Ongoing or time-limited' },
  { id: 'template', title: 'Weekly Schedule', description: 'Set up your exercise routine' },
  { id: 'review', title: 'Review', description: 'Confirm your plan' }
];

export function WorkoutPlanWizard({ 
  open, 
  onComplete, 
  onCancel, 
  embedded = false 
}: WorkoutPlanWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);  const [wizardData, setWizardData] = useState<WizardData>({
    name: '',
    description: '',
    level: 'beginner', // Default to beginner level
    mode: 'ongoing',
    weeklySchedule: {}
  });

  const { createPlan } = useWorkoutPlanData();
  const { showErrorToast } = useApiToast();

  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return wizardData.name.trim().length > 0;      case 1: // Mode and Dates
        if (wizardData.mode === 'dated') {
          return wizardData.startDate !== undefined;
        }
        return true;
      case 2: // Weekly Template
        return Object.values(wizardData.weeklySchedule).some(dayExercises => 
          dayExercises && dayExercises.length > 0
        );
      case 3: // Review
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Define day mapping for all 7 days of the week
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
      const userDayMap = Object.entries(wizardData.weeklySchedule).reduce((acc, [dayKey, exercises]) => {
        acc[dayMap[dayKey]] = exercises.map((ex, index) => ({
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
      
      const planData = {
        name: wizardData.name,
        description: wizardData.description,
        level: wizardData.level,
        mode: wizardData.mode,
        startDate: wizardData.startDate ? new Date(wizardData.startDate) : undefined,
        endDate: wizardData.endDate ? new Date(wizardData.endDate) : undefined,
        weeklyTemplate,
        isActive: false // Plans start inactive by default
      };

      const newPlan = await createPlan(planData);
      onComplete(newPlan);
    } catch (error) {
      showErrorToast('Failed to create workout plan', 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep 
            data={wizardData}
            onDataChange={updateWizardData}
          />
        );
      case 1:
        return (
          <ModeAndDatesStep 
            data={wizardData}
            onDataChange={updateWizardData}
          />
        );
      case 2:
        return (
          <WeeklyTemplateStep 
            data={wizardData}
            onDataChange={updateWizardData}
          />
        );
      case 3:
        return (
          <ReviewStep 
            data={wizardData}
          />
        );
      default:
        return null;
    }
  };
  const content = (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{STEPS[currentStep].title}</span>
          <span className="text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>
        <Progress value={progress} />
        <p className="text-sm text-muted-foreground">
          {STEPS[currentStep].description}
        </p>
      </div>      {/* Step Content */}
      <div className="min-h-[300px]">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={currentStep === 0 ? onCancel : handlePrevious}
          disabled={isSubmitting}
        >
          {currentStep === 0 ? (
            'Cancel'
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </>
          )}
        </Button>
        
        <Button 
          onClick={currentStep === STEPS.length - 1 ? handleSubmit : handleNext}
          disabled={!canProceed() || isSubmitting}
        >
          {isSubmitting ? (
            'Creating...'
          ) : currentStep === STEPS.length - 1 ? (
            'Create Plan'
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }  return (
    <Dialog open={open} onOpenChange={() => !isSubmitting && onCancel()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Workout Plan</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto pr-2 flex-grow">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
