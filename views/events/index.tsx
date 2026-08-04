'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useCategories, useEvents } from '@/services'
import { useDebouncedValue } from '@/hooks'
import { EVENT_SUBTYPE_LABEL } from '@/constants'
import { EventCard } from '@/components/event'
import { cn } from '@/lib'
import type { EventSubtypeType } from '@/types'

const SUBTYPES = Object.keys(EVENT_SUBTYPE_LABEL) as EventSubtypeType[]

export default function EventsView() {
  const [categoryId, setCategoryId] = useState<string | undefined>()
  const [subtype, setSubtype] = useState<EventSubtypeType | undefined>()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)

  const { categories } = useCategories()
  const { events, loading } = useEvents({
    kind: 'event',
    publishedOnly: true,
    categoryId,
    subtype,
    search: debouncedSearch || undefined,
  })

  return (
    <div className="page-section">
      <div className="container">
        <h1 className="font-display text-3xl font-bold text-off-white">Events</h1>
        <p className="mt-2 text-sm text-text-muted">Live shows, concerts, and special nights.</p>

        <div className="relative mt-6 max-w-md">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-grey" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events…"
            className="form-control pl-10!"
          />
        </div>

        <div className="no-scrollbar mt-6 flex gap-3 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setCategoryId(undefined)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
              !categoryId
                ? 'border-primary/40 bg-primary/15 text-primary'
                : 'border-white/10 text-text-muted hover:bg-white/5',
            )}
          >
            All categories
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryId(category.id)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                categoryId === category.id
                  ? 'border-primary/40 bg-primary/15 text-primary'
                  : 'border-white/10 text-text-muted hover:bg-white/5',
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setSubtype(undefined)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
              !subtype
                ? 'border-primary/40 bg-primary/15 text-primary'
                : 'border-white/10 text-text-muted hover:bg-white/5',
            )}
          >
            All types
          </button>
          {SUBTYPES.map(key => (
            <button
              key={key}
              type="button"
              onClick={() => setSubtype(key)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                subtype === key
                  ? 'border-primary/40 bg-primary/15 text-primary'
                  : 'border-white/10 text-text-muted hover:bg-white/5',
              )}
            >
              {EVENT_SUBTYPE_LABEL[key]}
            </button>
          ))}
        </div>

        <div className={cn('mt-6', loading && 'opacity-70')}>
          {loading ? (
            <p className="text-sm text-text-grey">Loading events…</p>
          ) : events.length === 0 ? (
            <p className="rounded-2xl border border-white/6 bg-white/3 p-10 text-center text-sm text-text-grey">
              No events match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
