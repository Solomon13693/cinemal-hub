import type { CategoryType } from './category.type'

export type EventKindType = 'movie' | 'event'

export type EventSubtypeType = 'concert' | 'theatre' | 'comedy' | 'sports' | 'other'

export type EventType = {
  id: string
  kind: EventKindType
  title: string
  synopsis: string | null
  poster_url: string | null
  category_id: string | null
  is_published: boolean
  duration_minutes: number | null
  rating: string | null
  trailer_url: string | null
  organizer: string | null
  event_subtype: EventSubtypeType | null
  venue_label: string | null
  created_at: string
  categories?: Pick<CategoryType, 'id' | 'name' | 'slug'> | null
}

export type EventPayloadType = {
  kind: EventKindType
  title: string
  synopsis?: string | null
  poster_url?: string | null
  category_id?: string | null
  is_published?: boolean
  duration_minutes?: number | null
  rating?: string | null
  trailer_url?: string | null
  organizer?: string | null
  event_subtype?: EventSubtypeType | null
  venue_label?: string | null
}
