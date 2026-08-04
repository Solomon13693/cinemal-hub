'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib'
import { queryKeys } from '@/lib/query-keys'
import type { EventKindType, EventPayloadType, EventSubtypeType, EventType } from '@/types'

const EVENT_SELECT = '*, categories(id, name, slug)'

export type EventsFilter = {
  kind?: EventKindType
  categoryId?: string
  search?: string
  publishedOnly?: boolean
  subtype?: EventSubtypeType
}

export async function getEvents(filter: EventsFilter = {}): Promise<EventType[]> {
  let query = supabase.from('events').select(EVENT_SELECT).order('created_at', { ascending: false })

  if (filter.kind) query = query.eq('kind', filter.kind)
  if (filter.categoryId) query = query.eq('category_id', filter.categoryId)
  if (filter.search) query = query.ilike('title', `%${filter.search}%`)
  if (filter.publishedOnly) query = query.eq('is_published', true)
  if (filter.subtype) query = query.eq('event_subtype', filter.subtype)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getEventById(id: string): Promise<EventType | null> {
  const { data, error } = await supabase.from('events').select(EVENT_SELECT).eq('id', id).single()
  if (error) return null
  return data
}

export async function createEvent(payload: EventPayloadType): Promise<EventType> {
  const { data, error } = await supabase.from('events').insert(payload).select(EVENT_SELECT).single()
  if (error) throw error
  return data
}

export async function updateEvent(
  id: string,
  payload: Partial<EventPayloadType>,
): Promise<EventType> {
  const { data, error } = await supabase
    .from('events')
    .update(payload)
    .eq('id', id)
    .select(EVENT_SELECT)
    .single()
  if (error) throw error
  return data
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

export async function uploadEventPoster(file: File): Promise<string> {
  const path = `posters/${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('event-posters').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('event-posters').getPublicUrl(path)
  return data.publicUrl
}

export function useEvents(filter: EventsFilter = {}) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: queryKeys.events(filter),
    queryFn: () => getEvents(filter),
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.events(filter) })
    return query.refetch()
  }

  return {
    events: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refresh,
  }
}

export function useEvent(id?: string | null) {
  const query = useQuery({
    queryKey: queryKeys.event(id ?? ''),
    queryFn: () => getEventById(id!),
    enabled: !!id,
  })

  return {
    event: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refresh: query.refetch,
  }
}
