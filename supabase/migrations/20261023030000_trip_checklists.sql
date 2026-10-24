-- Personal trip checklist module.

create table if not exists public.trip_checklists (
  user_id uuid primary key references auth.users(id) on delete cascade,
  note text not null default '' check (char_length(note) <= 4000),
  updated_at timestamptz not null default now()
);

alter table public.trip_checklists enable row level security;

drop policy if exists "Manage own trip checklist" on public.trip_checklists;
create policy "Manage own trip checklist"
  on public.trip_checklists for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant all on table public.trip_checklists to anon, authenticated, service_role;
