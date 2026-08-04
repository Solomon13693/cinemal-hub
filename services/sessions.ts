'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib'
import { queryKeys } from '@/lib/query-keys'
import type { SeatAvailabilityType, SessionPayloadType, SessionType } from '@/types'

const SESSION_SELECT =
  '*, events(*, categories(id, name, slug)), venues(id, name, rows, seats_per_row)'

export async function getSessions(filter: {
  eventId?: string
  upcomingOnly?: boolean
} = {}): Promise<SessionType[]> {
  let query = supabase
    .from('sessions')
    .select(SESSION_SELECT)
    .order('starts_at', { ascending: true })

  if (filter.eventId) query = query.eq('event_id', filter.eventId)
  if (filter.upcomingOnly) {
    query = query.gte('starts_at', new Date().toISOString()).eq('status', 'scheduled')
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getSessionById(id: string): Promise<SessionType | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select(SESSION_SELECT)
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function createSession(payload: SessionPayloadType): Promise<SessionType> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({ ...payload, status: payload.status ?? 'scheduled' })
    .select(SESSION_SELECT)
    .single()
  if (error) throw error
  return data
}

export async function updateSession(
  id: string,
  payload: Partial<SessionPayloadType>,
): Promise<SessionType> {
  const { data, error } = await supabase
    .from('sessions')
    .update(payload)
    .eq('id', id)
    .select(SESSION_SELECT)
    .single()
  if (error) throw error
  return data
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from('sessions').delete().eq('id', id)
  if (error) throw error
}

/** Release expired pending bookings so seats free up. */
export async function releaseExpiredHolds(sessionId?: string): Promise<void> {
  const now = new Date().toISOString()
  let query = supabase
    .from('bookings')
    .select('id')
    .eq('status', 'pending')
    .lt('expires_at', now)

  if (sessionId) query = query.eq('session_id', sessionId)

  const { data } = await query
  const ids = (data ?? []).map(row => row.id)
  if (!ids.length) return
  // Delete so booking_seats cascade and unique (session_id, seat_id) frees up
  await supabase.from('bookings').delete().in('id', ids)
}

export async function getSessionSeatAvailability(
  sessionId: string,
): Promise<SeatAvailabilityType[]> {
  await releaseExpiredHolds(sessionId)

  const session = await getSessionById(sessionId)
  if (!session) return []

  const { data: seats, error: seatsError } = await supabase
    .from('seats')
    .select('*')
    .eq('venue_id', session.venue_id)
    .order('row_label')
    .order('seat_number')
  if (seatsError) throw seatsError

  const { data: taken, error: takenError } = await supabase
    .from('booking_seats')
    .select('seat_id, bookings!inner(status, expires_at)')
    .eq('session_id', sessionId)
  if (takenError) throw takenError

  const now = Date.now()
  const takenIds = new Set(
    (taken ?? [])
      .filter(row => {
        const booking = row.bookings as unknown as {
          status: string
          expires_at: string | null
        }
        if (booking.status === 'paid' || booking.status === 'used') return true
        if (booking.status === 'pending') {
          if (!booking.expires_at) return true
          return new Date(booking.expires_at).getTime() > now
        }
        return false
      })
      .map(row => row.seat_id),
  )

  return (seats ?? []).map(seat => ({
    ...seat,
    is_taken: takenIds.has(seat.id),
  }))
}

export function useSessions(filter: { eventId?: string; upcomingOnly?: boolean } = {}) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: queryKeys.sessions(filter),
    queryFn: () => getSessions(filter),
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.sessions(filter) })
    return query.refetch()
  }

  return {
    sessions: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refresh,
  }
}

export function useSession(id?: string | null) {
  const query = useQuery({
    queryKey: queryKeys.session(id ?? ''),
    queryFn: () => getSessionById(id!),
    enabled: !!id,
  })

  return {
    session: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refresh: query.refetch,
  }
}

export function useSessionSeats(sessionId?: string | null) {
  const query = useQuery({
    queryKey: queryKeys.sessionSeats(sessionId ?? ''),
    queryFn: () => getSessionSeatAvailability(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 15_000,
  })

  return {
    seats: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refresh: query.refetch,
  }
}
