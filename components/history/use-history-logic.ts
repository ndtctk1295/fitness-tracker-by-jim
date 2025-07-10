'use client';

import { useState, useMemo } from 'react';
import { EnrichedScheduledExercise, HistoryFilters, HistoryStats, SortBy } from './types';

interface UseHistoryLogicProps {
  enrichedExercises: EnrichedScheduledExercise[];
}

export function useHistoryLogic({ enrichedExercises }: UseHistoryLogicProps) {
  // Filter states
  const [filters, setFilters] = useState<HistoryFilters>({
    statusFilter: 'all',
    categoryFilter: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Calculate stats
  const stats = useMemo((): HistoryStats => {
    const total = enrichedExercises.length;
    const completed = enrichedExercises.filter(ex => ex.completed).length;
    const pending = enrichedExercises.filter(ex => !ex.completed).length;
    const categories = new Set(enrichedExercises.map(ex => ex.categoryId)).size;

    return { total, completed, pending, categories };
  }, [enrichedExercises]);

  // Apply filters and sorting
  const filteredExercises = useMemo(() => {
    let filtered = [...enrichedExercises];

    // Apply status filter
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(exercise => {
        if (filters.statusFilter === 'completed') return exercise.completed === true;
        if (filters.statusFilter === 'pending') return exercise.completed !== true;
        return true;
      });
    }

    // Apply category filter
    if (filters.categoryFilter !== 'all') {
      filtered = filtered.filter(exercise => exercise.categoryId === filters.categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'exercise':
          comparison = a.exerciseName.localeCompare(b.exerciseName);
          break;
        case 'category':
          comparison = a.categoryName.localeCompare(b.categoryName);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [enrichedExercises, filters]);

  const handleFiltersChange = (newFilters: Partial<HistoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSort = (column: SortBy) => {
    if (filters.sortBy === column) {
      setFilters(prev => ({
        ...prev,
        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        sortBy: column,
        sortOrder: 'desc'
      }));
    }
  };

  return {
    filters,
    stats,
    filteredExercises,
    handleFiltersChange,
    handleSort,
  };
}
