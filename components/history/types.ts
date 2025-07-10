export interface EnrichedScheduledExercise {
  id: string;
  exerciseId: string;
  categoryId: string;
  date: string;
  sets: number;
  reps: number;
  weight: number;
  weightPlates?: Record<string, number>;
  notes?: string;
  completed?: boolean;
  completedAt?: string;
  exerciseName: string;
  categoryName: string;
  categoryColor: string;
}

export type StatusFilter = 'all' | 'completed' | 'pending';
export type SortBy = 'date' | 'exercise' | 'category';
export type SortOrder = 'asc' | 'desc';

export interface HistoryFilters {
  statusFilter: StatusFilter;
  categoryFilter: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

export interface HistoryStats {
  total: number;
  completed: number;
  pending: number;
  categories: number;
}
