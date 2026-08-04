'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib'
import { queryKeys } from '@/lib/query-keys'
import type { SeatType, VenuePayloadType, VenueType } from '@/types'

function rowLabel(index: number) {
  return String.fromCharCode(65 + index)
}

export async function generateSeatsForVenue(
  venueId: string,
  rows: number,
  seatsPerRow: number,
): Promise<void> {
  await supabase.from('seats').delete().eq('venue_id', venueId)

  const seats: Array<{
    venue_id: string
    row_label: string
    seat_number: number
    seat_type: 'standard' | 'vip'
  }> = []

  for (let r = 0; r < rows; r++) {
    const label = rowLabel(r)
    const isVip = r >= rows - 2
    for (let n = 1; n <= seatsPerRow; n++) {
      seats.push({
        venue_id: venueId,
        row_label: label,
        seat_number: n,
        seat_type: isVip ? 'vip' : 'standard',
      })
    }
  }

  const { error } = await supabase.from('seats').insert(seats)
  if (error) throw error
}

export async function getVenues(): Promise<VenueType[]> {
  const { data, error } = await supabase.from('venues').select('*').order('name')
  if (error) throw error
  return data ?? []
}

export async function getVenueById(id: string): Promise<VenueType | null> {
  const { data, error } = await supabase.from('venues').select('*').eq('id', id).single()
  if (error) return null
  return data
}

export async function getSeatsByVenue(venueId: string): Promise<SeatType[]> {
  const { data, error } = await supabase
    .from('seats')
    .select('*')
    .eq('venue_id', venueId)
    .order('row_label')
    .order('seat_number')
  if (error) throw error
  return data ?? []
}

export async function createVenue(payload: VenuePayloadType): Promise<VenueType> {
  const { data, error } = await supabase.from('venues').insert(payload).select().single()
  if (error) throw error
  await generateSeatsForVenue(data.id, payload.rows, payload.seats_per_row)
  return data
}

export async function updateVenue(
  id: string,
  payload: VenuePayloadType,
  regenerateSeats = true,
): Promise<VenueType> {
  const { data, error } = await supabase
    .from('venues')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  if (regenerateSeats) {
    await generateSeatsForVenue(id, payload.rows, payload.seats_per_row)
  }
  return data
}

export async function deleteVenue(id: string): Promise<void> {
  const { error } = await supabase.from('venues').delete().eq('id', id)
  if (error) throw error
}

export function useVenues() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: queryKeys.venues,
    queryFn: getVenues,
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.venues })
    return query.refetch()
  }

  return {
    venues: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refresh,
  }
}
