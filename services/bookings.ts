'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib'
import { queryKeys } from '@/lib/query-keys'
import type { BookingStatusType, BookingType } from '@/types'

const BOOKING_SELECT = `
  *,
  sessions(
    *,
    events(*, categories(id, name, slug)),
    venues(id, name, rows, seats_per_row)
  ),
  booking_seats(*, seats(*)),
  profiles(id, name, phone)
`

export async function getMyBookings(userId: string): Promise<BookingType[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getAllBookings(status?: BookingStatusType | 'all'): Promise<BookingType[]> {
  let query = supabase.from('bookings').select(BOOKING_SELECT).order('created_at', { ascending: false })
  if (status && status !== 'all') query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getBookingById(id: string): Promise<BookingType | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatusType,
): Promise<BookingType> {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select(BOOKING_SELECT)
    .single()
  if (error) throw error
  return data
}

export function useMyBookings(userId?: string | null) {
  const query = useQuery({
    queryKey: queryKeys.myBookings(userId ?? ''),
    queryFn: () => getMyBookings(userId!),
    enabled: !!userId,
  })

  return {
    bookings: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refresh: query.refetch,
  }
}

export function useAllBookings(status?: BookingStatusType | 'all') {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: queryKeys.allBookings(status),
    queryFn: () => getAllBookings(status),
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.allBookings(status) })
    return query.refetch()
  }

  return {
    bookings: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refresh,
  }
}

export function useBooking(id?: string | null) {
  const query = useQuery({
    queryKey: queryKeys.booking(id ?? ''),
    queryFn: () => getBookingById(id!),
    enabled: !!id,
  })

  return {
    booking: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refresh: query.refetch,
  }
}
