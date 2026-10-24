-- Track failed password sign-ins by a server-generated SHA-256 email hash.
-- Raw email addresses and passwords are never stored in this table.
create table if not exists public.auth_login_failures (
  email_hash text primary key check (email_hash ~ '^[0-9a-f]{64}$'),
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  window_started_at timestamptz not null default now(),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.auth_login_failures enable row level security;
revoke all on table public.auth_login_failures from public, anon, authenticated;

create or replace function public.ekta_check_auth_login_lock(p_email_hash text)
returns table (is_locked boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_row public.auth_login_failures%rowtype;
begin
  if p_email_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid email hash';
  end if;

  select * into current_row
  from public.auth_login_failures
  where email_hash = p_email_hash
  for update;

  if not found then
    return query select false, 0;
    return;
  end if;

  if current_row.locked_until > now() then
    return query select true, greatest(1, ceil(extract(epoch from current_row.locked_until - now()))::integer);
    return;
  end if;

  if current_row.locked_until is not null or current_row.window_started_at <= now() - interval '24 hours' then
    update public.auth_login_failures
    set failed_attempts = 0, window_started_at = now(), locked_until = null, updated_at = now()
    where email_hash = p_email_hash;
  end if;

  return query select false, 0;
end;
$$;

create or replace function public.ekta_record_auth_login_failure(p_email_hash text)
returns table (failed_attempts integer, is_locked boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_row public.auth_login_failures%rowtype;
  next_attempts integer;
  next_window timestamptz;
  next_lock timestamptz;
begin
  if p_email_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid email hash';
  end if;

  insert into public.auth_login_failures (email_hash)
  values (p_email_hash)
  on conflict (email_hash) do nothing;

  select * into current_row
  from public.auth_login_failures
  where email_hash = p_email_hash
  for update;

  if current_row.locked_until > now() then
    return query select current_row.failed_attempts, true,
      greatest(1, ceil(extract(epoch from current_row.locked_until - now()))::integer);
    return;
  end if;

  if current_row.window_started_at <= now() - interval '24 hours' or current_row.locked_until is not null then
    next_attempts := 1;
    next_window := now();
  else
    next_attempts := current_row.failed_attempts + 1;
    next_window := current_row.window_started_at;
  end if;

  next_lock := case when next_attempts > 50 then now() + interval '2 hours' else null end;
  update public.auth_login_failures
  set failed_attempts = next_attempts, window_started_at = next_window,
      locked_until = next_lock, updated_at = now()
  where email_hash = p_email_hash;

  return query select next_attempts, next_lock is not null,
    case when next_lock is null then 0 else 7200 end;
end;
$$;

create or replace function public.ekta_clear_auth_login_failures(p_email_hash text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_email_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid email hash';
  end if;
  delete from public.auth_login_failures where email_hash = p_email_hash;
end;
$$;

revoke all on function public.ekta_check_auth_login_lock(text) from public, anon, authenticated;
revoke all on function public.ekta_record_auth_login_failure(text) from public, anon, authenticated;
revoke all on function public.ekta_clear_auth_login_failures(text) from public, anon, authenticated;
grant execute on function public.ekta_check_auth_login_lock(text) to service_role;
grant execute on function public.ekta_record_auth_login_failure(text) to service_role;
grant execute on function public.ekta_clear_auth_login_failures(text) to service_role;
