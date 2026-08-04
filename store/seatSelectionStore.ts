'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SEAT_SELECTION_STORAGE_KEY } from '@/constants'
import type { SeatSelectionItemType } from '@/types'

type SeatSelectionState = {
  sessionId: string | null
  eventTitle: string | null
  eventKind: 'movie' | 'event' | null
  startsAt: string | null
  venueName: string | null
  seats: SeatSelectionItemType[]
  setSelection: (payload: {
    sessionId: string
    eventTitle: string
    eventKind: 'movie' | 'event'
    startsAt: string
    venueName: string
    seats: SeatSelectionItemType[]
  }) => void
  clear: () => void
}

export const useSeatSelectionStore = create<SeatSelectionState>()(
  persist(
    set => ({
      sessionId: null,
      eventTitle: null,
      eventKind: null,
      startsAt: null,
      venueName: null,
      seats: [],
      setSelection: payload => set(payload),
      clear: () =>
        set({
          sessionId: null,
          eventTitle: null,
          eventKind: null,
          startsAt: null,
          venueName: null,
          seats: [],
        }),
    }),
    { name: SEAT_SELECTION_STORAGE_KEY },
  ),
)

export function seatSelectionTotal(seats: SeatSelectionItemType[]) {
  return seats.reduce((sum, seat) => sum + seat.price, 0)
}
