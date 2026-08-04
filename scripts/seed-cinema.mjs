/**
 * Seed CinemaHub catalog data via Supabase service role.
 *
 * Requires in .env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: npm run seed:cinema
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnv() {
  try {
    const raw = readFileSync(resolve(root, '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim()
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // .env optional if vars already exported
  }
}

loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error(
    'Missing env vars. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env',
  )
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

/** Reliable portrait posters (600×900) */
const poster = seed => `https://picsum.photos/seed/${seed}/600/900`

const categories = [
  { name: 'Action', slug: 'action' },
  { name: 'Drama', slug: 'drama' },
  { name: 'Comedy', slug: 'comedy' },
  { name: 'Romance', slug: 'romance' },
  { name: 'Thriller', slug: 'thriller' },
  { name: 'Animation', slug: 'animation' },
  { name: 'Concert', slug: 'concert' },
  { name: 'Comedy Show', slug: 'comedy-show' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Theatre', slug: 'theatre' },
]

function rowLabel(index) {
  return String.fromCharCode(65 + index)
}

async function generateSeats(venueId, rows, seatsPerRow) {
  const seats = []
  for (let r = 0; r < rows; r++) {
    const label = rowLabel(r)
    const isVip = r >= rows - 2
    for (let n = 1; n <= seatsPerRow; n++) {
      seats.push({
        venue_id: venueId,
        row_label: label,
        seat_number: n,
        seat_type: isVip ? 'vip' : 'standard',
      })
    }
  }
  const { error } = await supabase.from('seats').insert(seats)
  if (error) throw error
}

/** Local cinema/event time: days from today at hour:minute */
function showtime(daysFromNow, hour, minute = 0) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

const ADMIN_EMAIL = 'admin@gmail.com'
const ADMIN_PASSWORD = '123456'

async function ensureAdmin() {
  console.log(`Ensuring admin user ${ADMIN_EMAIL}…`)

  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  })
  if (listError) throw listError

  let user = listed.users.find(u => u.email?.toLowerCase() === ADMIN_EMAIL)

  if (!user) {
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: 'CinemaHub Admin', phone: '' },
    })
    if (createError) throw createError
    user = created.user
    console.log('Created admin auth user')
  } else {
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: 'CinemaHub Admin', ...(user.user_metadata ?? {}) },
    })
    if (updateError) throw updateError
    console.log('Updated existing admin password / confirmation')
  }

  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      name: 'CinemaHub Admin',
      phone: null,
      role: 'admin',
    },
    { onConflict: 'id' },
  )
  if (profileError) throw profileError
  console.log('Admin profile role set to admin')
}

async function main() {
  await ensureAdmin()

  console.log('Clearing existing catalog…')
  await supabase.from('booking_seats').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('seats').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('venues').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  console.log('Seeding categories…')
  const { data: cats, error: catError } = await supabase
    .from('categories')
    .insert(categories)
    .select()
  if (catError) throw catError

  const bySlug = Object.fromEntries(cats.map(c => [c.slug, c.id]))

  console.log('Seeding venues…')
  const venuePayloads = [
    { name: 'Screen 1 — IMAX', rows: 10, seats_per_row: 14 },
    { name: 'Screen 2', rows: 8, seats_per_row: 12 },
    { name: 'Screen 3', rows: 6, seats_per_row: 10 },
    { name: 'Main Hall', rows: 12, seats_per_row: 16 },
  ]
  const { data: venues, error: venueError } = await supabase
    .from('venues')
    .insert(venuePayloads)
    .select()
  if (venueError) throw venueError

  for (const venue of venues) {
    await generateSeats(venue.id, venue.rows, venue.seats_per_row)
  }

  const v = Object.fromEntries(venues.map(x => [x.name, x]))

  console.log('Seeding movies & events…')
  const listings = [
    {
      kind: 'movie',
      title: 'Red Dust Highway',
      synopsis:
        'An elite courier must cross Lagos before midnight with a package that could topple a criminal empire.',
      poster_url: poster('red-dust'),
      category_id: bySlug.action,
      duration_minutes: 124,
      rating: '15',
      trailer_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      is_published: true,
    },
    {
      kind: 'movie',
      title: 'Letters from Enugu',
      synopsis:
        'A young writer returns home and rediscovers love, family, and the stories she left behind.',
      poster_url: poster('letters-enugu'),
      category_id: bySlug.drama,
      duration_minutes: 118,
      rating: 'PG-13',
      is_published: true,
    },
    {
      kind: 'movie',
      title: 'Jollof Wars',
      synopsis:
        'Two rival chefs battle for the city cook-off title — and maybe each other’s hearts.',
      poster_url: poster('jollof-wars'),
      category_id: bySlug.comedy,
      duration_minutes: 102,
      rating: 'PG',
      is_published: true,
    },
    {
      kind: 'movie',
      title: 'Midnight Caller',
      synopsis:
        'A radio host starts receiving cryptic calls that predict crimes before they happen.',
      poster_url: poster('midnight-caller'),
      category_id: bySlug.thriller,
      duration_minutes: 110,
      rating: '15',
      is_published: true,
    },
    {
      kind: 'movie',
      title: 'Under the Almond Tree',
      synopsis:
        'A chance reunion at a wedding weekend forces two exes to face unfinished feelings.',
      poster_url: poster('almond-tree'),
      category_id: bySlug.romance,
      duration_minutes: 108,
      rating: 'PG-13',
      is_published: true,
    },
    {
      kind: 'movie',
      title: 'Sky Heroes: Rise',
      synopsis:
        'A ragtag crew of young flyers must save their floating city from a storm that never ends.',
      poster_url: poster('sky-heroes'),
      category_id: bySlug.animation,
      duration_minutes: 95,
      rating: 'PG',
      is_published: true,
    },
    {
      kind: 'movie',
      title: 'Island of Shadows',
      synopsis:
        'Tourists stranded on a private island discover the host’s hospitality comes with a deadly price.',
      poster_url: poster('island-shadows'),
      category_id: bySlug.thriller,
      duration_minutes: 129,
      rating: '18',
      is_published: true,
    },
    {
      kind: 'movie',
      title: 'Captain Iron',
      synopsis:
        'When a stolen suit of experimental armor falls into the wrong hands, only one engineer can stop it.',
      poster_url: poster('captain-iron'),
      category_id: bySlug.action,
      duration_minutes: 136,
      rating: 'PG-13',
      is_published: true,
    },
    {
      kind: 'event',
      title: 'Afrobeats Summer Jam',
      synopsis:
        'Live performances from rising Afrobeats stars — openers at 7pm, headliner at 9pm.',
      poster_url: poster('afrobeats-jam'),
      category_id: bySlug.concert,
      organizer: 'SoundWave NG',
      event_subtype: 'concert',
      venue_label: 'Main Hall',
      is_published: true,
    },
    {
      kind: 'event',
      title: 'Stand-Up Saturdays',
      synopsis: 'A night of sharp Nigerian comedy with three special guests and an open mic closer.',
      poster_url: poster('standup-sat'),
      category_id: bySlug['comedy-show'],
      organizer: 'LaughLagos',
      event_subtype: 'comedy',
      venue_label: 'Main Hall',
      is_published: true,
    },
    {
      kind: 'event',
      title: 'The Palm Court — Live Play',
      synopsis:
        'A two-act theatre drama about inheritance, secrets, and a family dinner that changes everything.',
      poster_url: poster('palm-court'),
      category_id: bySlug.theatre,
      organizer: 'Amber Stage Co.',
      event_subtype: 'theatre',
      venue_label: 'Main Hall',
      is_published: true,
    },
    {
      kind: 'event',
      title: 'Premier League Fan Fest',
      synopsis:
        'Watch the big match on the giant screen with live commentary, snacks, and half-time games.',
      poster_url: poster('pl-fanfest'),
      category_id: bySlug.sports,
      organizer: 'CinemaHub Sports',
      event_subtype: 'sports',
      venue_label: 'Screen 1 — IMAX',
      is_published: true,
    },
    {
      kind: 'event',
      title: 'Jazz Under the Lights',
      synopsis: 'An intimate evening with a 12-piece jazz ensemble and guest vocalists.',
      poster_url: poster('jazz-lights'),
      category_id: bySlug.concert,
      organizer: 'Blue Note Lagos',
      event_subtype: 'concert',
      venue_label: 'Main Hall',
      is_published: true,
    },
  ]

  const { data: events, error: eventError } = await supabase.from('events').insert(listings).select()
  if (eventError) throw eventError

  const byTitle = Object.fromEntries(events.map(e => [e.title, e]))

  // Sensible cinema times: matinee 14:00, early 17:00, prime 20:00 / 20:30
  const sessions = [
    // Red Dust Highway — today + weekend
    {
      event_id: byTitle['Red Dust Highway'].id,
      venue_id: v['Screen 1 — IMAX'].id,
      starts_at: showtime(0, 20, 0),
      base_price: 4500,
      vip_price: 7000,
    },
    {
      event_id: byTitle['Red Dust Highway'].id,
      venue_id: v['Screen 1 — IMAX'].id,
      starts_at: showtime(1, 17, 0),
      base_price: 4000,
      vip_price: 6500,
    },
    {
      event_id: byTitle['Red Dust Highway'].id,
      venue_id: v['Screen 2'].id,
      starts_at: showtime(2, 20, 30),
      base_price: 4000,
      vip_price: 6500,
    },

    // Letters from Enugu
    {
      event_id: byTitle['Letters from Enugu'].id,
      venue_id: v['Screen 2'].id,
      starts_at: showtime(0, 17, 0),
      base_price: 3500,
      vip_price: 5500,
    },
    {
      event_id: byTitle['Letters from Enugu'].id,
      venue_id: v['Screen 2'].id,
      starts_at: showtime(1, 20, 0),
      base_price: 3500,
      vip_price: 5500,
    },

    // Jollof Wars
    {
      event_id: byTitle['Jollof Wars'].id,
      venue_id: v['Screen 3'].id,
      starts_at: showtime(0, 14, 0),
      base_price: 3000,
      vip_price: 4500,
    },
    {
      event_id: byTitle['Jollof Wars'].id,
      venue_id: v['Screen 3'].id,
      starts_at: showtime(1, 14, 0),
      base_price: 3000,
      vip_price: 4500,
    },
    {
      event_id: byTitle['Jollof Wars'].id,
      venue_id: v['Screen 3'].id,
      starts_at: showtime(3, 16, 30),
      base_price: 3000,
      vip_price: 4500,
    },

    // Midnight Caller
    {
      event_id: byTitle['Midnight Caller'].id,
      venue_id: v['Screen 1 — IMAX'].id,
      starts_at: showtime(1, 20, 45),
      base_price: 4000,
      vip_price: 6500,
    },
    {
      event_id: byTitle['Midnight Caller'].id,
      venue_id: v['Screen 2'].id,
      starts_at: showtime(3, 21, 0),
      base_price: 4000,
      vip_price: 6500,
    },

    // Under the Almond Tree
    {
      event_id: byTitle['Under the Almond Tree'].id,
      venue_id: v['Screen 3'].id,
      starts_at: showtime(2, 17, 30),
      base_price: 3500,
      vip_price: 5000,
    },
    {
      event_id: byTitle['Under the Almond Tree'].id,
      venue_id: v['Screen 2'].id,
      starts_at: showtime(4, 19, 0),
      base_price: 3500,
      vip_price: 5000,
    },

    // Sky Heroes
    {
      event_id: byTitle['Sky Heroes: Rise'].id,
      venue_id: v['Screen 3'].id,
      starts_at: showtime(0, 11, 0),
      base_price: 2500,
      vip_price: 4000,
    },
    {
      event_id: byTitle['Sky Heroes: Rise'].id,
      venue_id: v['Screen 3'].id,
      starts_at: showtime(2, 11, 30),
      base_price: 2500,
      vip_price: 4000,
    },

    // Island of Shadows
    {
      event_id: byTitle['Island of Shadows'].id,
      venue_id: v['Screen 1 — IMAX'].id,
      starts_at: showtime(3, 20, 0),
      base_price: 4500,
      vip_price: 7500,
    },

    // Captain Iron
    {
      event_id: byTitle['Captain Iron'].id,
      venue_id: v['Screen 1 — IMAX'].id,
      starts_at: showtime(4, 17, 0),
      base_price: 4500,
      vip_price: 7500,
    },
    {
      event_id: byTitle['Captain Iron'].id,
      venue_id: v['Screen 1 — IMAX'].id,
      starts_at: showtime(5, 20, 0),
      base_price: 5000,
      vip_price: 8000,
    },

    // Events — evening slots on Main Hall / IMAX
    {
      event_id: byTitle['Afrobeats Summer Jam'].id,
      venue_id: v['Main Hall'].id,
      starts_at: showtime(5, 19, 0),
      base_price: 10000,
      vip_price: 25000,
    },
    {
      event_id: byTitle['Stand-Up Saturdays'].id,
      venue_id: v['Main Hall'].id,
      starts_at: showtime(6, 20, 0),
      base_price: 5000,
      vip_price: 12000,
    },
    {
      event_id: byTitle['The Palm Court — Live Play'].id,
      venue_id: v['Main Hall'].id,
      starts_at: showtime(4, 19, 30),
      base_price: 6000,
      vip_price: 15000,
    },
    {
      event_id: byTitle['Premier League Fan Fest'].id,
      venue_id: v['Screen 1 — IMAX'].id,
      starts_at: showtime(6, 15, 0),
      base_price: 3000,
      vip_price: 6000,
    },
    {
      event_id: byTitle['Jazz Under the Lights'].id,
      venue_id: v['Main Hall'].id,
      starts_at: showtime(7, 19, 0),
      base_price: 8000,
      vip_price: 18000,
    },
  ].map(s => ({ ...s, status: 'scheduled' }))

  console.log('Seeding sessions…')
  const { error: sessionError } = await supabase.from('sessions').insert(sessions)
  if (sessionError) throw sessionError

  console.log(
    `Done. Seeded ${listings.filter(l => l.kind === 'movie').length} movies, ${listings.filter(l => l.kind === 'event').length} events, ${sessions.length} sessions.`,
  )
  console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD} → /admin/login`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
