import { cn } from '@/lib'
import React from 'react'

interface ErrorMessageProps {
  error?: string
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  if (!error) return null
  return <div className={cn('text-danger text-[12px] mt-1.5 tracking-wide')}>{error}</div>
}

export default ErrorMessage
