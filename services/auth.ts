'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib'
import { ROUTES } from '@/constants'
import type { LoginPayloadType, ProfileType, RegisterPayloadType } from '@/types'

// ================================
// REGISTER
// ================================
export async function registerCustomer(payload: RegisterPayloadType) {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        name: payload.name,
        phone: payload.phone,
      },
    },
  })
  if (error) throw error

  const userId = data.user?.id
  if (!userId) {
    throw new Error('Account could not be created. Please try again.')
  }

  // When email confirmation is off, upsert profile for the signed-in user.
  if (data.session) {
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: userId,
        name: payload.name,
        phone: payload.phone,
        role: 'customer',
      },
      { onConflict: 'id' },
    )
    if (profileError) throw profileError
  }

  return {
    ...data,
    needsEmailConfirmation: !data.session,
  }
}

// ================================
// LOGIN
// ================================
export async function loginWithPassword(payload: LoginPayloadType) {
  const { data, error } = await supabase.auth.signInWithPassword(payload)
  if (error) throw error
  return data
}

export async function loginCustomer(payload: LoginPayloadType) {
  const data = await loginWithPassword(payload)
  const userId = data.user?.id
  if (!userId) throw new Error('Sign in failed. Please try again.')

  const profile = await getProfile(userId)
  if (profile?.role === 'admin') {
    await logoutUser()
    throw new Error('This account is for staff. Use the admin sign-in page.')
  }

  return data
}

export async function loginAdmin(payload: LoginPayloadType) {
  const data = await loginWithPassword(payload)
  const userId = data.user?.id
  if (!userId) throw new Error('Sign in failed. Please try again.')

  const profile = await getProfile(userId)
  if (profile?.role !== 'admin') {
    await logoutUser()
    throw new Error('Administrator access only. Use customer sign-in to book tickets.')
  }

  return data
}

// ================================
// LOGOUT
// ================================
export async function logoutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ================================
// GET PROFILE
// ================================
export async function getProfile(userId: string): Promise<ProfileType | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) return null
  return data
}

// ================================
// USE AUTH HOOK
// ================================
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null)
      return
    }
    const profileData = await getProfile(currentUser.id)
    setProfile(profileData)
  }, [])

  useEffect(() => {
    let isMounted = true

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return
      setUser(data.user)
      loadProfile(data.user).finally(() => setLoading(false))
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      loadProfile(session?.user ?? null)
    })

    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
  }, [loadProfile])

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
  }
}

// ================================
// USE LOGOUT HOOK
// ================================
export function useLogout(redirectTo: string = ROUTES.home) {
  const router = useRouter()

  const signOut = useCallback(async () => {
    await logoutUser()
    router.replace(redirectTo)
    router.refresh()
  }, [router, redirectTo])

  return { signOut }
}
