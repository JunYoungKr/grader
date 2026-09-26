-- Keep editorial decisions while showing only products found in the latest batch.
alter table public.coupang_promo_candidates
  add column is_current boolean not null default true;

create index coupang_promo_candidates_current_status
  on public.coupang_promo_candidates(is_current, review_status, last_seen_at desc);

create or replace function public.save_coupang_promo_candidates(p_candidates jsonb) returns integer
language plpgsql security definer set search_path = '' as $$
declare v_count integer;
begin
  if jsonb_typeof(p_candidates) is distinct from 'array'
    or jsonb_array_length(p_candidates) < 1
    or jsonb_array_length(p_candidates) > 200 then
    raise exception 'Invalid candidate batch';
  end if;

  update public.coupang_promo_candidates set is_current = false where is_current;

  insert into public.coupang_promo_candidates (
    product_key, product_id, item_id, name, price, price_checked_at,
    image_url, affiliate_url, category_name, is_rocket, is_free_shipping,
    sources, last_seen_at, is_current
  )
  select
    candidate->>'productKey', (candidate->>'productId')::bigint,
    candidate->>'itemId', candidate->>'name', (candidate->>'price')::integer,
    (candidate->>'checkedAt')::timestamptz,
    candidate->>'imageUrl', candidate->>'affiliateUrl',
    candidate->>'categoryName', (candidate->>'isRocket')::boolean,
    (candidate->>'isFreeShipping')::boolean,
    array(select jsonb_array_elements_text(candidate->'sources')),
    (candidate->>'checkedAt')::timestamptz, true
  from jsonb_array_elements(p_candidates) as candidate
  on conflict (product_key) do update set
    name = excluded.name,
    previous_price = case
      when public.coupang_promo_candidates.price_checked_at < excluded.price_checked_at
        then public.coupang_promo_candidates.price
      else public.coupang_promo_candidates.previous_price
    end,
    previous_price_checked_at = case
      when public.coupang_promo_candidates.price_checked_at < excluded.price_checked_at
        then public.coupang_promo_candidates.price_checked_at
      else public.coupang_promo_candidates.previous_price_checked_at
    end,
    price = excluded.price,
    price_checked_at = excluded.price_checked_at,
    image_url = excluded.image_url,
    affiliate_url = excluded.affiliate_url,
    category_name = excluded.category_name,
    is_rocket = excluded.is_rocket,
    is_free_shipping = excluded.is_free_shipping,
    sources = excluded.sources,
    last_seen_at = excluded.last_seen_at,
    is_current = true
  where public.coupang_promo_candidates.price_checked_at <= excluded.price_checked_at;

  v_count := jsonb_array_length(p_candidates);
  update public.coupang_promo_sync_state
    set last_success_at = now(), candidate_count = v_count
    where name = 'promo-candidates';
  return v_count;
end;
$$;
