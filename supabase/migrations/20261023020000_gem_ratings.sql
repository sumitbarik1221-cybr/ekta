-- Gem rating module. This records the current production schema; moderation
-- changes should be introduced later as an additive gem-ratings migration.

create table if not exists public.gem_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_key text not null check (char_length(place_key) between 1 and 200),
  gem_key text not null check (char_length(gem_key) between 1 and 200),
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique (user_id, place_key, gem_key)
);

alter table public.gem_ratings enable row level security;

drop policy if exists "Manage own gem ratings" on public.gem_ratings;
create policy "Manage own gem ratings"
  on public.gem_ratings for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Read own gem ratings" on public.gem_ratings;
create policy "Read own gem ratings"
  on public.gem_ratings for select to authenticated
  using ((select auth.uid()) = user_id);

grant all on table public.gem_ratings to anon, authenticated, service_role;
