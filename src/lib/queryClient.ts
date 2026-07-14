import { QueryClient } from '@tanstack/react-query'

/**
 * 앱 전역 QueryClient
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      networkMode: 'always',
    },
  },
})
