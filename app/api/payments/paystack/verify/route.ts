import { requireUser, jsonError, ApiError } from '@/lib/server/auth'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyTransaction } from '@/lib/paystack'

export async function POST(request: Request) {
  try {
    const user = await requireUser(request)
    const body = (await request.json()) as { reference?: string; bookingId?: string }

    if (!body.reference || !body.bookingId) {
      throw new ApiError('Missing payment reference', 400)
    }

    const supabase = createSupabaseAdmin()
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', body.bookingId)
      .single()

    if (error || !booking) throw new ApiError('Booking not found', 404)
    if (booking.user_id !== user.id) throw new ApiError('Forbidden', 403)

    if (booking.payment_status === 'paid' && booking.status === 'paid') {
      return Response.json({ success: true })
    }

    const verified = await verifyTransaction(body.reference)
    if (verified.status !== 'success') {
      await supabase
        .from('bookings')
        .update({ payment_status: 'failed' })
        .eq('id', booking.id)
      throw new ApiError('Payment was not successful', 400)
    }

    const expectedKobo = Math.round(Number(booking.total_amount) * 100)
    if (verified.amount !== expectedKobo) {
      throw new ApiError('Payment amount mismatch', 400)
    }

    if (
      booking.payment_reference &&
      verified.reference !== booking.payment_reference &&
      verified.reference !== body.reference
    ) {
      throw new ApiError('Payment reference mismatch', 400)
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'paid',
        payment_status: 'paid',
        payment_reference: verified.reference,
        expires_at: null,
      })
      .eq('id', booking.id)

    if (updateError) throw updateError

    return Response.json({ success: true })
  } catch (error) {
    return jsonError(error)
  }
}
