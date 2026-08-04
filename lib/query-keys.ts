import type { EventsFilter } from '@/services/events'

export const queryKeys = {
  categories: ['categories'] as const,
  events: (filter: EventsFilter = {}) =>
    [
      'events',
      filter.kind ?? null,
      filter.categoryId ?? null,
      filter.search ?? null,
      filter.publishedOnly ?? null,
      filter.subtype ?? null,
    ] as const,
  event: (id: string) => ['event', id] as const,
  venues: ['venues'] as const,
  venue: (id: string) => ['venue', id] as const,
  sessions: (filter: { eventId?: string; upcomingOnly?: boolean } = {}) =>
    ['sessions', filter.eventId ?? null, filter.upcomingOnly ?? null] as const,
  session: (id: string) => ['session', id] as const,
  sessionSeats: (sessionId: string) => ['session-seats', sessionId] as const,
  myBookings: (userId: string) => ['my-bookings', userId] as const,
  allBookings: (status?: string) => ['all-bookings', status ?? null] as const,
  booking: (id: string) => ['booking', id] as const,
  customers: ['customers'] as const,
  customer: (id: string) => ['customer', id] as const,
}
