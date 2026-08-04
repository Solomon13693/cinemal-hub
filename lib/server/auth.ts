import { createSupabaseAdmin } from '@/lib/supabase-admin'
import type { User } from '@supabase/supabase-js'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

export async function requireUser(request: Request): Promise<User> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError('Please sign in to continue', 401)
  }

  const token = authHeader.slice(7).trim()
  if (!token) {
    throw new ApiError('Please sign in to continue', 401)
  }

  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    throw new ApiError('Session expired. Please sign in again.', 401)
  }

  return data.user
}

export function jsonError(error: unknown, fallback = 'Request failed') {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status })
  }

  const message = getErrorMessage(error, fallback)
  return Response.json({ error: message }, { status: 500 })
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}
