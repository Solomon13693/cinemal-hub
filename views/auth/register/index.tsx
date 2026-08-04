'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ROUTES, BRAND } from '@/constants'
import { registerCustomer } from '@/services'
import { useToast } from '@/hooks'
import { getErrorMessage } from '@/utils'
import { Button, Input, PasswordInput, PhoneInput } from '@/components/ui'
import type { RegisterPayloadType } from '@/types'

const schema: yup.ObjectSchema<RegisterPayloadType> = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  password: yup.string().min(6, 'At least 6 characters').required('Password is required'),
})

const RegisterView = () => {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPayloadType>({ resolver: yupResolver(schema) })

  const onSubmit = async (values: RegisterPayloadType) => {
    setSubmitting(true)
    try {
      const result = await registerCustomer(values)
      if (result.needsEmailConfirmation) {
        showSuccess('Check your email', 'Confirm your account, then sign in.')
      } else {
        showSuccess('Account created', 'You can now sign in and book seats.')
      }
      router.replace(ROUTES.login)
    } catch (error) {
      showError('Registration failed', getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4">
      <h1 className="font-display text-center text-2xl font-bold text-off-white">
        Create your account
      </h1>
      <p className="mt-1 text-center text-sm text-text-muted">
        Join {BRAND.name} to reserve movie and event seats.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <Input label="Full name" fullWidth {...register('name')} error={errors.name?.message} />
        <Input
          label="Email"
          type="email"
          fullWidth
          {...register('email')}
          error={errors.email?.message}
        />
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <PhoneInput
              label="Phone number"
              name="phone"
              fullWidth
              lockCountry
              country="NG"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.phone?.message}
            />
          )}
        />
        <PasswordInput
          label="Password"
          fullWidth
          {...register('password')}
          error={errors.password?.message}
        />

        <Button type="submit" loading={submitting} fullWidth className="mt-2">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Already have an account?{' '}
        <Link href={ROUTES.login} className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default RegisterView
