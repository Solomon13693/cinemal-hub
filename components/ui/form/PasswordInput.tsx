'use client'

import React, { ReactNode, useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib'
import Label from './Label'
import ErrorMessage from './ErrorMessage'
import { sizeClasses, radiusClasses } from './constants'

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string | ReactNode
  name: string
  className?: string
  formGroupClass?: string
  labelClassName?: string
  startContent?: ReactNode
  endContent?: ReactNode
  fullWidth?: boolean
  inputSize?: 'sm' | 'md' | 'lg'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  innerShadow?: boolean
  error?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  name,
  className,
  formGroupClass,
  labelClassName,
  startContent,
  endContent,
  fullWidth,
  inputSize = 'md',
  radius = 'md',
  error,
  value,
  onChange,
  onBlur,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={cn('form-group', formGroupClass, fullWidth && 'w-full')}>
      {label && <Label htmlFor={name} label={label} className={labelClassName} />}
      <div className="relative w-full">
        {startContent && (
          <div className="absolute left-3 inset-y-0 flex items-center">{startContent}</div>
        )}
        <input
          {...props}
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={cn(
            'form-control',
            sizeClasses[inputSize],
            radiusClasses[radius],
            startContent ? 'pl-9' : '',
            endContent ? 'pr-16' : 'pr-11',
            error && 'is-invalid',
            className,
          )}
        />
        {endContent && (
          <div className="absolute right-9 inset-y-0 flex items-center">{endContent}</div>
        )}
        <button
          type="button"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          onClick={() => setShowPassword(current => !current)}
          className="absolute right-3 inset-y-0 flex items-center text-text-grey hover:text-off-white transition-colors"
        >
          {showPassword ? <EyeSlashIcon className="size-[18px]" /> : <EyeIcon className="size-[18px]" />}
        </button>
      </div>
      <ErrorMessage error={error} />
    </div>
  )
}

export default PasswordInput
