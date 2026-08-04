import { cn } from '@/lib'

/** Shared Tailwind skeleton surface — subtle pulse, no sliding shimmer. */
export const skeletonClassName = 'animate-pulse bg-white/[0.08]'

type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn(skeletonClassName, 'rounded-md', className)} aria-hidden />
}

type SkeletonLineProps = {
  className?: string
  height?: string
  width?: string
}

export function SkeletonLine({ className, height = 'h-4', width = 'w-full' }: SkeletonLineProps) {
  return <div className={cn(skeletonClassName, 'rounded-md', height, width, className)} aria-hidden />
}

type SkeletonCircleProps = {
  className?: string
  size?: string
}

export function SkeletonCircle({ className, size = 'size-10' }: SkeletonCircleProps) {
  return <div className={cn(skeletonClassName, 'rounded-full shrink-0', size, className)} aria-hidden />
}
