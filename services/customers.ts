'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib'
import { queryKeys } from '@/lib/query-keys'
import type { CustomerType } from '@/types'

export async function getCustomers(): Promise<CustomerType[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getCustomerById(id: string): Promise<CustomerType | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (error) return null
  return data
}

export async function updateProfile(
  id: string,
  payload: { name?: string; phone?: string | null },
): Promise<CustomerType> {
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export function useCustomers() {
  const query = useQuery({
    queryKey: queryKeys.customers,
    queryFn: getCustomers,
  })

  return {
    customers: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refresh: query.refetch,
  }
}

export function useCustomer(id?: string | null) {
  const query = useQuery({
    queryKey: queryKeys.customer(id ?? ''),
    queryFn: () => getCustomerById(id!),
    enabled: !!id,
  })

  return {
    customer: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refresh: query.refetch,
  }
}
