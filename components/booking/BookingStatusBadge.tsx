import { BOOKING_STATUS_BADGE_CLASS, BOOKING_STATUS_LABEL } from '@/constants'
import { cn } from '@/lib'
import { formatCurrency, formatDateTime } from '@/utils'
import type { BookingType } from '@/types'

export function BookingStatusBadge({ status }: { status: BookingType['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold',
        BOOKING_STATUS_BADGE_CLASS[status],
      )}
    >
      {BOOKING_STATUS_LABEL[status]}
    </span>
  )
}

export function TicketCard({ booking }: { booking: BookingType }) {
  const event = booking.sessions?.events
  const venue = booking.sessions?.venues
  const seats = booking.booking_seats ?? []

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-card-dark to-true-black shadow-card print:border print:border-black print:bg-white print:text-black">
      <div className="gradient-primary px-6 py-4 print:bg-black">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">CinemaHub Ticket</p>
        <h2 className="mt-1 font-display text-xl font-bold text-white">
          {event?.title ?? 'Booking'}
        </h2>
        <p className="mt-1 text-sm text-white/80">
          {event?.kind === 'movie' ? 'Movie' : 'Event'} · {booking.booking_number}
        </p>
      </div>

      <div className="space-y-4 px-6 py-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-text-grey print:text-gray-500">Date & time</p>
            <p className="text-sm font-medium text-off-white print:text-black">
              {booking.sessions?.starts_at
                ? formatDateTime(booking.sessions.starts_at)
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-grey print:text-gray-500">Venue</p>
            <p className="text-sm font-medium text-off-white print:text-black">
              {venue?.name ?? event?.venue_label ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-grey print:text-gray-500">Seats</p>
            <p className="text-sm font-medium text-off-white print:text-black">
              {seats
                .map(s => `${s.seats?.row_label ?? ''}${s.seats?.seat_number ?? ''}`)
                .filter(Boolean)
                .join(', ') || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-grey print:text-gray-500">Total</p>
            <p className="text-sm font-medium text-off-white print:text-black">
              {formatCurrency(Number(booking.total_amount))}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-center print:border-black print:bg-gray-50">
          <p className="font-mono text-2xl font-bold tracking-[0.25em] text-off-white print:text-black">
            {booking.booking_number}
          </p>
          <p className="mt-2 text-xs text-text-muted print:text-gray-500">
            Present this code at the entrance
          </p>
        </div>
      </div>
    </div>
  )
}
