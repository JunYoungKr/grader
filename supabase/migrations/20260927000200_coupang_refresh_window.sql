-- A manual bootstrap before 09:00 must not skip that morning's scheduled refresh.
create function public.coupang_sync_window_start(p_now timestamptz) returns timestamptz
language sql immutable set search_path = '' as $$
  select (date_trunc('day', (p_now at time zone 'Asia/Seoul') - interval '9 hours') + interval '9 hours') at time zone 'Asia/Seoul';
$$;
revoke all on function public.coupang_sync_window_start(timestamptz) from public, anon, authenticated;

create or replace function public.claim_coupang_sync(p_run_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  update public.coupang_sync_state
  set active_run = p_run_id, lock_until = now() + interval '5 minutes', last_attempt_at = now(), last_error = null
  where name = 'coupang-bestsellers'
    and (lock_until is null or lock_until < now())
    and (last_success_at is null or last_success_at < public.coupang_sync_window_start(now()));
  return found;
end;
$$;

-- Verify the actual boundary function before applying this migration.
do $$
begin
  if public.coupang_sync_window_start('2026-09-27 08:59:59+09') <> '2026-09-26 09:00:00+09'::timestamptz
    or public.coupang_sync_window_start('2026-09-27 09:00:00+09') <> '2026-09-27 09:00:00+09'::timestamptz
    or public.coupang_sync_window_start('2026-09-27 23:59:59+09') <> '2026-09-27 09:00:00+09'::timestamptz then
    raise exception 'Invalid Korean daily refresh boundary';
  end if;
end;
$$;
