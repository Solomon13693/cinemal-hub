import Link from 'next/link'
import { getBookSessionHref, getEventHref, getMovieHref } from '@/constants'
import { formatCurrency, formatDateTime } from '@/utils'
import { RemoteImage } from '@/components/ui'
import type { EventType } from '@/types'
import type { SessionType } from '@/types'

export function EventCard({ event }: { event: EventType }) {
  const href = event.kind === 'movie' ? getMovieHref(event.id) : getEventHref(event.id)

  return (
    <Link href={href} className="event-card block">
      <div className="relative aspect-7/7 max-h-72 overflow-hidden bg-surface-2 sm:max-h-80">
        {event.poster_url ? (
          <RemoteImage
            src={event.poster_url}
            alt={event.title}
            fill
            className="object-cover object-center"
            sizes="(max-width:768px) 50vw, 20vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-text-grey">
            No poster
          </div>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-charcoal/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-off-white backdrop-blur">
          {event.kind === 'movie' ? 'Movie' : 'Event'}
        </span>
      </div>
      <div className="p-3.5">
        <h3 className="font-display text-sm font-semibold text-off-white line-clamp-1 sm:text-base">
          {event.title}
        </h3>
        <p className="mt-1 text-xs text-text-grey line-clamp-1">
          {event.categories?.name ??
            (event.kind === 'movie'
              ? event.rating ?? 'Movie'
              : event.event_subtype ?? 'Event')}
          {event.kind === 'movie' && event.duration_minutes
            ? ` · ${event.duration_minutes} min`
            : null}
          {event.kind === 'event' && event.organizer ? ` · ${event.organizer}` : null}
        </p>
      </div>
    </Link>
  )
}

export function SessionPicker({ sessions }: { sessions: SessionType[] }) {
  if (!sessions.length) {
    return <p className="text-sm text-text-muted">No upcoming sessions scheduled.</p>
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {sessions.map(session => (
        <Link
          key={session.id}
          href={getBookSessionHref(session.id)}
          className="rounded-2xl border border-white/8 bg-white/5 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <p className="text-sm font-semibold text-off-white">
            {formatDateTime(session.starts_at)}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {session.venues?.name ?? 'Venue'} · from {formatCurrency(Number(session.base_price))}
          </p>
        </Link>
      ))}
    </div>
  )
}
