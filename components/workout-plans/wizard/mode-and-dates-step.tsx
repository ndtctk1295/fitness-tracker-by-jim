"use client";

import { useState } from "react";
import { Calendar, Clock, Infinity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ModeAndDatesStepProps {
  data: {
    mode: 'ongoing' | 'dated';
    startDate?: Date;
    endDate?: Date;
  };
  onDataChange: (data: any) => void;
}

export function ModeAndDatesStep({ data, onDataChange }: ModeAndDatesStepProps) {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const handleModeChange = (mode: 'ongoing' | 'dated') => {
    onDataChange({
      ...data,
      mode,
      startDate: mode === 'dated' ? data.startDate || new Date() : undefined,
      endDate: mode === 'dated' ? data.endDate : undefined,
    });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    onDataChange({
      ...data,
      startDate: date,
      // If end date is before start date, clear it
      endDate: date && data.endDate && data.endDate < date ? undefined : data.endDate,
    });
    setStartDateOpen(false);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    onDataChange({
      ...data,
      endDate: date,
    });
    setEndDateOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Plan Duration</h3>
        <p className="text-muted-foreground mb-4">
          Choose whether this workout plan runs indefinitely or has specific start and end dates.
        </p>
      </div>

      <RadioGroup
        value={data.mode}
        onValueChange={(value) => handleModeChange(value as 'ongoing' | 'dated')}
        className="space-y-4"
      >
        <Card className={cn(
          "cursor-pointer transition-colors",
          data.mode === 'ongoing' && "ring-2 ring-primary"
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="ongoing" id="ongoing" />
              <div className="flex items-center space-x-2">
                <Infinity className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Ongoing Plan</CardTitle>
              </div>
            </div>
            <CardDescription className="ml-6">
              This plan will run indefinitely until you manually deactivate it. Perfect for long-term fitness routines.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className={cn(
          "cursor-pointer transition-colors",
          data.mode === 'dated' && "ring-2 ring-primary"
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="dated" id="dated" />
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Time-Limited Plan</CardTitle>
              </div>
            </div>
            <CardDescription className="ml-6">
              This plan will run for a specific period with defined start and end dates. Great for challenges or structured programs.
            </CardDescription>
          </CardHeader>
          
          {data.mode === 'dated' && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !data.startDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {data.startDate ? format(data.startDate, "PPP") : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={data.startDate}
                        onSelect={handleStartDateChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date (Optional)</Label>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !data.endDate && "text-muted-foreground"
                        )}
                        disabled={!data.startDate}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {data.endDate ? format(data.endDate, "PPP") : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={data.endDate}
                        onSelect={handleEndDateChange}
                        disabled={(date) => !data.startDate || date <= data.startDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </RadioGroup>

      {data.mode === 'dated' && data.startDate && data.endDate && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Duration: {Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
