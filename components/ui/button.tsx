'use client'

import React from 'react'
import { cn } from '@/lib'

type CustomButtonColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
type NormalSizes = 'sm' | 'md' | 'lg'
type ButtonVariants = 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost'

interface CustomButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'onClick'> {
  isDisabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  color?: CustomButtonColor
  size?: NormalSizes
  className?: string
  loading?: boolean
  children?: React.ReactNode
  startContent?: React.ReactNode
  endContent?: React.ReactNode
  variant?: ButtonVariants
  fullWidth?: boolean
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full'
}

const sizeClasses: Record<NormalSizes, string> = {
  sm: 'h-9 px-3 text-xs gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
}

const radiusClasses: Record<NonNullable<CustomButtonProps['radius']>, string> = {
  none: 'rounded-none',
  sm: 'rounded-md',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
}

const colorVariantClasses: Record<CustomButtonColor, Record<ButtonVariants, string>> = {
  primary: {
    solid: 'bg-primary text-white hover:bg-primary-dark',
    shadow: 'bg-primary text-white shadow-glow hover:bg-primary-dark',
    bordered: 'border border-primary text-primary bg-transparent hover:bg-primary/10',
    faded: 'border border-primary/30 text-primary bg-primary/10 hover:bg-primary/15',
    flat: 'bg-primary/10 text-primary hover:bg-primary/15',
    light: 'bg-transparent text-primary hover:bg-primary/10',
    ghost: 'bg-transparent text-primary border border-transparent hover:border-primary/40',
  },
  default: {
    solid: 'bg-white/10 text-off-white hover:bg-white/15',
    shadow: 'bg-white/10 text-off-white shadow-default hover:bg-white/15',
    bordered: 'border border-white/15 text-off-white bg-transparent hover:bg-white/5',
    faded: 'border border-white/10 text-off-white bg-white/5 hover:bg-white/10',
    flat: 'bg-white/5 text-off-white hover:bg-white/10',
    light: 'bg-transparent text-text-muted hover:bg-white/5 hover:text-off-white',
    ghost: 'bg-transparent text-off-white border border-transparent hover:border-white/20',
  },
  secondary: {
    solid: 'bg-secondary text-off-white hover:bg-surface-2',
    shadow: 'bg-secondary text-off-white shadow-default hover:bg-surface-2',
    bordered: 'border border-white/15 text-off-white bg-transparent hover:bg-white/5',
    faded: 'border border-white/10 text-off-white bg-white/5 hover:bg-white/10',
    flat: 'bg-white/5 text-off-white hover:bg-white/10',
    light: 'bg-transparent text-text-muted hover:bg-white/5 hover:text-off-white',
    ghost: 'bg-transparent text-off-white border border-transparent hover:border-white/20',
  },
  success: {
    solid: 'bg-success text-white hover:brightness-110',
    shadow: 'bg-success text-white shadow-default hover:brightness-110',
    bordered: 'border border-success text-success bg-transparent hover:bg-success/10',
    faded: 'border border-success/30 text-success bg-success/10 hover:bg-success/15',
    flat: 'bg-success/10 text-success hover:bg-success/15',
    light: 'bg-transparent text-success hover:bg-success/10',
    ghost: 'bg-transparent text-success border border-transparent hover:border-success/40',
  },
  warning: {
    solid: 'bg-warning text-true-black hover:brightness-110',
    shadow: 'bg-warning text-true-black shadow-default hover:brightness-110',
    bordered: 'border border-warning text-warning bg-transparent hover:bg-warning/10',
    faded: 'border border-warning/30 text-warning bg-warning/10 hover:bg-warning/15',
    flat: 'bg-warning/10 text-warning hover:bg-warning/15',
    light: 'bg-transparent text-warning hover:bg-warning/10',
    ghost: 'bg-transparent text-warning border border-transparent hover:border-warning/40',
  },
  danger: {
    solid: 'bg-danger text-white hover:brightness-110',
    shadow: 'bg-danger text-white shadow-default hover:brightness-110',
    bordered: 'border border-danger text-danger bg-transparent hover:bg-danger/10',
    faded: 'border border-danger/30 text-danger bg-danger/10 hover:bg-danger/15',
    flat: 'bg-danger/10 text-danger hover:bg-danger/15',
    light: 'bg-transparent text-danger hover:bg-danger/10',
    ghost: 'bg-transparent text-danger border border-transparent hover:border-danger/40',
  },
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn('animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

const Button: React.FC<CustomButtonProps> = ({
  type = 'button',
  isDisabled = false,
  onClick,
  color = 'primary',
  size = 'md',
  className,
  loading = false,
  children,
  startContent,
  endContent,
  variant = 'solid',
  fullWidth = false,
  radius = 'md',
  ...rest
}) => {
  const disabled = isDisabled || loading

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center font-medium tracking-wide',
        'transition-all duration-300 ease-in-out',
        'hover:scale-[0.97] transform origin-center',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100',
        sizeClasses[size],
        radiusClasses[radius],
        colorVariantClasses[color][variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Spinner className="size-4" />
      ) : (
        <>
          {startContent}
          {children}
          {endContent}
        </>
      )}
    </button>
  )
}

export default Button
