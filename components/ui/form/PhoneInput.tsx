'use client'

import React, { ReactNode } from 'react'
import PhoneInput from 'react-phone-number-input'
import { CountryCode } from 'libphonenumber-js'
import 'react-phone-number-input/style.css'
import { cn } from '@/lib'
import Label from './Label'
import ErrorMessage from './ErrorMessage'
import { sizeClasses, radiusClasses } from './constants'

interface PhoneNumberInputProps {
  label?: string | ReactNode
  name?: string
  className?: string
  formGroupClass?: string
  labelClassName?: string
  disabled?: boolean
  fullWidth?: boolean
  inputSize?: 'sm' | 'md' | 'lg'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  innerShadow?: boolean
  error?: string
  placeholder?: string
  country?: CountryCode
  /** When set, only these countries appear in the selector (e.g. `['NG']`). */
  countries?: CountryCode[]
  /** Lock to `country` — no country picker, fixed calling code. */
  lockCountry?: boolean
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  label, name, className, formGroupClass, labelClassName,
  disabled, fullWidth, inputSize = 'md', radius = 'md',
  innerShadow = false, error,
  placeholder = 'Enter phone number',
  country = 'NG',
  countries,
  lockCountry = false,
  value = '', onChange, onBlur, ...props
}) => {
  const handleChange = (phoneValue: string | undefined) => onChange?.(phoneValue || '')
  const allowedCountries = countries ?? (lockCountry ? [country] : undefined)

  return (
    <div className={cn('form-group', formGroupClass, fullWidth && 'w-full')}>
      {label && <Label htmlFor={name} label={label} className={labelClassName} />}
      <PhoneInput
        {...props}
        international
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        defaultCountry={country}
        countries={allowedCountries}
        countryCallingCodeEditable={!lockCountry}
        addInternationalOption={false}
        placeholder={placeholder}
        className={cn(
          'form-control',
          lockCountry && 'PhoneInput--locked-country',
          sizeClasses[inputSize],
          radiusClasses[radius],
          error && 'is-invalid',
          className
        )}
      />
      <ErrorMessage error={error} />
    </div>
  )
}

export default PhoneNumberInput
