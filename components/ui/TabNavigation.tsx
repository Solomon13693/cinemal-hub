'use client'

import { cn } from '@/lib'

export type TabNavigationItem = {
  key: string
  label: string
}

type Props = {
  items: TabNavigationItem[]
  activeKey: string
  onTabChange: (key: string) => void
  className?: string
}

export default function TabNavigation({ items, activeKey, onTabChange, className }: Props) {
  return (
    <div className={cn('border-b', className)} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {items.map(tab => {
          const isActive = activeKey === tab.key

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                'relative shrink-0 px-5 py-2.5 text-xs font-semibold transition-colors',
                isActive ? 'text-primary bg-primary/10' : 'text-text-grey hover:text-off-white hover:bg-white/3',
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
