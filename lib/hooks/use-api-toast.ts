'use client';

import { useCallback } from 'react';
import { useToast } from '@/lib/hooks/use-toast';

/**
 * A utility hook to handle toast notifications for API operations
 * Enhanced to match shadcn/ui v3 conventions while preserving custom functionality
 */
export const useApiToast = () => {
  const { toast } = useToast();

  const showSuccessToast = useCallback((message: string, description?: string) => {
    toast({
      title: description ? message : 'Success',
      description: description || message,
      className: 'bg-green-50 border-green-200 text-muted-foreground',
    });
  }, [toast]);

  const showErrorToast = useCallback((title: string, description?: string, error?: any) => {
    toast({
      title: title,
      description: description || 'An unexpected error occurred',
      variant: 'destructive',
      duration: 7000, // Show error messages slightly longer
    });
    if (error) {
      console.error(title, description, error);
    }
  }, [toast]);

  const showInfoToast = useCallback((title: string, description?: string) => {
    toast({
      title: title,
      description: description,
    });
  }, [toast]);

  const showWarningToast = useCallback((title: string, description?: string) => {
    toast({
      title: title,
      description: description,
      className: 'bg-amber-50 border-amber-200',
    });
  }, [toast]);

  return {
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    showWarningToast,
    // For direct access to the base toast function
    toast
  };
};
