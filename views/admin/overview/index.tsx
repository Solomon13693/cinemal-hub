'use client'

import Link from 'next/link'
import {
  useAllBookings,
  useCustomers,
  useEvents,
  useSessions,
} from '@/services'
import {
  BRAND,
  getAdminBookingDetailHref,
  ROUTES,
} from '@/constants'
import { formatCurrency, formatDateTime } from '@/utils'
import { BookingStatusBadge } from '@/components/booking'
import { OrdersListSkeleton, StatsRowSkeleton } from '@/components/ui'

export default function AdminOverviewView() {
  const { events: movies, loading: moviesLoading } = useEvents({ kind: 'movie' })
  const { events, loading: eventsLoading } = useEvents({ kind: 'event' })
  const { bookings, loading: bookingsLoading } = useAllBookings()
  const { customers, loading: customersLoading } = useCustomers()
  const { sessions, loading: sessionsLoading } = useSessions({ upcomingOnly: true })

  const loading =
    moviesLoading || eventsLoading || bookingsLoading || customersLoading || sessionsLoading

  const revenue = bookings
    .filter(b => b.payment_status === 'paid' || b.status === 'paid' || b.status === 'used')
    .reduce((sum, b) => sum + Number(b.total_amount), 0)

  const stats = [
    { label: 'Movies', value: movies.length },
    { label: 'Events', value: events.length },
    { label: 'Bookings', value: bookings.length },
    { label: 'Customers', value: customers.length },
    { label: 'Revenue', value: formatCurrency(revenue) },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">Dashboard</h1>
      <p className="mt-1 text-sm text-text-muted">Overview of {BRAND.name} activity.</p>

      <div className="mt-6">
        {loading ? (
          <StatsRowSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {stats.map(stat => (
              <div key={stat.label} className="stat-card">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-grey">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-off-white">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-white/6 bg-card-dark/60">
          <div className="border-b border-white/6 px-5 py-4">
            <h2 className="text-sm font-semibold text-off-white">Recent bookings</h2>
          </div>
          {loading ? (
            <OrdersListSkeleton count={5} />
          ) : bookings.length === 0 ? (
            <p className="p-10 text-center text-sm text-text-grey">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-white/6">
              {bookings.slice(0, 8).map(booking => (
                <li key={booking.id}>
                  <Link
                    href={getAdminBookingDetailHref(booking.id)}
                    className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-white/3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-off-white">
                        {booking.sessions?.events?.title ?? booking.booking_number}
                      </p>
                      <p className="text-xs text-text-grey">
                        {new Date(booking.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-bold text-primary">
                        {formatCurrency(Number(booking.total_amount))}
                      </span>
                      <BookingStatusBadge status={booking.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/6 bg-card-dark/60">
          <div className="border-b border-white/6 px-5 py-4">
            <h2 className="text-sm font-semibold text-off-white">Upcoming sessions</h2>
          </div>
          {loading ? (
            <div className="px-5 py-2">
              <OrdersListSkeleton count={5} />
            </div>
          ) : sessions.length === 0 ? (
            <p className="p-10 text-center text-sm text-text-grey">No upcoming sessions.</p>
          ) : (
            <ul className="divide-y divide-white/6">
              {sessions.slice(0, 8).map(session => (
                <li key={session.id} className="px-5 py-3">
                  <p className="text-sm font-semibold text-off-white">
                    {session.events?.title ?? 'Session'}
                  </p>
                  <p className="mt-0.5 text-xs text-text-grey">
                    {formatDateTime(session.starts_at)} · {session.venues?.name ?? 'Venue'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-text-grey">
        Manage listings in{' '}
        <Link href={ROUTES.adminMovies} className="font-semibold text-primary hover:underline">
          Movies
        </Link>{' '}
        or{' '}
        <Link href={ROUTES.adminEvents} className="font-semibold text-primary hover:underline">
          Events
        </Link>
        .
      </p>
    </div>
  )
}
