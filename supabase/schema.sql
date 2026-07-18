-- Grader 콘텐츠 스키마 (Supabase SQL Editor에서 1회 실행)
-- Article(lib/types.ts)을 1:1로 담는다 — 중첩 구조는 jsonb.
-- 쓰기는 service role 전용(어드민 서버 액션·시드 스크립트), 공개 읽기는 published만.

create table if not exists public.articles (
  slug        text primary key,
  category    text not null,
  type        text not null check (type in ('comparison', 'guide', 'hub')),
  title       text not null,
  description text not null default '',
  updated     text not null default '',          -- "YYYY.MM" (사이트 표기·sitemap lastModified)
  medical     boolean not null default false,
  summary     jsonb not null default '[]'::jsonb, -- string[]
  axes        jsonb,                              -- Axis[]
  products    jsonb,                              -- Product[]
  promo_banner jsonb,                             -- PromoBanner
  sections    jsonb,                              -- Section[]
  checklist   jsonb,                              -- { caption?, items[] }
  related     jsonb,                              -- RelatedLink[]
  sources     jsonb,                              -- Source[]
  published   boolean not null default true,
  sort_order  integer not null default 100,       -- 홈 "최신 글" 정렬(낮을수록 위)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists articles_category_idx on public.articles (category) where published;

alter table public.articles enable row level security;

-- 공개 읽기: published 글만 (anon key)
drop policy if exists "public read published" on public.articles;
create policy "public read published"
  on public.articles for select
  using (published);

-- insert/update/delete 정책 없음 → service role만 쓰기 가능
