'use client'

import { useId } from 'react'
import { cn } from '@/lib'

type LogoMarkProps = {
  size?: number
  className?: string
}

export default function LogoMark({ size = 48, className }: LogoMarkProps) {
  const uid = useId().replace(/:/g, '')
  const bg = `ch-bg-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={bg} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FB7185" />
          <stop stopColor="#BE123C" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={`url(#${bg})`} />
      <rect x="1.5" y="1.5" width="61" height="61" rx="12.5" stroke="white" strokeOpacity="0.18" />
      {/* Ticket stub */}
      <rect x="14" y="20" width="36" height="24" rx="4" fill="#F5F5F7" fillOpacity="0.95" />
      <circle cx="14" cy="32" r="4" fill={`url(#${bg})`} />
      <circle cx="50" cy="32" r="4" fill={`url(#${bg})`} />
      <path d="M32 22v20" stroke="#E11D48" strokeWidth="1.5" strokeDasharray="2 3" />
      <rect x="18" y="26" width="10" height="3" rx="1" fill="#E11D48" opacity="0.8" />
      <rect x="18" y="32" width="8" height="2" rx="1" fill="#71717A" opacity="0.5" />
      <rect x="36" y="26" width="10" height="12" rx="2" fill="#E11D48" opacity="0.15" />
    </svg>
  )
}
