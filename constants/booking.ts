import type { BookingStatusType, PaymentStatusType } from '@/types'

export const BOOKING_STATUS_LABEL: Record<BookingStatusType, string> = {
  pending: 'Pending payment',
  paid: 'Confirmed',
  cancelled: 'Cancelled',
  used: 'Used',
}

export const BOOKING_STATUS_BADGE_CLASS: Record<BookingStatusType, string> = {
  pending: 'bg-warning/10 text-warning',
  paid: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
  used: 'bg-blue/10 text-blue',
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatusType, string> = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
}

export const PAYMENT_STATUS_BADGE_CLASS: Record<PaymentStatusType, string> = {
  pending: 'bg-warning/10 text-warning',
  paid: 'bg-success/10 text-success',
  failed: 'bg-danger/10 text-danger',
}

export const BOOKING_STATUS_FILTERS: Array<{ key: BookingStatusType | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'used', label: 'Used' },
]

export const EVENT_SUBTYPE_LABEL = {
  concert: 'Concert',
  theatre: 'Theatre',
  comedy: 'Comedy',
  sports: 'Sports',
  other: 'Other',
} as const

export const HOLD_MINUTES = 10
