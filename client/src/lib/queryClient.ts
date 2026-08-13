import { QueryClient } from '@tanstack/react-query'

// Central QueryClient. Defaults are conservative on purpose: LeadDash reads
// come from Firestore/our own API, not from polling DataCrazy, so we don't
// need aggressive refetching — see architecture notes in the project README.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
