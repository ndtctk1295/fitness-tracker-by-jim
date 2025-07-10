import { format } from 'date-fns';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import { EnrichedScheduledExercise, SortBy, SortOrder } from './types';

export const formatWeight = (weight: number, weightPlates?: Record<string, number>) => {
  if (weightPlates && Object.keys(weightPlates).length > 0) {
    const plateList = Object.entries(weightPlates)
      .filter(([_, count]) => count > 0)
      .map(([weight, count]) => `${count}x${weight}kg`)
      .join(', ');
    return `${weight}kg (${plateList})`;
  }
  return `${weight}kg`;
};

export const getSortIcon = (column: SortBy, sortBy: SortBy, sortOrder: SortOrder) => {
  if (sortBy !== column) return null;
  return sortOrder === 'asc' ? '↑' : '↓';
};

interface SortableHeaderProps {
  column: SortBy;
  children: React.ReactNode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSort: (column: SortBy) => void;
}

export function SortableHeader({ column, children, sortBy, sortOrder, onSort }: SortableHeaderProps) {
  return (
    <Button
      variant="ghost"
      className="h-auto p-0 font-medium"
      onClick={() => onSort(column)}
    >
      {children} {getSortIcon(column, sortBy, sortOrder)}
    </Button>
  );
}

interface ExerciseRowCellsProps {
  exercise: EnrichedScheduledExercise;
}

export function ExerciseRowCells({ exercise }: ExerciseRowCellsProps) {
  return (
    <>
      <TableCell>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {format(new Date(exercise.date), 'MMM dd, yyyy')}
        </div>
      </TableCell>
      <TableCell className="font-medium">
        {exercise.exerciseName}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: exercise.categoryColor }}
          />
          {exercise.categoryName}
        </div>
      </TableCell>
      <TableCell>{exercise.sets}</TableCell>
      <TableCell>{exercise.reps}</TableCell>
      <TableCell>
        {formatWeight(exercise.weight, exercise.weightPlates)}
      </TableCell>
      <TableCell>
        <Badge
          variant={exercise.completed ? 'default' : 'secondary'}
          className={exercise.completed ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
        >
          {exercise.completed ? (
            <><CheckCircle className="h-3 w-3 mr-1" /> Completed</>
          ) : (
            <><Clock className="h-3 w-3 mr-1" /> Pending</>
          )}
        </Badge>
      </TableCell>
      <TableCell>
        {exercise.notes ? (
          <div className="max-w-xs truncate" title={exercise.notes}>
            {exercise.notes}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
    </>
  );
}
