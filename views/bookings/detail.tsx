'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useAuth, useBooking } from '@/services'
import { getTicketHref, ROUTES } from '@/constants'
import { formatCurrency, formatDateTime } from '@/utils'
import { BookingStatusBadge } from '@/components/booking'
import { EmptyState, Skeleton, SkeletonLine } from '@/components/ui'

export default function BookingDetailView() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { booking, loading } = useBooking(id)

  if (!authLoading && !isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to view this booking"
        action={{ label: 'Go to Login', href: ROUTES.login }}
      />
    )
  }

  if (loading || authLoading) {
    return (
      <div className="container page-section space-y-4">
        <SkeletonLine height="h-8" width="w-48" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  if (!booking) {
    return (
      <EmptyState title="Booking not found" action={{ label: 'My bookings', href: ROUTES.bookings }} />
    )
  }

  const seats = booking.booking_seats ?? []
  const event = booking.sessions?.events

  return (
    <div className="container page-section">
      <Link
        href={ROUTES.bookings}
        className="inline-flex items-center gap-2 text-sm font-medium text-text-grey transition-colors hover:text-off-white"
      >
        <ArrowLeftIcon className="size-4" />
        Back to bookings
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-off-white">
            {event?.title ?? booking.booking_number}
          </h1>
          <p className="mt-1 text-sm text-text-muted">{booking.booking_number}</p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-grey">When</p>
          <p className="mt-2 text-sm font-semibold text-off-white">
            {booking.sessions?.starts_at ? formatDateTime(booking.sessions.starts_at) : '—'}
          </p>
        </div>
        <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-grey">Venue</p>
          <p className="mt-2 text-sm font-semibold text-off-white">
            {booking.sessions?.venues?.name ?? event?.venue_label ?? '—'}
          </p>
        </div>
        <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-grey">Seats</p>
          <p className="mt-2 text-sm font-semibold text-off-white">
            {seats
              .map(s => `${s.seats?.row_label ?? ''}${s.seats?.seat_number ?? ''}`)
              .filter(Boolean)
              .join(', ') || '—'}
          </p>
        </div>
        <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-grey">Total</p>
          <p className="mt-2 text-sm font-bold text-primary">
            {formatCurrency(Number(booking.total_amount))}
          </p>
        </div>
      </div>

      {(booking.status === 'paid' || booking.status === 'used') && (
        <Link
          href={getTicketHref(booking.id)}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          View ticket
        </Link>
      )}
    </div>
  )
}
