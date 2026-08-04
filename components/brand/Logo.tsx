import { cn } from '@/lib'
import { BRAND } from '@/constants'
import LogoMark from './LogoMark'

type LogoProps = {
  className?: string
  showWordmark?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { icon: 40, text: 'text-sm' },
  md: { icon: 48, text: 'text-base' },
  lg: { icon: 56, text: 'text-lg' },
} as const

export default function Logo({ className, showWordmark = true, size = 'md' }: LogoProps) {
  const { icon, text } = sizeMap[size]

  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <LogoMark size={icon} />
      {showWordmark && (
        <span className={cn('font-display font-bold tracking-tight text-off-white', text)}>
          <span className="text-off-white">Cinema</span>
          <span className="text-primary">Hub</span>
        </span>
      )}
      <span className="sr-only">{BRAND.name}</span>
    </span>
  )
}
