const PAYSTACK_BASE = 'https://api.paystack.co'
const PAYSTACK_TIMEOUT_MS = 35_000
const PAYSTACK_MAX_ATTEMPTS = 3

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim()
  if (!key) throw new Error('Missing PAYSTACK_SECRET_KEY')
  return key
}

export type PaystackInitializeResult = {
  access_code: string
  reference: string
  authorization_url: string
}

export type PaystackVerifyResult = {
  status: string
  reference: string
  amount: number
  currency: string
  metadata?: { order_id?: string }
}

type PaystackJson<T> = {
  status: boolean
  message?: string
  data?: T
}

function isRetryableResponse(res: Response, body: string): boolean {
  return res.status >= 502 || res.status === 429 || body.trimStart().startsWith('<')
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return error.name === 'AbortError' || error.message.includes('fetch failed')
}

async function parsePaystackJson<T>(res: Response, body: string): Promise<PaystackJson<T>> {
  if (body.trimStart().startsWith('<')) {
    throw new Error(
      res.status >= 500
        ? 'Paystack is temporarily unavailable. Please try again in a moment.'
        : 'Unexpected response from Paystack. Check your secret key and try again.',
    )
  }

  try {
    return JSON.parse(body) as PaystackJson<T>
  } catch {
    throw new Error('Invalid response from Paystack. Please try again.')
  }
}

async function paystackFetch(path: string, init: RequestInit, attempt = 0): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PAYSTACK_TIMEOUT_MS)

  try {
    const res = await fetch(`${PAYSTACK_BASE}${path}`, {
      ...init,
      signal: controller.signal,
    })

    const body = await res.clone().text()
    if (attempt < PAYSTACK_MAX_ATTEMPTS - 1 && isRetryableResponse(res, body)) {
      await sleep(1000 * (attempt + 1))
      return paystackFetch(path, init, attempt + 1)
    }

    return res
  } catch (error) {
    if (attempt < PAYSTACK_MAX_ATTEMPTS - 1 && isRetryableError(error)) {
      await sleep(1000 * (attempt + 1))
      return paystackFetch(path, init, attempt + 1)
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Paystack is taking too long to respond. Please try again.')
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function initializeTransaction(params: {
  email: string
  amountKobo: number
  reference: string
  metadata?: Record<string, unknown>
}): Promise<PaystackInitializeResult> {
  const res = await paystackFetch('/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      metadata: params.metadata,
    }),
  })

  const body = await res.text()
  const json = await parsePaystackJson<PaystackInitializeResult>(res, body)
  if (!json.status || !json.data) {
    throw new Error(json.message ?? 'Paystack initialize failed')
  }

  return json.data
}

export async function verifyTransaction(reference: string): Promise<PaystackVerifyResult> {
  const res = await paystackFetch(`/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${getSecretKey()}` },
  })

  const body = await res.text()
  const json = await parsePaystackJson<PaystackVerifyResult>(res, body)
  if (!json.status || !json.data) {
    throw new Error(json.message ?? 'Paystack verify failed')
  }

  return json.data
}

export function generatePaymentReference(): string {
  return `ch_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}
