'use client'

import { cn } from '@/lib'
import type { SeatAvailabilityType, SeatSelectionItemType } from '@/types'

type SeatMapProps = {
  seats: SeatAvailabilityType[]
  selected: SeatSelectionItemType[]
  basePrice: number
  vipPrice: number
  onToggle: (seat: SeatAvailabilityType, price: number) => void
}

export default function SeatMap({
  seats,
  selected,
  basePrice,
  vipPrice,
  onToggle,
}: SeatMapProps) {
  const selectedIds = new Set(selected.map(s => s.seatId))
  const rows = Array.from(new Set(seats.map(s => s.row_label))).sort()

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-md">
        <div className="mb-6 rounded-full bg-gradient-to-b from-white/20 to-transparent px-8 py-2 text-center text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
          Screen / Stage
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex min-w-full flex-col items-center gap-2 px-2">
          {rows.map(row => {
            const rowSeats = seats
              .filter(s => s.row_label === row)
              .sort((a, b) => a.seat_number - b.seat_number)

            return (
              <div key={row} className="flex items-center gap-2">
                <span className="w-5 text-center text-xs font-mono text-text-grey">{row}</span>
                <div className="flex gap-1.5">
                  {rowSeats.map(seat => {
                    const price = seat.seat_type === 'vip' ? vipPrice : basePrice
                    const isSelected = selectedIds.has(seat.id)
                    const disabled = seat.is_taken

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onToggle(seat, price)}
                        className={cn(
                          'seat',
                          disabled && 'seat-taken',
                          !disabled && isSelected && 'seat-selected',
                          !disabled &&
                            !isSelected &&
                            (seat.seat_type === 'vip' ? 'seat-vip' : 'seat-available'),
                        )}
                        title={`${seat.row_label}${seat.seat_number} · ${seat.seat_type}`}
                      >
                        {seat.seat_number}
                      </button>
                    )
                  })}
                </div>
                <span className="w-5 text-center text-xs font-mono text-text-grey">{row}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="seat seat-available size-5" /> Available
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="seat seat-vip size-5" /> VIP
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="seat seat-selected size-5" /> Selected
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="seat seat-taken size-5" /> Taken
        </span>
      </div>
    </div>
  )
}
