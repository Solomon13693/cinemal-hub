import { create } from 'zustand'

export type ToastColor = 'success' | 'danger' | 'warning' | 'primary'

export type ToastItem = {
  id: string
  title: string
  description?: string
  color: ToastColor
}

type ToastState = {
  toasts: ToastItem[]
  push: (toast: Omit<ToastItem, 'id'>) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>(set => ({
  toasts: [],

  push: toast => {
    const id = crypto.randomUUID()
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }))
    window.setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
    }, 6000)
  },

  dismiss: id => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}))
