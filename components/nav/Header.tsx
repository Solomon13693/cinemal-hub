'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bars3Icon, XMarkIcon, TicketIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib'
import { ROUTES } from '@/constants'
import { useAuth, useLogout } from '@/services'
import { Logo } from '@/components/brand'
import MobileNav from './MobileNav'

const NAV_LINKS = [
  { href: ROUTES.home, label: 'Home' },
  { href: ROUTES.movies, label: 'Movies' },
  { href: ROUTES.events, label: 'Events' },
]

export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { isAuthenticated, profile } = useAuth()
  const { signOut } = useLogout()

  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-charcoal/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href={ROUTES.home} className="transition-opacity hover:opacity-90">
          <Logo size="md" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-muted transition-colors hover:text-off-white"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              href={ROUTES.bookings}
              className="text-sm font-medium text-text-muted transition-colors hover:text-off-white"
            >
              My Bookings
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <Link
              href={ROUTES.bookings}
              className="relative flex size-10 items-center justify-center rounded-full bg-white/5 text-off-white transition-colors hover:bg-white/10"
              aria-label="My bookings"
            >
              <TicketIcon className="size-5" />
            </Link>
          )}

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <Link
                  href={ROUTES.profile}
                  className="text-sm text-text-muted transition-colors hover:text-off-white"
                >
                  Hi, {profile?.name?.split(' ')[0] ?? 'there'}
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="text-sm font-medium text-text-muted transition-colors hover:text-off-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href={ROUTES.login}
                  className="text-sm font-medium text-text-muted transition-colors hover:text-off-white"
                >
                  Login
                </Link>
                <Link
                  href={ROUTES.register}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMobileOpen(open => !open)}
            className={cn(
              'flex size-10 items-center justify-center rounded-full bg-white/5 text-off-white md:hidden',
            )}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <XMarkIcon className="size-5" /> : <Bars3Icon className="size-5" />}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <MobileNav
          isAuthenticated={isAuthenticated}
          onNavigate={() => setIsMobileOpen(false)}
          onLogout={signOut}
        />
      )}
    </header>
  )
}
