const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'email rate limit exceeded':
    'Too many sign-up emails were sent. Wait about an hour, or turn off email confirmation in Supabase for local testing.',
  'user already registered': 'An account with this email already exists. Try signing in instead.',
  'invalid login credentials': 'Incorrect email or password.',
  'this account is for staff. use the admin sign-in page.':
    'This account is for staff. Use the admin sign-in page.',
  'administrator access only. use customer sign-in to order.':
    'Administrator access only. Use customer sign-in to order.',
}

function normalizeAuthMessage(message: string): string {
  const key = message.toLowerCase().trim()
  return AUTH_ERROR_MESSAGES[key] ?? message
}

export function getErrorMessage(error: unknown, fallback = 'Please try again.'): string {
  if (error instanceof Error && error.message) return normalizeAuthMessage(error.message)

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return normalizeAuthMessage(message)
  }

  return fallback
}
