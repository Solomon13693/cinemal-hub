'use client'

import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth, updateProfile } from '@/services'
import { ROUTES } from '@/constants'
import { getErrorMessage } from '@/utils'
import { useToast } from '@/hooks'
import { Button, EmptyState, Input, PhoneInput } from '@/components/ui'

type ProfileFormValues = {
  name: string
  phone: string
}

const schema: yup.ObjectSchema<ProfileFormValues> = yup.object({
  name: yup.string().required('Name is required'),
  phone: yup.string().required('Phone number is required'),
})

export default function ProfileView() {
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth()
  const { showSuccess, showError } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({ resolver: yupResolver(schema) })

  useEffect(() => {
    if (profile) {
      reset({ name: profile.name, phone: profile.phone ?? '' })
    }
  }, [profile, reset])

  if (!authLoading && !isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to manage your profile"
        action={{ label: 'Go to Login', href: ROUTES.login }}
      />
    )
  }

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return
    setSubmitting(true)
    try {
      await updateProfile(user.id, { name: values.name, phone: values.phone })
      showSuccess('Profile updated')
    } catch (error) {
      showError('Update failed', getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container page-section">
      <h1 className="font-display text-3xl font-bold text-off-white">Profile</h1>
      <p className="mt-2 text-sm text-text-muted">Update your name and phone number.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 max-w-md">
        <Input
          label="Email"
          name="email"
          fullWidth
          value={user?.email ?? ''}
          disabled
        />
        <Input label="Full name" fullWidth {...register('name')} error={errors.name?.message} />
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
        <Button type="submit" loading={submitting} className="mt-2">
          Save changes
        </Button>
      </form>
    </div>
  )
}
