export const ROUTES = {
  home: '/',
  movies: '/movies',
  events: '/events',
  checkout: '/checkout',
  bookings: '/bookings',
  profile: '/profile',
  login: '/login',
  register: '/register',
  adminLogin: '/admin/login',
  admin: '/admin',
  adminMovies: '/admin/movies',
  adminEvents: '/admin/events',
  adminCategories: '/admin/categories',
  adminVenues: '/admin/venues',
  adminSessions: '/admin/sessions',
  adminBookings: '/admin/bookings',
  adminPayments: '/admin/payments',
  adminCustomers: '/admin/customers',
} as const

export function getMovieHref(id: string): string {
  return `${ROUTES.movies}/${id}`
}

export function getEventHref(id: string): string {
  return `${ROUTES.events}/${id}`
}

export function getBookSessionHref(sessionId: string): string {
  return `/book/${sessionId}`
}

export function getBookingDetailHref(id: string): string {
  return `${ROUTES.bookings}/${id}`
}

export function getTicketHref(id: string): string {
  return `${ROUTES.bookings}/${id}/ticket`
}

export function getAdminBookingDetailHref(id: string): string {
  return `${ROUTES.adminBookings}/${id}`
}

export function getAdminCustomerDetailHref(id: string): string {
  return `${ROUTES.adminCustomers}/${id}`
}

export function getAuthenticatedHomeHref(role?: string | null): string {
  return role === 'admin' ? ROUTES.admin : ROUTES.home
}
