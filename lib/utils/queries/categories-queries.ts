import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/lib/services/clients-service';
import { Category } from '@/lib/types';
import { queryKeys } from './query-keys';

const apiToStoreCategory = (category: Category) => ({
  id: category._id,
  name: category.name,
  color: category.color || '#6366F1',
  createdBy: category.createdBy,
  updatedBy: category.updatedBy,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});

export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories.all(),
    queryFn: async () => {
      const categories = await categoryService.getAll();
      return categories.map(apiToStoreCategory);
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    refetchOnReconnect: false,
    retry: 1,
  });
};
