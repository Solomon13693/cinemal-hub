'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/services'
import { useSeatSelectionStore, seatSelectionTotal } from '@/store'
import { initializePaystackBooking, verifyPaystackPayment } from '@/lib/api-client'
import { getTicketHref, ROUTES, HOLD_MINUTES } from '@/constants'
import { formatCurrency, formatDateTime, getErrorMessage } from '@/utils'
import { useToast } from '@/hooks'
import { Button, EmptyState, AuthFormSkeleton } from '@/components/ui'

export default function CheckoutView() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { showSuccess, showError } = useToast()
  const sessionId = useSeatSelectionStore(state => state.sessionId)
  const eventTitle = useSeatSelectionStore(state => state.eventTitle)
  const startsAt = useSeatSelectionStore(state => state.startsAt)
  const venueName = useSeatSelectionStore(state => state.venueName)
  const seats = useSeatSelectionStore(state => state.seats)
  const clear = useSeatSelectionStore(state => state.clear)
  const [submitting, setSubmitting] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const total = seatSelectionTotal(seats)

  if (authLoading) {
    return (
      <div className="container page-section">
        <AuthFormSkeleton />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to checkout"
        action={{ label: 'Go to Login', href: ROUTES.login }}
      />
    )
  }

  if (!sessionId || seats.length === 0) {
    return (
      <EmptyState
        title="No seats selected"
        description="Pick seats for a session before checking out."
        action={{ label: 'Browse movies', href: ROUTES.movies }}
      />
    )
  }

  const completeCheckout = (bookingId: string, bookingNumber: string) => {
    clear()
    showSuccess('Payment successful!', `Booking ${bookingNumber} is confirmed.`)
    router.push(getTicketHref(bookingId))
  }

  const payWithPaystack = async () => {
    if (!user?.email) {
      showError('Payment failed', 'Your account needs an email for Paystack payments.')
      return
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!publicKey) {
      showError('Payment failed', 'Paystack is not configured (missing public key).')
      return
    }

    setSubmitting(true)
    try {
      const init = await initializePaystackBooking({
        session_id: sessionId,
        seat_ids: seats.map(s => s.seatId),
      })

      setSubmitting(false)

      const { default: PaystackPop } = await import('@paystack/inline-js')
      const popup = new PaystackPop()
      await new Promise<void>((resolve, reject) => {
        popup.newTransaction({
          key: publicKey,
          email: user.email!,
          amount: Math.round(total * 100),
          accessCode: init.accessCode,
          reference: init.reference,
          onSuccess: async transaction => {
            setVerifying(true)
            try {
              await verifyPaystackPayment(transaction.reference, init.bookingId)
              completeCheckout(init.bookingId, init.bookingNumber)
              resolve()
            } catch (error) {
              setVerifying(false)
              reject(error)
            }
          },
          onCancel: () => {
            showError(
              'Payment cancelled',
              `Your seats are held for about ${HOLD_MINUTES} minutes. You can try again.`,
            )
            resolve()
          },
        })
      })
    } catch (error) {
      showError('Payment failed', getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {verifying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-card-dark px-8 py-7 text-center shadow-xl">
            <svg className="size-10 animate-spin text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <div>
              <p className="font-display text-lg font-bold text-off-white">Verifying payment</p>
              <p className="mt-1 text-sm text-text-muted">Please wait while we confirm your booking…</p>
            </div>
          </div>
        </div>
      )}

      <div className="container page-section">
        <h1 className="font-display text-3xl font-bold text-off-white">Checkout</h1>
        <p className="mt-2 text-sm text-text-muted">Review your seats and pay securely with Paystack.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-white/6 bg-card-dark/60 p-5">
              <h2 className="font-display text-lg font-bold text-off-white">{eventTitle}</h2>
              <p className="mt-1 text-sm text-text-muted">
                {startsAt ? formatDateTime(startsAt) : '—'} · {venueName}
              </p>
              <ul className="mt-4 space-y-2">
                {seats.map(seat => (
                  <li
                    key={seat.seatId}
                    className="flex items-center justify-between text-sm text-text-muted"
                  >
                    <span className="font-medium text-off-white">
                      {seat.rowLabel}
                      {seat.seatNumber}
                      <span className="ml-2 text-xs uppercase text-text-grey">{seat.seatType}</span>
                    </span>
                    <span className="text-off-white">{formatCurrency(seat.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="h-fit rounded-2xl border border-white/6 bg-card-dark/60 p-5">
            <div className="flex justify-between text-sm font-bold text-off-white">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
            <p className="mt-2 text-xs text-text-grey">
              Seats are held for {HOLD_MINUTES} minutes after you start payment.
            </p>
            <Button
              type="button"
              loading={submitting}
              fullWidth
              className="mt-4"
              onClick={payWithPaystack}
            >
              Pay with Paystack
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
