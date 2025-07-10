'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PlanActivationConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  newPlanName: string;
  currentActivePlanName: string;
}

export function PlanActivationConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  newPlanName,
  currentActivePlanName,
}: PlanActivationConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Switch Active Workout Plan?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              You currently have <strong>"{currentActivePlanName}"</strong> as your active workout plan.
            </p>
            <p>
              Activating <strong>"{newPlanName}"</strong> will:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
              <li>Deactivate your current plan: "{currentActivePlanName}"</li>
              <li>Activate the new plan: "{newPlanName}"</li>
              <li>Generate scheduled exercises based on the new plan</li>
              <li>Replace your current workout schedule with the new plan's schedule</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              This action cannot be undone, but you can always switch back to your previous plan later.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Switch to "{newPlanName}"
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
