'use client';

interface CalendarLegendProps {
  activePlanName: string;
}

export function CalendarLegend({ activePlanName }: CalendarLegendProps) {
  return (
    <div className="mb-4 p-3 bg-muted/30 rounded-lg">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="font-medium text-muted-foreground">Exercise Types:</span>
        <div className="flex items-center gap-2">
          <div className="inline-block px-2 py-1 bg-blue-100 border border-blue-500 text-blue-800 rounded-sm">
            Scheduled ({activePlanName})
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-block px-2 py-1 bg-blue-100 border border-blue-500 border-dashed text-blue-800 rounded-sm">
            Template ({activePlanName})
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-block px-2 py-1 bg-gray-100 border border-gray-400 text-gray-700 rounded-sm">
            Manual Exercises
          </div>
        </div>
      </div>
    </div>
  );
}
