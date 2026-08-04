'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth, useSession, useSessionSeats } from '@/services'
import { useSeatSelectionStore } from '@/store'
import { ROUTES } from '@/constants'
import { formatCurrency } from '@/utils'
import { SeatMap } from '@/components/seat'
import { Button, EmptyState } from '@/components/ui'
import type { SeatAvailabilityType, SeatSelectionItemType } from '@/types'

export default function BookView() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { session, loading: sessionLoading } = useSession(sessionId)
  const { seats, loading: seatsLoading } = useSessionSeats(sessionId)
  const setSelection = useSeatSelectionStore(state => state.setSelection)
  const [selected, setSelected] = useState<SeatSelectionItemType[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(`/book/${sessionId}`)
      router.replace(`${ROUTES.login}?redirect=${redirect}`)
    }
  }, [authLoading, isAuthenticated, router, sessionId])

  if (!authLoading && !isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to book seats"
        action={{ label: 'Go to Login', href: ROUTES.login }}
      />
    )
  }

  if (sessionLoading || seatsLoading || authLoading) {
    return (
      <div className="container page-section">
        <p className="text-sm text-text-grey">Loading seat map…</p>
      </div>
    )
  }

  if (!session) {
    return (
      <EmptyState title="Session not found" action={{ label: 'Browse movies', href: ROUTES.movies }} />
    )
  }

  const event = session.events
  const basePrice = Number(session.base_price)
  const vipPrice = Number(session.vip_price)
  const total = selected.reduce((sum, seat) => sum + seat.price, 0)

  const onToggle = (seat: SeatAvailabilityType, price: number) => {
    setSelected(current => {
      const exists = current.find(s => s.seatId === seat.id)
      if (exists) return current.filter(s => s.seatId !== seat.id)
      return [
        ...current,
        {
          seatId: seat.id,
          rowLabel: seat.row_label,
          seatNumber: seat.seat_number,
          seatType: seat.seat_type,
          price,
        },
      ]
    })
  }

  const continueToCheckout = () => {
    if (!selected.length || !event) return
    setSelection({
      sessionId: session.id,
      eventTitle: event.title,
      eventKind: event.kind,
      startsAt: session.starts_at,
      venueName: session.venues?.name ?? event.venue_label ?? 'Venue',
      seats: selected,
    })
    router.push(ROUTES.checkout)
  }

  return (
    <div className="container page-section">
      <h1 className="font-display text-3xl font-bold text-off-white">Select seats</h1>
      <p className="mt-2 text-sm text-text-muted">
        {event?.title ?? 'Session'} · {session.venues?.name ?? 'Venue'}
      </p>

      <div className="mt-8">
        <SeatMap
          seats={seats}
          selected={selected}
          basePrice={basePrice}
          vipPrice={vipPrice}
          onToggle={onToggle}
        />
      </div>

      <div className="sticky bottom-4 mt-8 rounded-2xl border border-white/10 bg-card-dark/95 p-4 shadow-xl backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-text-muted">
              {selected.length === 0
                ? 'No seats selected'
                : selected.map(s => `${s.rowLabel}${s.seatNumber}`).join(', ')}
            </p>
            <p className="mt-1 text-lg font-bold text-primary">{formatCurrency(total)}</p>
          </div>
          <Button onClick={continueToCheckout} disabled={selected.length === 0}>
            Continue to checkout
          </Button>
        </div>
      </div>
    </div>
  )
}
