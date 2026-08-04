import { cn } from '@/lib'
import { Skeleton, SkeletonLine } from './Skeleton'

const CARD_CLASS = 'rounded-2xl overflow-hidden'
const CARD_STYLE = { background: 'rgba(26,29,36,0.8)', border: '1px solid rgba(255,255,255,0.07)' } as const

export function EventCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(CARD_CLASS, className)}
      style={CARD_STYLE}
      role="status"
      aria-label="Loading"
    >
      <Skeleton className="aspect-7/7 w-full max-h-72 rounded-none sm:max-h-80" />
      <div className="space-y-2 p-3.5">
        <SkeletonLine height="h-4" width="w-3/4" />
        <SkeletonLine height="h-3" width="w-1/2" />
      </div>
    </div>
  )
}

export function EventGridSkeleton({
  count = 6,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div
      className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5', className)}
      role="status"
      aria-label="Loading listings"
    >
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  )
}

/** @deprecated Prefer EventCardSkeleton */
export function MenuCardSkeleton({ className }: { className?: string }) {
  return <EventCardSkeleton className={className} />
}

/** @deprecated Prefer EventGridSkeleton */
export function MenuGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return <EventGridSkeleton count={count} className={className} />
}

function OrderRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <Skeleton className="size-10 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonLine height="h-4" width="w-2/5 max-w-[180px]" />
        <SkeletonLine height="h-3" width="w-3/5 max-w-[220px]" />
      </div>
      <SkeletonLine height="h-5" width="w-20" />
    </div>
  )
}

export function OrdersListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="divide-y divide-white/4" role="status" aria-label="Loading list">
      {Array.from({ length: count }).map((_, i) => (
        <OrderRowSkeleton key={i} />
      ))}
    </div>
  )
}

export function BookingsListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-white/6 bg-card-dark/60"
      role="status"
      aria-label="Loading bookings"
    >
      <OrdersListSkeleton count={count} />
    </div>
  )
}

export function SessionPickerSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2" role="status" aria-label="Loading sessions">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/8 bg-white/5 p-4"
        >
          <SkeletonLine height="h-4" width="w-2/3" />
          <SkeletonLine height="h-3" width="w-1/2" className="mt-2" />
        </div>
      ))}
    </div>
  )
}

export function DetailPageSkeleton() {
  return (
    <div className="container page-section" role="status" aria-label="Loading details">
      <SkeletonLine height="h-4" width="w-32" />
      <div className="mt-6 grid gap-8 md:grid-cols-2 md:items-start">
        <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
        <div className="space-y-4">
          <SkeletonLine height="h-8" width="w-3/4" />
          <SkeletonLine height="h-4" width="w-1/2" />
          <SkeletonLine height="h-3" width="w-full" />
          <SkeletonLine height="h-3" width="w-5/6" />
          <div className="pt-4">
            <SkeletonLine height="h-6" width="w-40" className="mb-4" />
            <SessionPickerSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SeatMapSkeleton() {
  return (
    <div className="container page-section space-y-6" role="status" aria-label="Loading seat map">
      <SkeletonLine height="h-8" width="w-48" />
      <SkeletonLine height="h-4" width="w-64" />
      <div className="mx-auto max-w-md">
        <Skeleton className="mb-6 h-8 w-full rounded-full" />
      </div>
      <div className="flex flex-col items-center gap-2">
        {Array.from({ length: 8 }).map((_, row) => (
          <div key={row} className="flex gap-1.5">
            {Array.from({ length: 12 }).map((_, seat) => (
              <Skeleton key={seat} className="size-8 rounded-md" />
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <Skeleton className="h-11 w-40 rounded-full" />
      </div>
    </div>
  )
}

export function PageSpinnerSkeleton({ label = 'Loading' }: { label?: string }) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4"
      role="status"
      aria-label={label}
    >
      <Skeleton className="size-10 rounded-full" />
      <SkeletonLine height="h-3" width="w-28" />
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <SkeletonLine height="h-3" width="w-24" className="mb-3" />
      <SkeletonLine height="h-7" width="w-20" />
    </div>
  )
}

export function StatsRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('grid grid-cols-2 gap-4 lg:grid-cols-5', className)}
      role="status"
      aria-label="Loading dashboard stats"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function AdminListSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonLine height="h-7" width="w-40" />
          <SkeletonLine height="h-3" width="w-56" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/6">
        <OrdersListSkeleton count={5} />
      </div>
    </div>
  )
}

export function AuthFormSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-md space-y-4 rounded-2xl border border-white/6 bg-card-dark/60 p-6"
      role="status"
      aria-label="Loading form"
    >
      <SkeletonLine height="h-7" width="w-40" />
      <SkeletonLine height="h-3" width="w-56" />
      <Skeleton className="h-11 w-full rounded-xl" />
      <Skeleton className="h-11 w-full rounded-xl" />
      <Skeleton className="h-11 w-full rounded-full" />
    </div>
  )
}
