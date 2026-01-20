'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection (formerly cacheTime)
            refetchOnWindowFocus: false, // Don't refetch on window focus
            refetchOnMount: true, // Refetch on mount to ensure fresh data
            retry: (failureCount, error) => {
              // Don't retry on configuration errors
              if (error instanceof Error && (
                error.message.includes('not configured') ||
                error.message.includes('not available') ||
                error.message.includes('Supabase client is null')
              )) {
                return false;
              }
              // Retry up to 2 times for network errors
              return failureCount < 2;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Add timeout to prevent infinite loading
            networkMode: 'online',
            // Don't keep queries in loading state forever
            throwOnError: false, // Don't throw errors, just mark as error state
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
