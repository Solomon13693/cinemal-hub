'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  HomeIcon,
  FilmIcon,
  SparklesIcon,
  TagIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib'
import { ROUTES } from '@/constants'
import { useAuth, useLogout } from '@/services'
import { Logo } from '@/components/brand'

const NAV_ITEMS = [
  { href: ROUTES.admin, label: 'Overview', icon: HomeIcon },
  { href: ROUTES.adminMovies, label: 'Movies', icon: FilmIcon },
  { href: ROUTES.adminEvents, label: 'Events', icon: SparklesIcon },
  { href: ROUTES.adminCategories, label: 'Categories', icon: TagIcon },
  { href: ROUTES.adminVenues, label: 'Venues', icon: BuildingOffice2Icon },
  { href: ROUTES.adminSessions, label: 'Sessions', icon: CalendarDaysIcon },
  { href: ROUTES.adminBookings, label: 'Bookings', icon: ClipboardDocumentListIcon },
  { href: ROUTES.adminPayments, label: 'Payments', icon: CreditCardIcon },
  { href: ROUTES.adminCustomers, label: 'Customers', icon: UsersIcon },
]

function isNavActive(pathname: string, href: string) {
  if (href === ROUTES.admin) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

function getInitials(name?: string | null) {
  if (!name) return 'A'
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { profile, isAuthenticated, isAdmin, loading } = useAuth()
  const { signOut } = useLogout(ROUTES.adminLogin)

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(pathname)
      router.replace(`${ROUTES.adminLogin}?redirect=${redirect}`)
      return
    }
    if (!isAdmin) {
      router.replace(ROUTES.home)
    }
  }, [loading, isAuthenticated, isAdmin, router, pathname])

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-charcoal">
        <p className="text-sm text-text-grey">Loading admin console…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/6 bg-charcoal md:flex">
          <div className="shrink-0 px-4 pt-5 pb-2">
            <Link href={ROUTES.admin} className="block transition-opacity hover:opacity-90">
              <Logo size="md" showWordmark />
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-2">
            <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-text-grey">
              Navigation
            </p>
            <ul className="space-y-1">
              {NAV_ITEMS.map(item => {
                const isActive = isNavActive(pathname, item.href)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/15 font-semibold text-primary'
                          : 'text-text-muted hover:bg-white/5 hover:text-off-white',
                      )}
                    >
                      <Icon
                        className={cn(
                          'size-5 shrink-0',
                          isActive ? 'text-primary' : 'text-text-grey',
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="shrink-0 border-t border-white/6 p-3">
            <div className="flex items-center gap-3 rounded-xl px-2 py-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {getInitials(profile?.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-off-white">
                  {profile?.name ?? 'Admin'}
                </p>
                <p className="truncate text-xs text-text-grey">Administrator</p>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-text-grey transition-colors hover:bg-white/5 hover:text-off-white"
                aria-label="Sign out"
              >
                <ArrowRightOnRectangleIcon className="size-5" />
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
