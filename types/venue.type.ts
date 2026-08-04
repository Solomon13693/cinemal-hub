export type SeatTypeType = 'standard' | 'vip'

export type VenueType = {
  id: string
  name: string
  rows: number
  seats_per_row: number
  created_at: string
}

export type VenuePayloadType = {
  name: string
  rows: number
  seats_per_row: number
}

export type SeatType = {
  id: string
  venue_id: string
  row_label: string
  seat_number: number
  seat_type: SeatTypeType
}
