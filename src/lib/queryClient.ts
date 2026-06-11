import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutes stale time to avoid excessive network refetching
      staleTime: 5 * 60 * 1000,
      // Cache data for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests once, instead of three times, to reduce loading time under error
      retry: 1,
      // Disable automatic window focus refetching to prevent unexpected layout shifts
      refetchOnWindowFocus: false,
      // Suppress refetching on reconnect by default
      refetchOnReconnect: false,
    },
    mutations: {
      // Standardize mutation error handling
      onError: (error: any) => {
        console.error('Global Mutation Error:', error.message || error);
      },
    },
  },
});
