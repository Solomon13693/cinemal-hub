import { cn } from '@/lib'
import { Skeleton, SkeletonLine } from './Skeleton'

const CARD_CLASS = 'rounded-2xl overflow-hidden'
const CARD_STYLE = { background: '#2A211A', border: '1px solid rgba(255,255,255,0.07)' } as const

export function MenuCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(CARD_CLASS, className)} style={CARD_STYLE} role="status" aria-label="Loading menu item">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <SkeletonLine height="h-4" width="w-3/4" />
        <SkeletonLine height="h-3" width="w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <SkeletonLine height="h-4" width="w-16" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function MenuGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <MenuCardSkeleton key={i} />
      ))}
    </div>
  )
}

function OrderRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <Skeleton className="size-10 rounded-xl shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <SkeletonLine height="h-4" width="w-2/5 max-w-[180px]" />
        <SkeletonLine height="h-3" width="w-3/5 max-w-[220px]" />
      </div>
      <SkeletonLine height="h-5" width="w-20" />
    </div>
  )
}

export function OrdersListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="divide-y divide-white/4">
      {Array.from({ length: count }).map((_, i) => (
        <OrderRowSkeleton key={i} />
      ))}
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl p-4" style={CARD_STYLE}>
      <div className="flex items-center justify-between mb-3">
        <SkeletonLine height="h-3" width="w-24" />
        <Skeleton className="size-7 rounded-lg shrink-0" />
      </div>
      <SkeletonLine height="h-6" width="w-20" className="mb-2" />
      <SkeletonLine height="h-3" width="w-28" />
    </div>
  )
}

export function StatsRowSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)} role="status" aria-label="Loading dashboard stats">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}
