'use client';

import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarViewToggle } from "./calendar-view-toggle";
import { getCalendarHeaderText } from "@/lib/utils/calendar/date-utils";
import { useCalendarStore } from "@/lib/stores/calendar-store";

interface CalendarHeaderProps {
  activePlanName?: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onToggleView: () => void;
}

export function CalendarHeader({
  activePlanName,
  onPrevious,
  onNext,
  onToday,
  onToggleView
}: CalendarHeaderProps) {
  // Get state and actions from calendar store
  const { 
    currentDate,
    calendarView,
    calendarDisplayMode,
    setCalendarDisplayMode
  } = useCalendarStore();
  
  const headerText = getCalendarHeaderText(currentDate, calendarView as 'month' | 'week');

  return (
    <CardHeader>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="space-y-1">
          <CardTitle>{headerText}</CardTitle>
          <CardDescription>
            Your scheduled exercises{activePlanName ? ` and ${activePlanName} workout plan` : ''}
          </CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center mt-2 gap-2">
          <CalendarViewToggle 
            currentView={calendarDisplayMode}
            onViewChange={setCalendarDisplayMode}
            className="sm:order-first"
          />
          
          <div className="flex space-x-2 mb-2 sm:mb-0 mr-2">
            <Button onClick={onToday} variant="outline" size="sm">
              Today
            </Button>
            <Button onClick={onToggleView} variant="outline" size="sm">
              {calendarView === 'month'
                ? <><CalendarDays className="h-4 w-4 mr-2" /> Week View</>
                : <><CalendarIcon className="h-4 w-4 mr-2" /> Month View</>
              }
            </Button>
          </div>
          <div className="flex items-center mt-auto">
            <Button onClick={onPrevious} variant="outline" size="icon" className="rounded-r-none">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button onClick={onNext} variant="outline" size="icon" className="rounded-l-none border-l-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}
