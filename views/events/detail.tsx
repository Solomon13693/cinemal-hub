'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useEvent, useSessions } from '@/services'
import { EVENT_SUBTYPE_LABEL, ROUTES } from '@/constants'
import { SessionPicker } from '@/components/event'
import { DetailPageSkeleton, RemoteImage, SessionPickerSkeleton } from '@/components/ui'

export default function EventDetailView() {
  const { id } = useParams<{ id: string }>()
  const { event, loading } = useEvent(id)
  const { sessions, loading: sessionsLoading } = useSessions({
    eventId: id,
    upcomingOnly: true,
  })

  if (loading) {
    return <DetailPageSkeleton />
  }

  if (!event || event.kind !== 'event') {
    return (
      <div className="container page-section text-center">
        <p className="text-lg font-semibold text-off-white">Event not found</p>
        <Link href={ROUTES.events} className="mt-4 inline-block text-sm font-semibold text-primary">
          Back to events
        </Link>
      </div>
    )
  }

  const subtypeLabel = event.event_subtype
    ? EVENT_SUBTYPE_LABEL[event.event_subtype]
    : null

  return (
    <div className="container page-section">
      <Link
        href={ROUTES.events}
        className="inline-flex items-center gap-2 text-sm font-medium text-text-grey transition-colors hover:text-off-white"
      >
        <ArrowLeftIcon className="size-4" />
        Back to events
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
            {[
              event.categories?.name,
              subtypeLabel,
              event.organizer,
              event.venue_label,
            ]
              .filter(Boolean)
              .join(' · ') || 'Event'}
          </p>
          {event.synopsis ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-muted">{event.synopsis}</p>
          ) : null}

          <div className="mt-8">
            <h2 className="font-display text-xl font-bold text-off-white">Sessions</h2>
            <p className="mt-1 text-sm text-text-muted">Select a session to choose seats.</p>
            <div className="mt-4">
              {sessionsLoading ? (
                <SessionPickerSkeleton />
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
