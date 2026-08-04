import { requireUser, jsonError, ApiError } from '@/lib/server/auth'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { createPendingBookingWithSeats } from '@/lib/server/bookings'
import { generatePaymentReference, initializeTransaction } from '@/lib/paystack'
import type { PlaceBookingPayloadType } from '@/types'

export async function POST(request: Request) {
  try {
    const user = await requireUser(request)
    const body = (await request.json()) as PlaceBookingPayloadType

    if (!body.session_id || !Array.isArray(body.seat_ids) || !body.seat_ids.length) {
      throw new ApiError('Select a session and at least one seat', 400)
    }

    const supabase = createSupabaseAdmin()
    const reference = generatePaymentReference()

    const booking = await createPendingBookingWithSeats(
      supabase,
      user.id,
      { session_id: body.session_id, seat_ids: body.seat_ids },
      reference,
    )

    const email = user.email
    if (!email) throw new ApiError('Your account needs an email for payment', 400)

    const amountKobo = Math.round(Number(booking.total_amount) * 100)
    if (amountKobo < 100) throw new ApiError('Invalid payment amount', 400)

    const paystack = await initializeTransaction({
      email,
      amountKobo,
      reference,
      metadata: {
        booking_id: booking.id,
        booking_number: booking.booking_number,
        user_id: user.id,
      },
    })

    return Response.json({
      bookingId: booking.id,
      bookingNumber: booking.booking_number,
      accessCode: paystack.access_code,
      reference: paystack.reference,
    })
  } catch (error) {
    return jsonError(error)
  }
}
