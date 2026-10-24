-- Community review module. Review moderation is controlled by the status
-- column; only service-side code should approve or reject submissions.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_key text not null check (char_length(place_key) between 1 and 200),
  body text not null check (char_length(body) between 10 and 2000),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists reviews_place_status_idx
  on public.reviews (place_key, status, created_at desc);

alter table public.reviews enable row level security;

drop policy if exists "Read approved reviews or own" on public.reviews;
create policy "Read approved reviews or own"
  on public.reviews for select to anon, authenticated
  using (status = 'approved' or (select auth.uid()) = user_id);

drop policy if exists "Submit own pending reviews" on public.reviews;
create policy "Submit own pending reviews"
  on public.reviews for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'pending');

drop policy if exists "Edit own pending reviews" on public.reviews;
create policy "Edit own pending reviews"
  on public.reviews for update to authenticated
  using ((select auth.uid()) = user_id and status = 'pending')
  with check ((select auth.uid()) = user_id and status = 'pending');

drop policy if exists "Delete own pending reviews" on public.reviews;
create policy "Delete own pending reviews"
  on public.reviews for delete to authenticated
  using ((select auth.uid()) = user_id and status = 'pending');

grant all on table public.reviews to anon, authenticated, service_role;
