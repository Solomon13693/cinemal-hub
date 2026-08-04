import type { EventType } from './event.type'
import type { SeatType, VenueType } from './venue.type'

export type SessionStatusType = 'scheduled' | 'cancelled' | 'completed'

export type SessionType = {
  id: string
  event_id: string
  venue_id: string
  starts_at: string
  base_price: number
  vip_price: number
  status: SessionStatusType
  created_at: string
  events?: EventType | null
  venues?: VenueType | null
}

export type SessionPayloadType = {
  event_id: string
  venue_id: string
  starts_at: string
  base_price: number
  vip_price: number
  status?: SessionStatusType
}

export type SeatAvailabilityType = SeatType & {
  is_taken: boolean
}
