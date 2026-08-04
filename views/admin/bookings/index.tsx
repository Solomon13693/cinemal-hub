'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAllBookings, updateBookingStatus } from '@/services'
import { useToast } from '@/hooks'
import { formatCurrency } from '@/utils'
import {
  BOOKING_STATUS_FILTERS,
  BOOKING_STATUS_LABEL,
  getAdminBookingDetailHref,
  getAdminCustomerDetailHref,
} from '@/constants'
import { TabNavigation, DataTable, type Column } from '@/components/ui'
import { BookingStatusBadge } from '@/components/booking'
import type { BookingStatusType, BookingType } from '@/types'

const columns: Column[] = [
  { key: 'booking', title: 'Booking' },
  { key: 'event', title: 'Event' },
  { key: 'customer', title: 'Customer' },
  { key: 'amount', title: 'Amount' },
  { key: 'status', title: 'Status' },
  { key: 'date', title: 'Date' },
]

const STATUS_OPTIONS: BookingStatusType[] = ['pending', 'paid', 'cancelled', 'used']

export default function AdminBookingsView() {
  const [activeStatus, setActiveStatus] = useState('all')
  const { bookings, loading, refresh } = useAllBookings(
    activeStatus === 'all' ? undefined : (activeStatus as BookingStatusType),
  )
  const { showSuccess, showError } = useToast()

  const handleStatusChange = async (booking: BookingType, status: BookingStatusType) => {
    if (status === booking.status) return
    try {
      await updateBookingStatus(booking.id, status)
      showSuccess('Booking status updated')
      refresh()
    } catch (error) {
      showError('Update failed', error instanceof Error ? error.message : 'Please try again.')
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">Bookings</h1>
      <p className="mt-1 text-sm text-text-muted">View and update customer bookings.</p>

      <div className="mt-6">
        <TabNavigation
          items={BOOKING_STATUS_FILTERS.map(f => ({ key: f.key, label: f.label }))}
          activeKey={activeStatus}
          onTabChange={setActiveStatus}
        />
      </div>

      <div className="mt-6">
        <DataTable<BookingType>
          columns={columns}
          data={bookings}
          loading={loading}
          rowKey={booking => booking.id}
          emptyMessage="No bookings in this status."
          renderRow={booking => (
            <>
              <td className="px-6 py-4">
                <Link
                  href={getAdminBookingDetailHref(booking.id)}
                  className="group block"
                >
                  <p className="text-sm font-semibold text-off-white group-hover:text-primary">
                    {booking.booking_number}
                  </p>
                </Link>
              </td>
              <td className="px-6 py-4 text-sm text-text-muted">
                {booking.sessions?.events?.title ?? '—'}
              </td>
              <td className="px-6 py-4">
                {booking.profiles ? (
                  <Link
                    href={getAdminCustomerDetailHref(booking.profiles.id)}
                    className="group block"
                  >
                    <p className="text-sm font-medium text-off-white group-hover:text-primary">
                      {booking.profiles.name}
                    </p>
                    <p className="text-xs text-text-grey">{booking.profiles.phone ?? '—'}</p>
                  </Link>
                ) : (
                  <span className="text-sm text-text-grey">Unknown</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-primary">
                {formatCurrency(Number(booking.total_amount))}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <BookingStatusBadge status={booking.status} />
                  <select
                    value={booking.status}
                    onChange={e =>
                      handleStatusChange(booking, e.target.value as BookingStatusType)
                    }
                    className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-off-white"
                  >
                    {STATUS_OPTIONS.map(option => (
                      <option key={option} value={option}>
                        {BOOKING_STATUS_LABEL[option]}
                      </option>
                    ))}
                  </select>
                </div>
              </td>
              <td className="px-6 py-4 text-xs text-text-grey">
                {new Date(booking.created_at).toLocaleString()}
              </td>
            </>
          )}
        />
      </div>
    </div>
  )
}
