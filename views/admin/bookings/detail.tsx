'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useBooking, updateBookingStatus } from '@/services'
import { useToast } from '@/hooks'
import {
  ROUTES,
  BOOKING_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_BADGE_CLASS,
  getAdminCustomerDetailHref,
} from '@/constants'
import { formatCurrency, formatDateTime } from '@/utils'
import { cn } from '@/lib'
import { BookingStatusBadge, TicketCard } from '@/components/booking'
import { Skeleton, SkeletonLine } from '@/components/ui'
import type { BookingStatusType } from '@/types'

const STATUS_OPTIONS: BookingStatusType[] = ['pending', 'paid', 'cancelled', 'used']

export default function AdminBookingDetailView() {
  const { id } = useParams<{ id: string }>()
  const { booking, loading, refresh } = useBooking(id)
  const { showSuccess, showError } = useToast()
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (status: BookingStatusType) => {
    if (!booking || status === booking.status) return
    setUpdating(true)
    try {
      await updateBookingStatus(booking.id, status)
      await refresh()
      showSuccess('Booking status updated')
    } catch (error) {
      showError('Update failed', error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonLine height="h-8" width="w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center">
        <p className="text-lg font-semibold text-off-white">Booking not found</p>
        <Link
          href={ROUTES.adminBookings}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeftIcon className="size-4" />
          Back to bookings
        </Link>
      </div>
    )
  }

  const seats = booking.booking_seats ?? []
  const event = booking.sessions?.events

  return (
    <div>
      <Link
        href={ROUTES.adminBookings}
        className="inline-flex items-center gap-2 text-sm font-medium text-text-grey transition-colors hover:text-off-white"
      >
        <ArrowLeftIcon className="size-4" />
        Back to bookings
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">
            {booking.booking_number}
          </h1>
          <p className="mt-1 text-sm text-text-grey">
            Placed {new Date(booking.created_at).toLocaleString()}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-grey">Status</p>
          <div className="mt-2">
            <select
              value={booking.status}
              disabled={updating}
              onChange={e => handleStatusChange(e.target.value as BookingStatusType)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-off-white"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {BOOKING_STATUS_LABEL[option]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-grey">Total</p>
          <p className="mt-2 text-lg font-bold text-primary">
            {formatCurrency(Number(booking.total_amount))}
          </p>
        </div>

        <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-grey">Payment</p>
          <span
            className={cn(
              'mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold',
              PAYMENT_STATUS_BADGE_CLASS[booking.payment_status],
            )}
          >
            {PAYMENT_STATUS_LABEL[booking.payment_status]}
          </span>
          {booking.payment_reference && (
            <p className="mt-2 break-all text-xs text-text-grey">
              Ref: {booking.payment_reference}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-grey">When</p>
          <p className="mt-2 text-sm font-semibold text-off-white">
            {booking.sessions?.starts_at ? formatDateTime(booking.sessions.starts_at) : '—'}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TicketCard booking={booking} />

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-5 text-sm text-text-muted">
            <h2 className="mb-3 text-sm font-semibold text-off-white">Customer</h2>
            {booking.profiles ? (
              <>
                <p>
                  <span className="font-semibold text-off-white">Name:</span>{' '}
                  <Link
                    href={getAdminCustomerDetailHref(booking.profiles.id)}
                    className="font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    {booking.profiles.name}
                  </Link>
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-off-white">Phone:</span>{' '}
                  {booking.profiles.phone ?? '—'}
                </p>
              </>
            ) : (
              <p className="text-text-grey">Customer profile unavailable.</p>
            )}
          </div>

          <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-5">
            <h2 className="mb-3 text-sm font-semibold text-off-white">Event & seats</h2>
            <p className="text-sm text-text-muted">
              <span className="font-semibold text-off-white">Event:</span>{' '}
              {event?.title ?? '—'}
              {event?.kind ? ` (${event.kind === 'movie' ? 'Movie' : 'Event'})` : ''}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              <span className="font-semibold text-off-white">Venue:</span>{' '}
              {booking.sessions?.venues?.name ?? event?.venue_label ?? '—'}
            </p>
            <div className="mt-3 space-y-2">
              {seats.length === 0 ? (
                <p className="text-sm text-text-grey">No seats attached.</p>
              ) : (
                seats.map(seat => (
                  <div
                    key={seat.id}
                    className="flex items-center justify-between border-b border-white/5 pb-2 text-sm last:border-0 last:pb-0"
                  >
                    <span className="text-off-white">
                      {seat.seats?.row_label}
                      {seat.seats?.seat_number}
                      {seat.seats?.seat_type === 'vip' ? ' (VIP)' : ''}
                    </span>
                    <span className="text-primary">{formatCurrency(Number(seat.price))}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
