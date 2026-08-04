'use client'

import React, { ReactNode } from 'react'
import { cn } from '@/lib'
import Label from './Label'
import ErrorMessage from './ErrorMessage'
import { sizeClasses, radiusClasses } from './constants'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string | ReactNode
  name: string
  className?: string
  formGroupClass?: string
  labelClassName?: string
  startContent?: ReactNode
  endContent?: ReactNode
  fullWidth?: boolean
  error?: string
  inputSize?: 'sm' | 'md' | 'lg'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  innerShadow?: boolean
  children?: ReactNode
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void
}

const Select: React.FC<SelectProps> = ({
  label,
  name,
  className,
  formGroupClass,
  labelClassName,
  startContent,
  endContent,
  fullWidth,
  error,
  inputSize = 'md',
  radius = 'md',
  innerShadow = false,
  children,
  value,
  onChange,
  onBlur,
  ...props
}) => (
  <div className={cn('form-group', formGroupClass, fullWidth && 'w-full')}>
    {label && <Label htmlFor={name} label={label} className={labelClassName} />}
    <div className="relative w-full">
      {startContent && (
        <div className="absolute left-3 inset-y-0 flex items-center">{startContent}</div>
      )}
      <select
        {...props}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={cn(
          'form-control appearance-none pr-8',
          sizeClasses[inputSize],
          radiusClasses[radius],
          startContent ? 'pl-9' : '',
          endContent ? 'pr-9' : '',
          error && 'is-invalid',
          className
        )}
      >
        {children}
      </select>
      {endContent && (
        <div className="absolute right-3 inset-y-0 flex items-center">{endContent}</div>
      )}
    </div>
    <ErrorMessage error={error} />
  </div>
)

export default Select
