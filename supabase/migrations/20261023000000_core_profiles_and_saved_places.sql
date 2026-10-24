-- Core user-owned data module, baselined against the existing Supabase project.
-- Keep this focused on profiles and saved places. Add future feature areas in
-- their own timestamped migration files.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) <= 80),
  created_at timestamptz not null default now()
);

create table if not exists public.saved_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_key text not null check (char_length(place_key) between 1 and 200),
  name text not null check (char_length(name) between 1 and 160),
  state text check (state is null or char_length(state) <= 160),
  latitude double precision check (latitude is null or latitude between -90 and 90),
  longitude double precision check (longitude is null or longitude between -180 and 180),
  image_url text check (image_url is null or char_length(image_url) <= 2048),
  created_at timestamptz not null default now(),
  unique (user_id, place_key)
);

create index if not exists saved_places_user_created_idx
  on public.saved_places (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.saved_places enable row level security;

drop policy if exists "Insert own profile" on public.profiles;
create policy "Insert own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Read own profile" on public.profiles;
create policy "Read own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Manage own saved places" on public.saved_places;
create policy "Manage own saved places"
  on public.saved_places for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant all on table public.profiles to anon, authenticated, service_role;
grant all on table public.saved_places to anon, authenticated, service_role;
