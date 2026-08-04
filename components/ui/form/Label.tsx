import { cn } from '@/lib'
import React, { ReactNode } from 'react'

interface LabelProps {
  htmlFor?: string
  label: string | ReactNode
  className?: string
}

const Label: React.FC<LabelProps> = ({ htmlFor, label, className }) => {
  const isReactNode = typeof label !== 'string'
  return (
    <label
      htmlFor={htmlFor}
      className={cn('form-label', isReactNode && 'flex items-center gap-1', className)}
    >
      {label}
    </label>
  )
}

export default Label
