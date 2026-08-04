'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useEvent, useSessions } from '@/services'
import { ROUTES } from '@/constants'
import { SessionPicker } from '@/components/event'
import { RemoteImage, Skeleton, SkeletonLine } from '@/components/ui'

export default function MovieDetailView() {
  const { id } = useParams<{ id: string }>()
  const { event, loading } = useEvent(id)
  const { sessions, loading: sessionsLoading } = useSessions({
    eventId: id,
    upcomingOnly: true,
  })

  if (loading) {
    return (
      <div className="container page-section space-y-4">
        <SkeletonLine height="h-8" width="w-48" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    )
  }

  if (!event || event.kind !== 'movie') {
    return (
      <div className="container page-section text-center">
        <p className="text-lg font-semibold text-off-white">Movie not found</p>
        <Link href={ROUTES.movies} className="mt-4 inline-block text-sm font-semibold text-primary">
          Back to movies
        </Link>
      </div>
    )
  }

  return (
    <div className="container page-section">
      <Link
        href={ROUTES.movies}
        className="inline-flex items-center gap-2 text-sm font-medium text-text-grey transition-colors hover:text-off-white"
      >
        <ArrowLeftIcon className="size-4" />
        Back to movies
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:items-start">
        <div className="relative mx-auto aspect-7/7 w-full overflow-hidden rounded-2xl bg-surface-2 md:mx-0">
          {event.poster_url ? (
            <RemoteImage
              src={event.poster_url}
              alt={event.title}
              fill
              className="object-cover object-center"
              sizes="(max-width:768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-text-grey">
              No poster
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-off-white">{event.title}</h1>
          <p className="mt-2 text-sm text-text-muted">
            {[event.categories?.name, event.rating, event.duration_minutes ? `${event.duration_minutes} min` : null]
              .filter(Boolean)
              .join(' · ') || 'Movie'}
          </p>
          {event.synopsis ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-muted">{event.synopsis}</p>
          ) : null}
          {event.trailer_url ? (
            <a
              href={event.trailer_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Watch trailer →
            </a>
          ) : null}

          <div className="mt-8">
            <h2 className="font-display text-xl font-bold text-off-white">Showtimes</h2>
            <p className="mt-1 text-sm text-text-muted">Select a session to choose seats.</p>
            <div className="mt-4">
              {sessionsLoading ? (
                <p className="text-sm text-text-grey">Loading sessions…</p>
              ) : (
                <SessionPicker sessions={sessions} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
