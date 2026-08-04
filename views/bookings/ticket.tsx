'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeftIcon, PrinterIcon } from '@heroicons/react/24/outline'
import { useAuth, useBooking } from '@/services'
import { getBookingDetailHref, ROUTES } from '@/constants'
import { TicketCard } from '@/components/booking'
import { Button, EmptyState, Skeleton } from '@/components/ui'

export default function TicketView() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { booking, loading } = useBooking(id)

  if (!authLoading && !isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to view your ticket"
        action={{ label: 'Go to Login', href: ROUTES.login }}
      />
    )
  }

  if (loading || authLoading) {
    return (
      <div className="container page-section">
        <Skeleton className="mx-auto h-80 max-w-lg rounded-3xl" />
      </div>
    )
  }

  if (!booking) {
    return (
      <EmptyState title="Ticket not found" action={{ label: 'My bookings', href: ROUTES.bookings }} />
    )
  }

  if (booking.status !== 'paid' && booking.status !== 'used') {
    return (
      <EmptyState
        title="Ticket not available yet"
        description="This booking is not confirmed. Complete payment to unlock your e-ticket."
        action={{ label: 'View booking', href: getBookingDetailHref(booking.id) }}
      />
    )
  }

  return (
    <div className="container page-section">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={getBookingDetailHref(booking.id)}
          className="inline-flex items-center gap-2 text-sm font-medium text-text-grey transition-colors hover:text-off-white"
        >
          <ArrowLeftIcon className="size-4" />
          Back to booking
        </Link>
        <Button
          type="button"
          color="secondary"
          variant="bordered"
          startContent={<PrinterIcon className="size-4" />}
          onClick={() => window.print()}
        >
          Print ticket
        </Button>
      </div>

      <div className="mx-auto max-w-lg">
        <TicketCard booking={booking} />
      </div>
    </div>
  )
}
