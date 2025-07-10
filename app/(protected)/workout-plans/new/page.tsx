'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkoutPlanWizard } from '@/components/workout-plans/workout-plan-wizard';
import { useApiToast } from '@/lib/hooks/use-api-toast';

export default function NewWorkoutPlanPage() {
  const router = useRouter();
  const { showSuccessToast } = useApiToast();

  const handleComplete = (newPlan: any) => {
    showSuccessToast('Workout plan created successfully!');
    router.push(`/workout-plans/${newPlan.id}`);
  };

  const handleCancel = () => {
    router.push('/workout-plans');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Workout Plan</h1>
          <p className="text-muted-foreground mt-1">
            Build a personalized workout routine with our step-by-step wizard
          </p>
        </div>
      </div>

      {/* Wizard */}
      <WorkoutPlanWizard
        open={true}
        onComplete={handleComplete}
        onCancel={handleCancel}
        embedded={true}
      />
    </div>
  );
}
