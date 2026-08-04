'use client'

import { useCallback } from 'react'
import { useToastStore, type ToastColor } from '@/store'

export const useToast = () => {
  const push = useToastStore(state => state.push)

  const showToast = useCallback(
    (title: string, description?: string, color: ToastColor = 'primary') => {
      push({ title, description, color })
    },
    [push],
  )

  const showSuccess = useCallback(
    (title: string, description?: string) => showToast(title, description, 'success'),
    [showToast],
  )

  const showError = useCallback(
    (title: string, description?: string) => showToast(title, description, 'danger'),
    [showToast],
  )

  return { showToast, showSuccess, showError }
}
