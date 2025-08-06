
"use client";

import AppLayout from '@/components/layouts/app-layout';
import { StoreWrapper } from '@/components/shared/store-wrapper';
import { ClientOnly } from '@/components/shared/client-only';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
// This layout wraps all protected routes that require authentication

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000, // Cache queries for 10 minutes (increased from 5)
        retry: 1, // Retry failed requests once
        refetchOnWindowFocus: false, // Disable refetch on window focus
        refetchOnMount: false, // Disable refetch on mount if data exists
        refetchOnReconnect: false, // Disable refetch on reconnect
        refetchInterval: false, // Disable automatic polling
        retryOnMount: false, // Don't retry on mount
      },
    },
  }));
  
  return (
    <ClientOnly fallback={<div>Loading...</div>}>
      <QueryClientProvider client={queryClient}>
        <AppLayout>
          <StoreWrapper>
            {children}
          </StoreWrapper>
        </AppLayout>
      </QueryClientProvider>
    </ClientOnly>
  );
}
