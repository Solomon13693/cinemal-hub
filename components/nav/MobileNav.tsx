'use client'

import Link from 'next/link'
import { ROUTES } from '@/constants'

const NAV_LINKS = [
  { href: ROUTES.home, label: 'Home' },
  { href: ROUTES.movies, label: 'Movies' },
  { href: ROUTES.events, label: 'Events' },
]

export default function MobileNav({
  isAuthenticated,
  onNavigate,
  onLogout,
}: {
  isAuthenticated: boolean
  onNavigate: () => void
  onLogout: () => void
}) {
  return (
    <div className="border-t border-white/6 bg-charcoal md:hidden">
      <nav className="container flex flex-col gap-1 py-4">
        {NAV_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-off-white"
          >
            {link.label}
          </Link>
        ))}

        {isAuthenticated ? (
          <>
            <Link
              href={ROUTES.bookings}
              onClick={onNavigate}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-off-white"
            >
              My Bookings
            </Link>
            <Link
              href={ROUTES.profile}
              onClick={onNavigate}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-off-white"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={() => {
                onLogout()
                onNavigate()
              }}
              className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/10"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href={ROUTES.login}
              onClick={onNavigate}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-off-white"
            >
              Login
            </Link>
            <Link
              href={ROUTES.register}
              onClick={onNavigate}
              className="mt-1 rounded-xl bg-primary px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </div>
  )
}
