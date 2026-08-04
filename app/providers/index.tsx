'use client'

import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from '@/components'
import { createQueryClient } from '@/lib/query-client'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastContainer />
    </QueryClientProvider>
  )
}
