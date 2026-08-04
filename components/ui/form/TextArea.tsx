'use client'

import React, { ReactNode } from 'react'
import { cn } from '@/lib'
import Label from './Label'
import ErrorMessage from './ErrorMessage'
import { sizeClasses, radiusClasses } from './constants'

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
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
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
}

const TextArea: React.FC<TextAreaProps> = ({
  label, name, className, formGroupClass, labelClassName,
  startContent, endContent, fullWidth, error,
  inputSize = 'md', radius = 'md', innerShadow = false,
  value, onChange, onBlur, ...props
}) => (
  <div className={cn('form-group', formGroupClass, fullWidth && 'w-full')}>
    {label && <Label htmlFor={name} label={label} className={labelClassName} />}
    <div className="relative w-full">
      {startContent && (
        <div className="absolute left-3 top-3 flex items-start">{startContent}</div>
      )}
      <textarea
        {...props}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={cn(
          'form-control',
          sizeClasses[inputSize],
          radiusClasses[radius],
          startContent ? 'pl-9' : '',
          endContent ? 'pr-9' : '',
          error && 'is-invalid',
          className
        )}
      />
      {endContent && (
        <div className="absolute right-3 top-3 flex items-start">{endContent}</div>
      )}
    </div>
    <ErrorMessage error={error} />
  </div>
)

export default TextArea
