-- Private editorial queue. Product facts come from the Partners API.
create table public.coupang_promo_candidates (
  product_key text primary key,
  product_id bigint not null,
  item_id text not null,
  name text not null,
  price integer not null check (price > 0),
  previous_price integer check (previous_price > 0),
  price_checked_at timestamptz not null,
  previous_price_checked_at timestamptz,
  image_url text not null,
  affiliate_url text not null,
  category_name text not null,
  is_rocket boolean not null default false,
  is_free_shipping boolean not null default false,
  sources text[] not null default '{}',
  review_status text not null default 'new' check (review_status in ('new', 'saved', 'dismissed')),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
create index coupang_promo_candidates_recent on public.coupang_promo_candidates(last_seen_at desc);
create index coupang_promo_candidates_status_recent on public.coupang_promo_candidates(review_status, last_seen_at desc);
alter table public.coupang_promo_candidates enable row level security;
revoke all on public.coupang_promo_candidates from anon, authenticated;
grant all on public.coupang_promo_candidates to service_role;

create table public.coupang_promo_sync_state (
  name text primary key check (name = 'promo-candidates'),
  last_success_at timestamptz,
  candidate_count integer
);
insert into public.coupang_promo_sync_state(name) values ('promo-candidates');
alter table public.coupang_promo_sync_state enable row level security;
revoke all on public.coupang_promo_sync_state from anon, authenticated;
grant all on public.coupang_promo_sync_state to service_role;

create function public.save_coupang_promo_candidates(p_candidates jsonb) returns integer
language plpgsql security definer set search_path = '' as $$
declare v_count integer;
begin
  if jsonb_typeof(p_candidates) is distinct from 'array'
    or jsonb_array_length(p_candidates) < 1
    or jsonb_array_length(p_candidates) > 200 then
    raise exception 'Invalid candidate batch';
  end if;

  insert into public.coupang_promo_candidates (
    product_key, product_id, item_id, name, price, price_checked_at,
    image_url, affiliate_url, category_name, is_rocket, is_free_shipping,
    sources, last_seen_at
  )
  select
    candidate->>'productKey', (candidate->>'productId')::bigint,
    candidate->>'itemId', candidate->>'name', (candidate->>'price')::integer,
    (candidate->>'checkedAt')::timestamptz,
    candidate->>'imageUrl', candidate->>'affiliateUrl',
    candidate->>'categoryName', (candidate->>'isRocket')::boolean,
    (candidate->>'isFreeShipping')::boolean,
    array(select jsonb_array_elements_text(candidate->'sources')),
    (candidate->>'checkedAt')::timestamptz
  from jsonb_array_elements(p_candidates) as candidate
  on conflict (product_key) do update set
    name = excluded.name,
    previous_price = public.coupang_promo_candidates.price,
    previous_price_checked_at = public.coupang_promo_candidates.price_checked_at,
    price = excluded.price,
    price_checked_at = excluded.price_checked_at,
    image_url = excluded.image_url,
    affiliate_url = excluded.affiliate_url,
    category_name = excluded.category_name,
    is_rocket = excluded.is_rocket,
    is_free_shipping = excluded.is_free_shipping,
    sources = excluded.sources,
    last_seen_at = excluded.last_seen_at
  where public.coupang_promo_candidates.price_checked_at < excluded.price_checked_at;

  v_count := jsonb_array_length(p_candidates);
  update public.coupang_promo_sync_state
    set last_success_at = now(), candidate_count = v_count
    where name = 'promo-candidates';
  return v_count;
end;
$$;
revoke all on function public.save_coupang_promo_candidates(jsonb) from public, anon, authenticated;
grant execute on function public.save_coupang_promo_candidates(jsonb) to service_role;
