'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib'
import { useToastStore, type ToastColor } from '@/store'

const COLOR_CLASSES: Record<ToastColor, string> = {
  primary: 'border-primary/30 bg-primary/10 text-off-white',
  success: 'border-success/30 bg-success/10 text-off-white',
  danger: 'border-danger/30 bg-danger/10 text-off-white',
  warning: 'border-warning/30 bg-warning/10 text-off-white',
}

export default function ToastContainer() {
  const toasts = useToastStore(state => state.toasts)
  const dismiss = useToastStore(state => state.dismiss)

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-stretch">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={cn(
              'pointer-events-auto w-full min-w-[min(100%,20rem)] max-w-md rounded-xl border p-4 shadow-lg backdrop-blur sm:w-96',
              COLOR_CLASSES[toast.color],
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description && <p className="mt-0.5 text-xs text-text-muted">{toast.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
                className="shrink-0 text-text-grey hover:text-off-white"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
