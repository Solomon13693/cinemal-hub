import Link from 'next/link'
import { cn } from '@/lib'

type EmptyStateProps = {
  title: string
  description?: string
  action?: { label: string; href: string }
  icon?: string
  className?: string
}

export default function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div className={cn('container empty-state text-center', className)}>
      <div className="mx-auto max-w-sm">
        {icon && <p className="text-4xl">{icon}</p>}
        <h1 className={cn('font-display text-xl font-bold text-off-white sm:text-2xl', icon && 'mt-3')}>
          {title}
        </h1>
        {description && <p className="mt-1.5 text-sm text-text-muted">{description}</p>}
        {action && (
          <Link
            href={action.href}
            className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  )
}
