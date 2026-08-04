'use client'

import { useEffect, type ReactElement, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib'

const sizeClasses: Record<string, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  full: 'max-w-[calc(100vw-2rem)]',
}

const placementClasses: Record<string, string> = {
  center: 'items-center justify-center',
  auto: 'items-center justify-center',
  top: 'items-start justify-center pt-16',
  'top-center': 'items-start justify-center pt-16',
  bottom: 'items-end justify-center pb-16',
  'bottom-center': 'items-end justify-center pb-16',
}

const backdropClasses: Record<string, string> = {
  opaque: 'bg-black/60',
  blur: 'bg-black/40 backdrop-blur-sm',
  transparent: 'bg-transparent',
}

const radiusClasses: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  '2xl': 'rounded-3xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-3xl',
}

const PopupModal = ({
  isOpen,
  onClose,
  size,
  backdrops,
  placement,
  className,
  name,
  children,
  showCloseButton = true,
  title,
  icon,
  footer,
  radius = 'lg',
  isDismissable = true,
  isKeyboardDismissDisabled,
  headerClassName = 'p-4',
  bodyClassName = 'p-4',
  footerClassName = 'p-4',
}: {
  isOpen: boolean
  onClose: () => void
  className?: string
  name?: string
  children?: string | ReactElement | ReactNode | ReactElement[] | ReactNode[]
  backdrops?: 'opaque' | 'blur' | 'transparent'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full'
  placement?: 'center' | 'auto' | 'top' | 'top-center' | 'bottom' | 'bottom-center'
  showCloseButton?: boolean
  title?: string | ReactNode
  icon?: ReactNode
  footer?: ReactNode
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  isDismissable?: boolean
  isKeyboardDismissDisabled?: boolean
  headerClassName?: string
  bodyClassName?: string
  footerClassName?: string
}) => {
  const keyboardDismissDisabled = isKeyboardDismissDisabled ?? !isDismissable

  useEffect(() => {
    if (!isOpen) return

    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !keyboardDismissDisabled) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, keyboardDismissDisabled, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          id={name ?? undefined}
          className={cn('fixed inset-0 z-50 flex p-4', placementClasses[placement ?? 'center'])}
        >
          <motion.div
            className={cn('absolute inset-0', backdropClasses[backdrops ?? 'opaque'])}
            onClick={isDismissable ? onClose : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              'relative z-10 flex max-h-full w-full flex-col overflow-hidden border border-white/8 bg-[#211A15] shadow-xl',
              sizeClasses[size ?? 'lg'],
              radiusClasses[radius],
              className,
            )}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {title && (
              <div
                className={cn(
                  'relative flex items-center justify-between border-b border-white/6 bg-white/3',
                  headerClassName,
                )}
              >
                <div className="flex items-center gap-2 pr-8">
                  {icon && <span className="shrink-0">{icon}</span>}
                  <h2 className="text-sm font-semibold text-off-white">{title}</h2>
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="rounded-full p-1.5 text-text-grey transition-colors hover:bg-white/10 hover:text-off-white"
                  >
                    <XMarkIcon className="size-4" />
                  </button>
                )}
              </div>
            )}

            <div className={cn('flex-1 overflow-y-auto', bodyClassName, !title && 'p-0')}>
              {children}
            </div>

            {footer && (
              <div className={cn('border-t border-white/6 bg-white/3', footerClassName)}>
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default PopupModal
