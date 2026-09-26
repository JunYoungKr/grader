-- Additive schema. Existing articles and authentication tables are untouched.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

create table public.coupang_product_snapshots (
  name text primary key check (name = 'coupang-bestsellers'),
  payload jsonb not null check (jsonb_typeof(payload->'categories') = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.coupang_product_snapshots enable row level security;
create policy "public read product snapshot" on public.coupang_product_snapshots for select to anon, authenticated using (true);
grant select on public.coupang_product_snapshots to anon, authenticated;
grant all on public.coupang_product_snapshots to service_role;

create table public.coupang_sync_state (
  name text primary key check (name = 'coupang-bestsellers'),
  active_run uuid,
  lock_until timestamptz,
  last_attempt_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  product_count integer,
  endpoint_url text
);
insert into public.coupang_sync_state(name) values ('coupang-bestsellers');
alter table public.coupang_sync_state enable row level security;
revoke all on public.coupang_sync_state from anon, authenticated;
grant all on public.coupang_sync_state to service_role;

create function public.claim_coupang_sync(p_run_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  update public.coupang_sync_state
  set active_run = p_run_id, lock_until = now() + interval '5 minutes', last_attempt_at = now(), last_error = null
  where name = 'coupang-bestsellers'
    and (lock_until is null or lock_until < now())
    and (last_success_at is null or (last_success_at at time zone 'Asia/Seoul')::date < (now() at time zone 'Asia/Seoul')::date);
  return found;
end;
$$;

create function public.complete_coupang_sync(p_run_id uuid, p_snapshot jsonb) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_count integer;
begin
  perform 1 from public.coupang_sync_state
  where name = 'coupang-bestsellers' and active_run = p_run_id and lock_until > now() for update;
  if not found then return false; end if;
  if jsonb_typeof(p_snapshot->'categories') is distinct from 'object' then raise exception 'Invalid snapshot'; end if;
  select sum(jsonb_array_length(value)) into v_count from jsonb_each(p_snapshot->'categories');
  if v_count is distinct from 120 then raise exception 'Expected 120 products'; end if;
  insert into public.coupang_product_snapshots(name, payload) values ('coupang-bestsellers', p_snapshot)
  on conflict (name) do update set payload = excluded.payload, updated_at = now();
  update public.coupang_sync_state set active_run = null, lock_until = null, last_success_at = now(), last_error = null, product_count = v_count where name = 'coupang-bestsellers';
  return true;
end;
$$;

create function public.fail_coupang_sync(p_run_id uuid, p_error text) returns void
language sql security definer set search_path = '' as $$
  update public.coupang_sync_state set active_run = null, lock_until = null, last_error = left(p_error, 500)
  where name = 'coupang-bestsellers' and active_run = p_run_id;
$$;

-- Credentials are passed at setup time, stored in Vault, and never embedded in migration files or cron commands.
create function public.configure_coupang_schedule(p_endpoint_url text, p_secret text) returns bigint
language plpgsql security definer set search_path = '' as $$
declare v_secret_id uuid; v_job_id bigint;
begin
  if p_endpoint_url !~ '^https://([a-z0-9-]+\.vercel\.app|grader\.co\.kr|www\.grader\.co\.kr)/api/cron/coupang$' or length(p_secret) < 32 then
    raise exception 'Invalid sync endpoint or secret';
  end if;
  select id into v_secret_id from vault.secrets where name = 'grader_coupang_sync_secret';
  if v_secret_id is null then
    perform vault.create_secret(p_secret, 'grader_coupang_sync_secret', 'Authorization for the Grader daily product refresh');
  else
    perform vault.update_secret(v_secret_id, p_secret);
  end if;
  update public.coupang_sync_state set endpoint_url = p_endpoint_url where name = 'coupang-bestsellers';
  -- pg_cron uses UTC here: 00:00 UTC = 09:00 Asia/Seoul, every day.
  select cron.schedule('coupang-products-daily-0900-kst', '0 0 * * *', $job$
    select net.http_post(
      url := (select endpoint_url from public.coupang_sync_state where name = 'coupang-bestsellers'),
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'grader_coupang_sync_secret')),
      body := '{}'::jsonb,
      timeout_milliseconds := 60000
    );
  $job$) into v_job_id;
  return v_job_id;
end;
$$;

create function public.coupang_sync_status() returns jsonb
language sql security definer set search_path = '' as $$
  select jsonb_build_object(
    'lastAttemptAt', s.last_attempt_at, 'lastSuccessAt', s.last_success_at,
    'lastError', s.last_error, 'productCount', s.product_count,
    'running', coalesce(s.lock_until > now(), false),
    'endpoint', s.endpoint_url,
    'schedule', (select jsonb_build_object('id', jobid, 'active', active, 'expression', schedule, 'timezone', coalesce(current_setting('cron.timezone', true), 'GMT')) from cron.job where jobname = 'coupang-products-daily-0900-kst')
  ) from public.coupang_sync_state s where s.name = 'coupang-bestsellers';
$$;

revoke all on function public.claim_coupang_sync(uuid) from public, anon, authenticated;
revoke all on function public.complete_coupang_sync(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.fail_coupang_sync(uuid, text) from public, anon, authenticated;
revoke all on function public.configure_coupang_schedule(text, text) from public, anon, authenticated;
revoke all on function public.coupang_sync_status() from public, anon, authenticated;
grant execute on function public.claim_coupang_sync(uuid) to service_role;
grant execute on function public.complete_coupang_sync(uuid, jsonb) to service_role;
grant execute on function public.fail_coupang_sync(uuid, text) to service_role;
grant execute on function public.configure_coupang_schedule(text, text) to service_role;
grant execute on function public.coupang_sync_status() to service_role;
