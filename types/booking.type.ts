import type { EventType } from './event.type'
import type { SeatType } from './venue.type'
import type { SessionType } from './session.type'
import type { ProfileType } from './auth.type'

export type BookingStatusType = 'pending' | 'paid' | 'cancelled' | 'used'
export type PaymentMethodType = 'paystack'
export type PaymentStatusType = 'pending' | 'paid' | 'failed'

export type BookingSeatType = {
  id: string
  booking_id: string
  seat_id: string
  session_id: string
  price: number
  seats?: SeatType | null
}

export type BookingType = {
  id: string
  booking_number: string
  user_id: string
  session_id: string
  status: BookingStatusType
  total_amount: number
  payment_method: PaymentMethodType
  payment_status: PaymentStatusType
  payment_reference: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
  sessions?: SessionType | null
  booking_seats?: BookingSeatType[]
  profiles?: Pick<ProfileType, 'id' | 'name' | 'phone'> | null
}

export type PlaceBookingPayloadType = {
  session_id: string
  seat_ids: string[]
}

export type SeatSelectionItemType = {
  seatId: string
  rowLabel: string
  seatNumber: number
  seatType: 'standard' | 'vip'
  price: number
}
