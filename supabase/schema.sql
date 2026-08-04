-- CinemaHub — Supabase schema
-- Run this in the Supabase dashboard SQL Editor.

-- User profiles (extends Supabase Auth)
create table profiles (
  id uuid references auth.users primary key,
  name text not null,
  phone text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now()
);

-- Categories (shared for movies & events)
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  image_url text,
  created_at timestamptz default now()
);

-- Unified listings: movies and live events
create table events (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('movie', 'event')),
  title text not null,
  synopsis text,
  poster_url text,
  category_id uuid references categories(id) on delete set null,
  is_published boolean default true,
  duration_minutes int,
  rating text,
  trailer_url text,
  organizer text,
  event_subtype text check (event_subtype is null or event_subtype in ('concert', 'theatre', 'comedy', 'sports', 'other')),
  venue_label text,
  created_at timestamptz default now()
);

-- Venues / halls with seat grid config
create table venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rows int not null check (rows > 0 and rows <= 26),
  seats_per_row int not null check (seats_per_row > 0 and seats_per_row <= 40),
  created_at timestamptz default now()
);

-- Seats per venue
create table seats (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade not null,
  row_label text not null,
  seat_number int not null,
  seat_type text not null default 'standard' check (seat_type in ('standard', 'vip')),
  unique (venue_id, row_label, seat_number)
);

-- Sessions (showtimes / event times)
create table sessions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  venue_id uuid references venues(id) on delete restrict not null,
  starts_at timestamptz not null,
  base_price numeric(10,2) not null,
  vip_price numeric(10,2) not null,
  status text default 'scheduled' check (status in ('scheduled', 'cancelled', 'completed')),
  created_at timestamptz default now()
);

-- Bookings
create table bookings (
  id uuid primary key default gen_random_uuid(),
  booking_number text unique not null,
  user_id uuid references profiles(id) not null,
  session_id uuid references sessions(id) on delete restrict not null,
  status text default 'pending' check (status in ('pending', 'paid', 'cancelled', 'used')),
  total_amount numeric(10,2) not null,
  payment_method text default 'paystack' check (payment_method in ('paystack')),
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  payment_reference text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Seats held/sold on a booking
create table booking_seats (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade not null,
  seat_id uuid references seats(id) on delete restrict not null,
  session_id uuid references sessions(id) on delete restrict not null,
  price numeric(10,2) not null
);

-- Active seat holds: one seat per session for pending (unexpired) or paid bookings
create unique index booking_seats_active_unique
  on booking_seats (session_id, seat_id);

-- =========================================================
-- Row Level Security
-- =========================================================

alter table profiles enable row level security;
alter table categories enable row level security;
alter table events enable row level security;
alter table venues enable row level security;
alter table seats enable row level security;
alter table sessions enable row level security;
alter table bookings enable row level security;
alter table booking_seats enable row level security;

create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- profiles
create policy "profiles_select_own_or_admin" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- categories: public read, admin write
create policy "categories_select_all" on categories for select using (true);
create policy "categories_admin_write" on categories for insert with check (is_admin());
create policy "categories_admin_update" on categories for update using (is_admin());
create policy "categories_admin_delete" on categories for delete using (is_admin());

-- events: public can read published; admins all; admin write
create policy "events_select_published_or_admin" on events
  for select using (is_published = true or is_admin());
create policy "events_admin_write" on events for insert with check (is_admin());
create policy "events_admin_update" on events for update using (is_admin());
create policy "events_admin_delete" on events for delete using (is_admin());

-- venues & seats: public read, admin write
create policy "venues_select_all" on venues for select using (true);
create policy "venues_admin_write" on venues for insert with check (is_admin());
create policy "venues_admin_update" on venues for update using (is_admin());
create policy "venues_admin_delete" on venues for delete using (is_admin());

create policy "seats_select_all" on seats for select using (true);
create policy "seats_admin_write" on seats for insert with check (is_admin());
create policy "seats_admin_update" on seats for update using (is_admin());
create policy "seats_admin_delete" on seats for delete using (is_admin());

-- sessions: public read scheduled, admin all + write
create policy "sessions_select_all" on sessions for select using (true);
create policy "sessions_admin_write" on sessions for insert with check (is_admin());
create policy "sessions_admin_update" on sessions for update using (is_admin());
create policy "sessions_admin_delete" on sessions for delete using (is_admin());

-- bookings: own or admin
create policy "bookings_select_own_or_admin" on bookings
  for select using (auth.uid() = user_id or is_admin());
create policy "bookings_insert_own" on bookings
  for insert with check (auth.uid() = user_id);
create policy "bookings_update_own_or_admin" on bookings
  for update using (auth.uid() = user_id or is_admin());

create policy "booking_seats_select_own_or_admin" on booking_seats
  for select using (
    exists (
      select 1 from bookings
      where bookings.id = booking_seats.booking_id
        and (bookings.user_id = auth.uid() or is_admin())
    )
  );
create policy "booking_seats_insert_own" on booking_seats
  for insert with check (
    exists (
      select 1 from bookings
      where bookings.id = booking_seats.booking_id and bookings.user_id = auth.uid()
    )
  );

-- Allow anyone authenticated to see which seats are taken (for seat map)
-- via a security definer view or by allowing select on booking_seats for active holds.
-- Simpler: public select of session_id + seat_id for non-cancelled active bookings via policy:
drop policy if exists "booking_seats_select_own_or_admin" on booking_seats;
create policy "booking_seats_select_map_or_own" on booking_seats
  for select using (
    exists (
      select 1 from bookings b
      where b.id = booking_seats.booking_id
        and (
          b.user_id = auth.uid()
          or is_admin()
          or (
            b.status in ('pending', 'paid')
            and (b.status = 'paid' or b.expires_at is null or b.expires_at > now())
          )
        )
    )
  );

-- =========================================================
-- Profile trigger on signup
-- =========================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =========================================================
-- updated_at on bookings
-- =========================================================

create or replace function set_bookings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bookings_set_updated_at
  before update on bookings
  for each row execute function set_bookings_updated_at();

-- =========================================================
-- Storage
-- =========================================================

insert into storage.buckets (id, name, public)
values ('event-posters', 'event-posters', true)
on conflict (id) do nothing;

create policy "event_posters_public_read"
  on storage.objects for select
  using (bucket_id = 'event-posters');

create policy "event_posters_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'event-posters' and is_admin());

create policy "event_posters_admin_update"
  on storage.objects for update
  using (bucket_id = 'event-posters' and is_admin());

create policy "event_posters_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'event-posters' and is_admin());
