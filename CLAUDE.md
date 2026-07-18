# CLAUDE.md

Claude Code용 프로젝트 컨텍스트. 작업 시작 전 이 파일을 먼저 읽고, 아래 원칙·규칙을 지킬 것.

## 한 줄 요약

여러 카테고리의 생활 제품을 **안전성·성능·성분·가격 등으로 등급화(S/A/B/C)해 비교**하고,
쿠팡 파트너스 등 **제휴 링크로 수익**을 내는 콘텐츠 사이트. 브랜드명은 **Grader**, 도메인은 **grader.co.kr**.

## 스택 & 명령어

- Next.js 15 (App Router) · React 19 · TypeScript(strict) · Tailwind 3 · Vitest
- Node 18.18+ (권장 20+)
- `npm install` → `npm run dev`(localhost:3000) → `npm run build`(정적 생성 검증)
- `npm run test` — Vitest 단위 테스트 (`lib/explorer.ts`, `lib/coupang.ts` 커버)
- 폰트: Pretendard (런타임에 jsDelivr CDN 로드, `app/globals.css`의 @import)
- 환경변수: `.env.local` (예시는 `.env.local.example`)
  - `NEXT_PUBLIC_SITE_URL` — 배포 도메인 (미설정 시 https://grader.co.kr)
  - `COUPANG_ACCESS_KEY` / `COUPANG_SECRET_KEY` — 쿠팡 파트너스 API

## 반드시 지킬 원칙 (위반 시 사이트가 죽거나 신뢰를 잃음)

1. **실제 데이터만.** 스펙·가격·평점을 지어내지 말 것. 쿠팡 파트너스 API(`lib/coupang.ts`)
   등 1차 출처에서 가져온다. 가격은 변동되므로 "조회 시점" 표기 + 실시간가는 링크로 안내.
2. **E-E-A-T 유지.** 운영자 실명·평가 방법론·1차 출처(법령·식약처·소비자원·학회) 인용.
   "우리 아이가 직접 써봤다"식 거짓 경험 금지. 건강·안전 글(YMYL)은 `medical: true`로 의료 면책 표시.
3. **양산형 콘텐츠 금지.** 구글 scaled content abuse 페널티 대상. AI 초안은 반드시 사람 검수 후 발행.
   분량 채우기용 패딩 금지 — 길이는 실제 비교 깊이로만.
4. **제휴 고지 유지.** 글에 쓰인 제휴처에 맞는 공정위 고지 자동 노출(`DisclosureNote`).
   모든 제휴 링크는 `rel="sponsored nofollow noopener"` (`AffiliateButton`이 처리).
5. **디자인 토큰 일원화.** 색은 `app/globals.css`의 CSS 변수 + `tailwind.config.ts` 토큰,
   등급색은 `lib/grade.ts`, 제휴처 설정은 `lib/providers.ts`에서만 관리. 하드코딩 금지.
6. **답-우선 레이아웃 유지.** 글 상단 요약(SummaryBox) → 목차(TOC) → 등급표, 상세는 아래로.
   모바일 하단 고정 CTA(StickyCta) 유지.

## 파일 맵

```
src/
  app/
    layout.tsx                 공통 헤더/푸터·메타데이터(SITE_URL 기반)·다크모드 초기화 스크립트
    page.tsx                   홈(제품 카테고리 + 최신 글)
    [slug]/page.tsx            글 페이지 — type별 렌더 + 답-우선 레이아웃 + 데스크톱 우측 사이드바(목차·최근 본 제품)
    about/page.tsx             소개·평가 방법론·운영자 정보 (E-E-A-T)
    privacy/page.tsx           개인정보 처리방침
    category/[category]/page.tsx  카테고리 목록
    sitemap.ts / robots.ts     전 URL 자동 사이트맵 + robots
    globals.css                디자인 토큰(CSS 변수)·다크모드
  components/
    GradeBadge ProductCard ComparisonTable/Cards ProductImage   등급·비교 UI
    ComparisonExplorer FilterPanel MatchBadge       인터랙티브 비교 엔진(예산·기능·월령 필터 island)
    AffiliateButton ProviderTag DisclosureNote      제휴 링크·출처·고지
    PromoBanner                                     제휴처 공식 배너(쿠팡 creative + 필수 고지문구)
    SummaryBox TableOfContents StickyCta            답-우선 레이아웃
    SourceList RelatedLinks MedicalDisclaimer       E-E-A-T(출처·내부링크·면책)
    ChecklistTable                                  품목별 권장 수량 표(guide → 비교글 퍼널)
    RecentlyViewed ThemeToggle                      최근 본 제품(localStorage)·다크모드 토글
    MethodologyStrip MetricCard Header Footer ExternalIcon
    Analytics ViewItemList                          GA4 로더·SPA 페이지뷰·클릭 위임·등급표 도달 추적
  lib/
    types.ts      데이터 모델 (Article/Product/Grade/Provider/ProductAttributes/PromoBanner ...)
    grade.ts      등급 색·라벨, 가격 포맷
    explorer.ts   비교 엔진 순수 함수(deriveFilters·rankProducts) — explorer.test.ts(Vitest)
    providers.ts  제휴처 설정·고지문 빌더
    content.ts    글/카테고리 로더 (정적 import — 늘면 CMS/DB로)
    site.ts       SITE_URL·SITE_NAME·OPERATOR_NAME·CONTACT_EMAIL·날짜 파서
    coupang.ts    쿠팡 파트너스 Open API 클라이언트 (서버 전용)
    gtag.ts       GA4 이벤트 헬퍼 (전환=select_item, no-op 가드)
    jsonld.tsx    구조화 데이터
  content/
    categories.ts          제품 대분류(baby/daily-life/digital/food/beauty/sports) — API 발급 전 임시 수동 분류
    products/*.ts          comparison 글 (pants-hem-clip, pepsi-zero-lime ...)
    guides/*.ts            guide 글
    hubs/*.ts              hub 글
scripts/
  build-from-coupang.ts    쿠팡 키워드 검색 → 사람 검수용 비교글 초안 생성 (npm run build:coupang)
  sync-coupang-bestsellers.ts  카테고리별 베스트 20개 정적 스냅샷 갱신 (npm run sync:coupang)
  analytics-insights.ts    GA4 Data API → Claude 퍼널 진단·개선안 (npm run insights)
docs/superpowers/          설계 스펙·구현 플랜 아카이브 (비교 엔진, 프로모 배너)
```

## 애널리틱스 (GA4) — 이탈·전환 추적

- **전환(북극성) = 제휴 클릭(`select_item`).** 실제 구매는 GA로 못 잡음(쿠팡 측 발생) → 쿠팡 파트너스 대시보드와 대조.
- **퍼널**: `page_view` → `scroll`(90%, GA4 자동) → `view_item_list`(등급표 도달) → `select_item`(제휴 클릭). `toc_click`은 관심 신호.
- **관심 신호 `filter_apply`**: 인터랙티브 비교 엔진에서 조건(예산·기능·월령) 적용 시 전송(`view_item_list`→`select_item` 사이). `filter_budget_max`/`filter_features`/`filter_month`/`top_item` 파라미터는 GA4 **커스텀** 측정기준이라 리포트에 쓰려면 등록 필요. 구현: `lib/explorer.ts`(순수 함수) + `components/ComparisonExplorer.tsx`(island) + `lib/gtag.ts`의 `trackFilter`.
- `select_item` 파라미터: `item_brand`(제휴처)·`item_category`(등급)·`item_list_id`(글 slug)·`item_name`(제품)은 GA4 **표준** 측정기준이라 등록 없이 리포트에 잡힘. `placement`(comparison_table/sticky_cta/product_card)만 커스텀 → 필요 시 GA4 맞춤 측정기준 등록.
- 구현: `lib/gtag.ts`(헬퍼, GA_ID 미설정 시 no-op) · `components/Analytics.tsx`(gtag 로더 + SPA 페이지뷰 + `a[data-ga]` 클릭 위임) · `ViewItemList.tsx`(IntersectionObserver). `AffiliateButton`/`TableOfContents`는 `data-ga-*` 속성만 달고 서버 컴포넌트 유지.
- **켜는 법**: `NEXT_PUBLIC_GA_ID=G-XXXX` 설정 후 재빌드(클라이언트 inline 변수). GA4에서 `select_item`을 **주요 이벤트**로 표시 + 향상된 측정(스크롤) 켜기.
- 상세 설정·DebugView·맞춤 정의·퍼널: `docs/ga4-setup.md`.
- **AI 인사이트 루프**: `npm run insights` → `scripts/analytics-insights.ts`가 GA4 Data API로 퍼널/글별/등급/제휴처 지표를 끌어와 Claude에게 진단·우선순위 액션을 받음. 필요 env: `GA4_PROPERTY_ID`(숫자)·`GOOGLE_APPLICATION_CREDENTIALS`(서비스 계정 JSON, 속성에 뷰어 권한)·`ANTHROPIC_API_KEY`. 데이터 1~2주 쌓인 뒤 실행. 스크립트 deps는 `npm install` 필요(앱 빌드와 분리, tsconfig `exclude`).

## 데이터 모델 (lib/types.ts)

- `Article.type = "comparison" | "guide" | "hub"`
  - comparison: `products` + `axes` (등급표)
  - guide: `sections` (설명형, 예: 인증 안내)
  - hub: `sections` + `related` (토픽 클러스터 허브, 스포크로 내부링크)
- 공통: `summary`(요약), `sources`(출처), `related`(관련 글), `medical`(의료 면책),
  `promoBanner`(제휴처 공식 배너, 선택), `checklist`(품목·권장 수량 표 — guide에서 비교글로 퍼널, 선택)
- `Product`: `provider` + `affiliateUrl` (제휴처 분리), `grade`, `specs`, `priceExample`, `recommended`,
  `coupangProductId?`, `imageUrl?`, `priceCheckedAt?`, `isRocket?`, `isFreeShipping?`,
  `attributes?`(월령 범위·기능 태그 — 있으면 글이 `ComparisonExplorer`로 렌더, 없으면 정적 표 폴백)
- `Provider = "coupang" | "iherb" | "linkprice" | "tenping"`

## 콘텐츠 추가 방법

1. **비교 글(comparison)**: `src/content/products/<slug>.ts`에 `Article`(type: "comparison") 작성
   → `lib/content.ts`의 `articles` 배열에 import 등록. `category`는 대분류 slug(`src/content/categories.ts`).
   쿠팡 검색 결과로 안전한 초안을 만들 때는 `npm run build:coupang -- --slug <slug> --category <category> --keyword "<키워드>"` 실행
   → 생성된 `<slug>.draft.ts`의 등급·스펙·설명을 1차 출처로 검수한 뒤 파일명 변경 및 수동 등록.
2. **가이드(guide)**: `src/content/guides/<slug>.ts` (type: "guide", `sections` 사용) → 동일하게 등록.
3. **허브(hub)**: `src/content/hubs/<slug>.ts` (type: "hub", `related`로 스포크 글 연결) → 등록.
- 새 제휴처 추가: `lib/types.ts`의 `Provider`와 `lib/providers.ts`의 `PROVIDERS`에 항목 추가.

## 교체해야 할 플레이스홀더

- 모든 `affiliateUrl: "#"` → 실제 추적 링크 (쿠팡은 `createDeeplinks()`로 생성). 현재 stroller/lotion/newborn-diaper 11곳.
- `priceExample` → 실제 가격(조회 시점 명시)
- `OPERATOR_NAME`(`lib/site.ts`) → 운영자 실명 (about 페이지에 노출, E-E-A-T)
- `CONTACT_EMAIL`(`lib/site.ts`) → 실제 문의 메일 (푸터·about·privacy에서 공용)
- 브랜드명은 `Grader`(`lib/site.ts`) · 기본 도메인은 `https://grader.co.kr`

## 완료된 백로그 (2026-07 기준)

- ~~`/about`·`/privacy` 페이지~~ — 평가 방법론·등급 기준·면책·처리방침 구현. **운영자 실명(`OPERATOR_NAME`)만 교체 남음.**
- ~~인터랙티브 비교 엔진~~ — `lib/explorer.ts`(순수 함수+테스트) + `ComparisonExplorer`/`FilterPanel`/`MatchBadge`.
  `attributes` 있는 글만 적용(현재 stroller 글이 데모). **lotion·newborn-diaper에 attributes 백필 필요.**
- ~~쿠팡 상품 초안 생성기~~ — `scripts/build-from-coupang.ts`. 공식 검색 API 결과의 상품명·이미지·가격·배송·제휴 URL만
  반영하며 등급·스펙은 `TODO`로 남긴다. 기본 출력은 `.draft.ts`이고 자동 발행/등록하지 않는다.
- ~~상품 전환 UI 보강~~ — 이미지·가격 조회일·로켓/무료배송 표시, 필터 결과 1위와 연동되는 모바일 고정 CTA.

## 작업 백로그 (우선순위)

1. **실제 데이터로 플레이스홀더 교체** + 첫 카테고리 글 5~10개 실측 작성(사람 검수).
2. **콘텐츠 확장** — 카테고리별 비교/가이드/허브. 허브-스포크 내부링크 촘촘히.
   (카테고리는 API 발급 전 임시 수동 분류 — 발급 후 상품 자동 분류로 재정비 예정.)
3. **배포** — Netlify/Vercel/Cloudflare Pages. 후 구글 서치콘솔 + 네이버 서치어드바이저에 `/sitemap.xml` 제출.
   (네이버는 외부 사이트 상위 노출이 어려우니 구글을 주력으로.)

## 컨벤션

- TypeScript strict. Tailwind는 토큰 클래스(`bg-surface text-muted border-hairline brand ...`) 사용.
- 폰트 굵기 2종(400/500)만. 한국어 본문은 sentence-case 느낌으로, 과한 강조 자제.
- 글 본문은 양산형으로 읽히지 않게 — 실제 비교·검증 정보 위주.
