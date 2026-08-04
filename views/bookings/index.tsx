'use client'

import Link from 'next/link'
import { useAuth, useMyBookings } from '@/services'
import { getBookingDetailHref, getTicketHref, ROUTES } from '@/constants'
import { formatCurrency, formatDateTime } from '@/utils'
import { BookingStatusBadge } from '@/components/booking'
import { BookingsListSkeleton, EmptyState } from '@/components/ui'

export default function BookingsView() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { bookings, loading } = useMyBookings(user?.id)

  if (!authLoading && !isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to view your bookings"
        action={{ label: 'Go to Login', href: ROUTES.login }}
      />
    )
  }

  return (
    <div className="container page-section">
      <h1 className="font-display text-3xl font-bold text-off-white">My Bookings</h1>
      <p className="mt-2 text-sm text-text-muted">Tickets and reservations you have made.</p>

      <div className="mt-6">
        {loading || authLoading ? (
          <BookingsListSkeleton />
        ) : bookings.length === 0 ? (
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-card-dark/60 px-6 py-10 text-center">
            <p className="text-sm text-text-grey">You haven&apos;t booked any seats yet.</p>
            <Link href={ROUTES.movies} className="mt-3 inline-block text-sm font-semibold text-primary">
              Browse movies →
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-card-dark/60 divide-y divide-white/4">
            {bookings.map(booking => (
              <div
                key={booking.id}
                className="flex flex-wrap items-center gap-4 px-6 py-4 transition-colors hover:bg-white/3"
              >
                <Link href={getBookingDetailHref(booking.id)} className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-off-white">
                    {booking.sessions?.events?.title ?? booking.booking_number}
                  </p>
                  <p className="mt-0.5 text-xs text-text-grey">
                    {booking.sessions?.starts_at
                      ? formatDateTime(booking.sessions.starts_at)
                      : new Date(booking.created_at).toLocaleString()}{' '}
                    · {booking.booking_number}
                  </p>
                </Link>
                <p className="shrink-0 text-sm font-bold text-primary">
                  {formatCurrency(Number(booking.total_amount))}
                </p>
                <BookingStatusBadge status={booking.status} />
                {(booking.status === 'paid' || booking.status === 'used') && (
                  <Link
                    href={getTicketHref(booking.id)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Ticket
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
