import Link from 'next/link'
import { ROUTES, BRAND } from '@/constants'
import { Logo } from '@/components/brand'

export default function Footer() {
  return (
    <footer className="store-footer border-t border-white/6 bg-charcoal">
      <div className="container flex flex-col items-center gap-3 px-6 py-6 pt-8 text-center sm:flex-row sm:justify-between sm:text-left md:px-12">
        <div>
          <Logo size="sm" />
          <p className="mt-2 text-sm text-text-grey">{BRAND.tagline}</p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-6">
          <Link href={ROUTES.home} className="text-sm text-text-muted hover:text-off-white">
            Home
          </Link>
          <Link href={ROUTES.movies} className="text-sm text-text-muted hover:text-off-white">
            Movies
          </Link>
          <Link href={ROUTES.events} className="text-sm text-text-muted hover:text-off-white">
            Events
          </Link>
          <Link href={ROUTES.bookings} className="text-sm text-text-muted hover:text-off-white">
            My Bookings
          </Link>
        </nav>

        <p className="text-xs text-text-grey">
          © {new Date().getFullYear()} {BRAND.name}
        </p>
      </div>
    </footer>
  )
}
