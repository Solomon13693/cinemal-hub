'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEvents } from '@/services'
import { ROUTES, BRAND } from '@/constants'
import { EventCard } from '@/components/event'
import { EventGridSkeleton } from '@/components/ui'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

export default function HomeView() {
  const { events: movies, loading: moviesLoading } = useEvents({
    kind: 'movie',
    publishedOnly: true,
  })
  const { events, loading: eventsLoading } = useEvents({
    kind: 'event',
    publishedOnly: true,
  })

  return (
    <>
      <section className="marketing-hero relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(225,29,72,0.22),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(255,255,255,0.06),_transparent_45%)]"
          aria-hidden
        />
        <div className="container relative">
          <motion.div
            className="max-w-2xl"
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={{ duration: 0.5 }}
          >
            <p className="font-display text-5xl font-extrabold tracking-tight text-off-white sm:text-6xl">
              {BRAND.name}
            </p>
            <h1 className="mt-4 text-xl font-medium text-off-white/90 sm:text-2xl">
              {BRAND.tagline}
            </h1>
            <p className="mt-3 max-w-lg text-sm text-text-muted sm:text-base">
              Pick a showtime, choose your seats, and pay securely — your e-ticket is ready in
              minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={ROUTES.movies}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Browse Movies
              </Link>
              <Link
                href={ROUTES.events}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 px-5 text-sm font-semibold text-off-white transition-colors hover:bg-white/5"
              >
                Upcoming Events
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container page-section pt-0!">
        <motion.div
          initial={fadeUp.initial}
          whileInView={fadeUp.animate}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45 }}
        >
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-off-white">Now Showing</h2>
              <p className="mt-1 text-sm text-text-muted">Movies you can book right now.</p>
            </div>
            <Link href={ROUTES.movies} className="text-sm font-semibold text-primary hover:underline">
              View all →
            </Link>
          </div>

          {moviesLoading ? (
            <EventGridSkeleton count={5} />
          ) : movies.length === 0 ? (
            <p className="rounded-2xl border border-white/6 bg-white/3 p-10 text-center text-sm text-text-grey">
              No movies published yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {movies.slice(0, 5).map(movie => (
                <EventCard key={movie.id} event={movie} />
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          className="mt-14"
          initial={fadeUp.initial}
          whileInView={fadeUp.animate}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-off-white">Upcoming Events</h2>
              <p className="mt-1 text-sm text-text-muted">Concerts, theatre, comedy, and more.</p>
            </div>
            <Link href={ROUTES.events} className="text-sm font-semibold text-primary hover:underline">
              View all →
            </Link>
          </div>

          {eventsLoading ? (
            <EventGridSkeleton count={5} />
          ) : events.length === 0 ? (
            <p className="rounded-2xl border border-white/6 bg-white/3 p-10 text-center text-sm text-text-grey">
              No events published yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {events.slice(0, 5).map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </motion.div>
      </section>
    </>
  )
}
