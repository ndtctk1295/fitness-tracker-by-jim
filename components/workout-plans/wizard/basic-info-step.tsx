'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BasicInfoStepProps {
  data: {
    name: string;
    description: string;
  };
  onDataChange: (updates: { name?: string; description?: string }) => void;
}

export function BasicInfoStep({ data, onDataChange }: BasicInfoStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Information</CardTitle>
        <CardDescription>
          Give your workout plan a name and description to help you identify it later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Plan Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Summer Strength Training"
            value={data.name}
            onChange={(e) => onDataChange({ name: e.target.value })}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Choose a descriptive name for your workout plan
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="e.g., A 12-week strength training program focused on building muscle mass and improving overall fitness..."
            value={data.description}
            onChange={(e) => onDataChange({ description: e.target.value })}
            rows={4}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Provide additional details about your workout plan's goals and approach
          </p>
        </div>

        {/* Preview */}
        {data.name && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium">Preview</h4>
            <div className="mt-2">
              <div className="font-semibold">{data.name}</div>
              {data.description && (
                <div className="text-sm text-muted-foreground mt-1">
                  {data.description}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
