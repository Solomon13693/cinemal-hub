'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ROUTES, BRAND } from '@/constants'
import { loginAdmin } from '@/services'
import { useToast } from '@/hooks'
import { getErrorMessage } from '@/utils'
import { Button, Input, PasswordInput } from '@/components/ui'
import type { LoginPayloadType } from '@/types'

const schema: yup.ObjectSchema<LoginPayloadType> = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
})

const AdminLoginView = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showSuccess, showError } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayloadType>({ resolver: yupResolver(schema) })

  const onSubmit = async (values: LoginPayloadType) => {
    setSubmitting(true)
    try {
      await loginAdmin(values)
      showSuccess('Welcome back', 'Admin console ready.')
      const redirect = searchParams.get('redirect')
      router.replace(redirect && redirect.startsWith('/admin') ? redirect : ROUTES.admin)
      router.refresh()
    } catch (error) {
      showError('Sign in failed', getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4">
      <h1 className="text-center font-display text-2xl font-bold text-off-white">Admin sign in</h1>
      <p className="mt-1 text-center text-sm text-text-muted">
        Staff access to manage movies, events, and bookings at {BRAND.name}.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <Input label="Email" type="email" fullWidth {...register('email')} error={errors.email?.message} />
        <PasswordInput label="Password" fullWidth {...register('password')} error={errors.password?.message} />

        <Button type="submit" loading={submitting} fullWidth className="mt-2">
          Sign In
        </Button>
      </form>
    </div>
  )
}

export default AdminLoginView
