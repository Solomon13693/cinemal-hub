'use client'

import { QueryClient } from '@tanstack/react-query'

const STALE_TIME_MS = 5 * 60 * 1000
const GC_TIME_MS = 30 * 60 * 1000

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        gcTime: GC_TIME_MS,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  })
}
