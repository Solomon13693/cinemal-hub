import type { SupabaseClient } from '@supabase/supabase-js'
import { HOLD_MINUTES } from '@/constants'
import { generateBookingNumber } from '@/utils/bookingNumber'
import type { BookingType } from '@/types'

export type CreateBookingInput = {
  session_id: string
  seat_ids: string[]
}

async function releasePendingBookings(
  supabase: SupabaseClient,
  bookingIds: string[],
): Promise<void> {
  if (!bookingIds.length) return
  await supabase.from('bookings').delete().in('id', bookingIds)
}

async function findPendingBookingIds(
  supabase: SupabaseClient,
  sessionId: string,
  opts: { userId?: string; expiredOnly?: boolean } = {},
): Promise<string[]> {
  let query = supabase
    .from('bookings')
    .select('id, expires_at, user_id')
    .eq('session_id', sessionId)
    .eq('status', 'pending')

  if (opts.userId) query = query.eq('user_id', opts.userId)

  const { data, error } = await query
  if (error) throw error

  const now = Date.now()
  return (data ?? [])
    .filter(row => {
      if (opts.expiredOnly) {
        if (!row.expires_at) return true
        return new Date(row.expires_at).getTime() <= now
      }
      return true
    })
    .map(row => row.id)
}

export async function createPendingBookingWithSeats(
  supabase: SupabaseClient,
  userId: string,
  payload: CreateBookingInput,
  paymentReference: string,
): Promise<BookingType> {
  if (!payload.seat_ids.length) {
    throw new Error('Select at least one seat')
  }

  // Free expired holds for everyone on this session
  const expiredIds = await findPendingBookingIds(supabase, payload.session_id, {
    expiredOnly: true,
  })
  await releasePendingBookings(supabase, expiredIds)

  // Same user retrying after refresh: drop their own pending holds for this session
  const ownPendingIds = await findPendingBookingIds(supabase, payload.session_id, {
    userId,
  })
  await releasePendingBookings(supabase, ownPendingIds)

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*, venues(id)')
    .eq('id', payload.session_id)
    .single()

  if (sessionError || !session) throw new Error('Session not found')
  if (session.status !== 'scheduled') throw new Error('This session is not available')

  const { data: seats, error: seatsError } = await supabase
    .from('seats')
    .select('*')
    .in('id', payload.seat_ids)
    .eq('venue_id', session.venue_id)

  if (seatsError) throw seatsError
  if (!seats || seats.length !== payload.seat_ids.length) {
    throw new Error('One or more seats are invalid for this venue')
  }

  const { data: conflicts } = await supabase
    .from('booking_seats')
    .select('seat_id, bookings!inner(id, status, expires_at, user_id)')
    .eq('session_id', payload.session_id)
    .in('seat_id', payload.seat_ids)

  const conflictNow = Date.now()
  const blocked = (conflicts ?? []).filter(row => {
    const booking = row.bookings as unknown as {
      id: string
      status: string
      expires_at: string | null
      user_id: string
    }
    // Own holds should already be released; ignore if any remain
    if (booking.user_id === userId) return false
    if (booking.status === 'paid' || booking.status === 'used') return true
    if (booking.status === 'pending') {
      if (!booking.expires_at) return true
      return new Date(booking.expires_at).getTime() > conflictNow
    }
    return false
  })

  if (blocked.length) {
    throw new Error('Some seats were just taken. Please choose different seats.')
  }

  const priced = seats.map(seat => ({
    seat_id: seat.id,
    price: seat.seat_type === 'vip' ? Number(session.vip_price) : Number(session.base_price),
  }))

  const totalAmount = priced.reduce((sum, s) => sum + s.price, 0)
  const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000).toISOString()

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      booking_number: generateBookingNumber(),
      user_id: userId,
      session_id: payload.session_id,
      status: 'pending',
      total_amount: totalAmount,
      payment_method: 'paystack',
      payment_status: 'pending',
      payment_reference: paymentReference,
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (bookingError) throw bookingError

  const { error: seatsInsertError } = await supabase.from('booking_seats').insert(
    priced.map(seat => ({
      booking_id: booking.id,
      seat_id: seat.seat_id,
      session_id: payload.session_id,
      price: seat.price,
    })),
  )

  if (seatsInsertError) {
    await supabase.from('bookings').delete().eq('id', booking.id)
    if (seatsInsertError.code === '23505') {
      throw new Error('Some seats were just taken. Please choose different seats.')
    }
    throw seatsInsertError
  }

  return booking as BookingType
}
