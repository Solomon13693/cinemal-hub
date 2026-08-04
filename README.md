# CinemaHub

Online movie & event ticket reservation system (Next.js + Supabase + Paystack).

## Setup

1. Copy `.env.example` to `.env` and fill Supabase + Paystack keys.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor.
3. Install and run:

```bash
npm install
npm run dev
```

4. Optional seed data:

```bash
npm run seed:cinema
```

Promote an admin by setting `profiles.role = 'admin'` for a user in Supabase, then sign in at `/admin/login`.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run seed:cinema` — seed categories, venues, movies, events, sessions
