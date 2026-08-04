'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useCustomer, useMyBookings } from '@/services'
import { formatCurrency } from '@/utils'
import { getAdminBookingDetailHref, ROUTES } from '@/constants'
import { BookingStatusBadge } from '@/components/booking'
import { OrdersListSkeleton, Skeleton, SkeletonLine } from '@/components/ui'

export default function AdminCustomerDetailView() {
  const { id } = useParams<{ id: string }>()
  const { customer, loading } = useCustomer(id)
  const { bookings, loading: bookingsLoading } = useMyBookings(id)

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonLine height="h-8" width="w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center">
        <p className="text-lg font-semibold text-off-white">Customer not found</p>
        <Link
          href={ROUTES.adminCustomers}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeftIcon className="size-4" />
          Back to customers
        </Link>
      </div>
    )
  }

  const totalSpent = bookings
    .filter(b => b.status === 'paid' || b.status === 'used')
    .reduce((sum, b) => sum + Number(b.total_amount), 0)

  return (
    <div>
      <Link
        href={ROUTES.adminCustomers}
        className="inline-flex items-center gap-2 text-sm font-medium text-text-grey transition-colors hover:text-off-white"
      >
        <ArrowLeftIcon className="size-4" />
        Back to customers
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">{customer.name}</h1>
          <p className="mt-1 text-sm text-text-grey">
            Customer since {new Date(customer.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-grey">Phone</p>
          <p className="mt-2 text-sm font-semibold text-off-white">{customer.phone ?? '—'}</p>
        </div>
        <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-grey">
            Total bookings
          </p>
          <p className="mt-2 text-lg font-bold text-off-white">
            {bookingsLoading ? '…' : bookings.length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-grey">
            Total spent
          </p>
          <p className="mt-2 text-lg font-bold text-primary">
            {bookingsLoading ? '…' : formatCurrency(totalSpent)}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/6 bg-card-dark/60">
        <div className="border-b border-white/6 px-5 py-4">
          <h2 className="text-sm font-semibold text-off-white">Booking history</h2>
          <p className="mt-0.5 text-xs text-text-grey">Everything this customer has booked</p>
        </div>

        {bookingsLoading ? (
          <OrdersListSkeleton count={4} />
        ) : bookings.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-text-grey">No bookings yet.</p>
        ) : (
          <div className="divide-y divide-white/4">
            {bookings.map(booking => (
              <Link
                key={booking.id}
                href={getAdminBookingDetailHref(booking.id)}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-white/3"
              >
                <div>
                  <p className="text-sm font-semibold text-off-white">
                    {booking.booking_number}
                  </p>
                  <p className="mt-0.5 text-xs text-text-grey">
                    {booking.sessions?.events?.title ?? 'Booking'} ·{' '}
                    {new Date(booking.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold text-primary">
                    {formatCurrency(Number(booking.total_amount))}
                  </p>
                  <BookingStatusBadge status={booking.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
