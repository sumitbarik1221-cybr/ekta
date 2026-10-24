-- Add the shared hidden-gem suggestion workflow and expose aggregate ratings
-- without exposing individual users' rating rows.

create table if not exists public.gem_suggestions (
  id uuid primary key default gen_random_uuid(),
  destination_key text not null check (char_length(destination_key) between 1 and 180),
  destination_name text not null check (char_length(destination_name) between 1 and 160),
  name text not null check (char_length(name) between 2 and 160),
  description text not null check (char_length(description) between 20 and 1200),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  submitted_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending_ai'
    check (status in ('pending_ai', 'possible', 'user_verified', 'admin_approved', 'verified_all', 'rejected')),
  ai_checked boolean not null default false,
  ai_passed boolean,
  admin_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists gem_suggestions_destination_status_idx
  on public.gem_suggestions (destination_key, status, created_at desc);

alter table public.gem_suggestions enable row level security;

drop policy if exists "Read public gems or own pending suggestions" on public.gem_suggestions;
create policy "Read public gems or own pending suggestions"
  on public.gem_suggestions for select to anon, authenticated
  using (
    status in ('possible', 'user_verified', 'admin_approved', 'verified_all')
    or (select auth.uid()) = submitted_by
  );

drop policy if exists "Submit own pending gem suggestions" on public.gem_suggestions;
create policy "Submit own pending gem suggestions"
  on public.gem_suggestions for insert to authenticated
  with check ((select auth.uid()) = submitted_by and status = 'pending_ai');

drop policy if exists "Delete own pending gem suggestions" on public.gem_suggestions;
create policy "Delete own pending gem suggestions"
  on public.gem_suggestions for delete to authenticated
  using ((select auth.uid()) = submitted_by and status = 'pending_ai');

grant select on table public.gem_suggestions to anon, authenticated;
grant insert, delete on table public.gem_suggestions to authenticated;
grant all on table public.gem_suggestions to service_role;

create or replace view public.gem_rating_summary
with (security_invoker = false) as
select place_key,
       lower(gem_key) as gem_key,
       count(*)::int as rating_count,
       round(avg(rating)::numeric, 2) as average_rating
from public.gem_ratings
group by place_key, lower(gem_key);

revoke all on public.gem_rating_summary from public;
grant select on public.gem_rating_summary to anon, authenticated;
