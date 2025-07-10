'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';

interface ScopeSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (scope: 'this-week' | 'whole-plan') => void;
  exerciseName: string;
  fromDate: string;
  toDate: string;
}

export function ScopeSelectionDialog({
  open,
  onOpenChange,
  onConfirm,
  exerciseName,
  fromDate,
  toDate,
}: ScopeSelectionDialogProps) {
  const [selectedScope, setSelectedScope] = useState<'this-week' | 'whole-plan'>('this-week');

  const handleConfirm = () => {
    onConfirm(selectedScope);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move Exercise</DialogTitle>
          <DialogDescription>
            You're moving "{exerciseName}" from {fromDate} to {toDate}.
            <br />
            How should this change be applied?
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selectedScope}
          onValueChange={(value) => setSelectedScope(value as 'this-week' | 'whole-plan')}
          className="grid gap-4"
        >
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="this-week" id="this-week" />
            <Label htmlFor="this-week" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">This week only</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Make a temporary change for this week. The original workout plan remains unchanged.
              </p>
            </Label>
          </div>

          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value="whole-plan" id="whole-plan" />
            <Label htmlFor="whole-plan" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Update workout plan</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Permanently update the workout plan schedule. This affects all future weeks.
              </p>
            </Label>
          </div>
        </RadioGroup>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
