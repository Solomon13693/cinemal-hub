'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useAllBookings } from '@/services'
import { formatCurrency } from '@/utils'
import {
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_BADGE_CLASS,
  getAdminBookingDetailHref,
} from '@/constants'
import { cn } from '@/lib'
import { TabNavigation, DataTable, type Column } from '@/components/ui'
import type { BookingType, PaymentStatusType } from '@/types'

const PAYMENT_FILTERS: Array<{ key: PaymentStatusType | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'failed', label: 'Failed' },
]

const columns: Column[] = [
  { key: 'booking', title: 'Booking' },
  { key: 'event', title: 'Event' },
  { key: 'reference', title: 'Reference' },
  { key: 'amount', title: 'Amount' },
  { key: 'payment_status', title: 'Payment status' },
  { key: 'date', title: 'Date' },
]

export default function AdminPaymentsView() {
  const [activeStatus, setActiveStatus] = useState('all')
  const { bookings, loading } = useAllBookings()

  const filtered = useMemo(() => {
    if (activeStatus === 'all') return bookings
    return bookings.filter(b => b.payment_status === activeStatus)
  }, [bookings, activeStatus])

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">Payments</h1>
      <p className="mt-1 text-sm text-text-muted">
        Track payment references and statuses across bookings.
      </p>

      <div className="mt-6">
        <TabNavigation
          items={PAYMENT_FILTERS.map(f => ({ key: f.key, label: f.label }))}
          activeKey={activeStatus}
          onTabChange={setActiveStatus}
        />
      </div>

      <div className="mt-6">
        <DataTable<BookingType>
          columns={columns}
          data={filtered}
          loading={loading}
          rowKey={booking => booking.id}
          emptyMessage="No payments in this status."
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
              <td className="px-6 py-4 text-xs font-mono text-text-grey">
                {booking.payment_reference ?? '—'}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-primary">
                {formatCurrency(Number(booking.total_amount))}
              </td>
              <td className="px-6 py-4">
                <span
                  className={cn(
                    'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold',
                    PAYMENT_STATUS_BADGE_CLASS[booking.payment_status],
                  )}
                >
                  {PAYMENT_STATUS_LABEL[booking.payment_status]}
                </span>
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
