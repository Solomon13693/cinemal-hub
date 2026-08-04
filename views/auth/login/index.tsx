'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ROUTES } from '@/constants'
import { loginCustomer } from '@/services'
import { useToast } from '@/hooks'
import { getErrorMessage } from '@/utils'
import { Button, Input, PasswordInput } from '@/components/ui'
import type { LoginPayloadType } from '@/types'

const schema: yup.ObjectSchema<LoginPayloadType> = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
})

const LoginView = () => {
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
      await loginCustomer(values)
      showSuccess('Welcome back', 'You are signed in.')
      const redirect = searchParams.get('redirect')
      router.replace(redirect && !redirect.startsWith('/admin') ? redirect : ROUTES.home)
      router.refresh()
    } catch (error) {
      showError('Sign in failed', getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4">
      <h1 className="text-center font-display text-2xl font-bold text-off-white">Welcome back</h1>
      <p className="mt-1 text-center text-sm text-text-muted">Sign in to book tickets.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <Input label="Email" type="email" fullWidth {...register('email')} error={errors.email?.message} />
        <PasswordInput label="Password" fullWidth {...register('password')} error={errors.password?.message} />

        <Button type="submit" loading={submitting} fullWidth className="mt-2">
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Don&apos;t have an account?{' '}
        <Link href={ROUTES.register} className="font-semibold text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}

export default LoginView
