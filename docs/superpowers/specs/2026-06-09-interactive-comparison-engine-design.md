# 인터랙티브 비교 엔진 — 설계안

- 작성일: 2026-06-09
- 상태: 승인됨 (구현 대기)
- 백로그 항목: 작업 백로그 2번 — "인터랙티브 비교 엔진" (정적 경쟁사 대비 차별점)

## 한 줄 요약

기존 비교 글 안의 제품 표 위에 **조건 입력 패널**(예산·기능·월령)을 얹어,
사용자가 조건을 고르면 제품을 **숨기지 않고 적합도순으로 재정렬**하고 "조건 N개 중 M개 충족"
배지를 달아 **"지금 조건엔 이게 최선"** 1종을 강조 → 제휴 클릭(전환)으로 직결시킨다.

## 목표 & 비목표

**목표**
- 사용자가 자기 상황(예산/필요 기능/월령)에 맞는 제품을 **즉시** 집어내 의사결정을 단축한다.
- 정적 비교표(경쟁사)와 차별화되는 **개인화된 답**을 제공한다.
- 기존 답-우선 레이아웃·SEO·전환 추적(`select_item`)을 깨지 않는다.

**비목표 (v1 제외)**
- 글을 넘나드는 교차 비교(카테고리 단위/전 제품 통합 검색). → 범위는 **글 1개 안**으로 한정.
- URL 쿼리 동기화(공유 가능한 필터 링크). → 후속.
- StickyCta가 현재 최상위 매칭으로 동적 변경. → v1은 `recommended` 고정, 후속.

## 확정된 핵심 결정

1. **범위**: 글 1개 안에서 필터 (그 글의 `products`만 대상).
2. **데이터 모델**: `Product`에 **선택적** 구조화 필드 `attributes` 추가. `specs`(표시용)는 그대로 둠.
3. **필터 구성**: `attributes`에서 **자동 생성**(글 작성자 추가 설정 0).
4. **결과 동작**: **소프트 랭킹** — 숨기지 않고 적합도순 재정렬, 빈 결과 없음, 항상 CTA 유지.
5. **점진 적용**: **그레이스풀 다운** — `attributes` 없는 글은 지금처럼 정적 표로 폴백.
6. **필터 축**: `예산 · 기능 · 월령` 3개로 한정(백로그 문구 그대로).

## 동작 원리

- 조건 **0개(기본 상태) = 현재와 동일한 순서**(등급·추천 순). 정적 HTML이 지금과 동일하게 생성되어
  SEO·하이드레이션에 영향 없음.
- 사용자가 **실제로 설정한** 조건만 점수에 반영.
- 빈 결과가 절대 나오지 않으므로 막다른 길이 없음(소프트 랭킹).

## 데이터 모델 (`src/lib/types.ts`)

```ts
export interface ProductAttributes {
  ageMonths?: [number, number]; // 적정 월령 범위 (월령 필터용)
  features?: string[];          // 기능 태그 — "기내반입","한 손 접이","무향" 등
  // 예산은 기존 priceExample을 그대로 사용 (중복 필드 안 만듦)
}

export interface Product {
  // ...기존 필드 그대로
  attributes?: ProductAttributes; // 선택적 — 없으면 정적 표로 폴백
}
```

- `specs`(사람이 읽는 표시용)는 손대지 않는다. → CLAUDE.md "데이터 일원화" + "지어내지 않기" 준수.
- `features`의 라벨은 한국어 표시 문자열을 그대로 사용(체크박스 라벨로 노출).

## 필터 자동 생성 규칙 (`src/lib/explorer.ts` — 순수 함수)

`deriveFilters(products)`가 제품들의 `attributes`를 보고 노출할 컨트롤을 결정한다.

| 축 | 노출 조건 | 컨트롤 | 매칭 규칙 |
|----|----------|--------|----------|
| 예산 | 항상 (`priceExample` 필수) | `min~max` 슬라이더 | `priceExample ≤ 선택값` |
| 기능 | `features` 가진 제품 ≥ 1 | 등장한 값들의 합집합 체크박스(다중) | 선택 기능을 **모두** 보유 |
| 월령 | `ageMonths`가 제품마다 **다를 때만** | 개월수 입력/선택 | `month ∈ [min, max]` |

- 예산 슬라이더 단계(step)는 가격대에 맞춰 합리적으로(예: 1만 원 단위) 산정.
- 단일 값만 존재해 의미 없는 축(예: 모든 제품 월령 동일)은 컨트롤을 노출하지 않는다.

## 소프트 랭킹 (`src/lib/explorer.ts` — 순수 함수)

`rankProducts(products, activeState)`:

- 사용자가 **실제로 설정한** 조건만 점수에 반영(`activeConditions`).
- 각 제품: `satisfied = 충족한 조건 수`. 정렬 키 = `(satisfied desc → grade → recommended → priceExample asc)`.
- 반환: `Array<{ product, satisfied, total, missed: string[] }>` — 컴포넌트는 이걸로 배지/누락 사유를 렌더.
- **순수 함수**라 React 없이 단위 테스트(TDD) 가능:
  - 빈 조건 → 원래(등급·추천) 순서와 동일.
  - 동점 처리(정렬 키 순서대로).
  - never-empty 보장(어떤 조건에도 전체 목록 반환, 정렬만 달라짐).

## 컴포넌트 구조

```
ComparisonExplorer  ("use client")  ← 새 island
├─ 상태: { budgetMax, features: string[], month }  (useState, v1은 URL 동기화 X)
├─ FilterPanel        ← deriveFilters 결과로 컨트롤 자동 렌더
└─ 결과 목록 = 기존 ComparisonTable / ComparisonCards 재사용
                       (정렬된 products + 선택적 matchMap prop 주입)
```

- `ComparisonTable` / `ComparisonCards`에 **선택적 `matchMap` prop** 추가:
  - 있으면 "조건 N개 중 M개 충족" 배지 + 누락 사유 표시.
  - 없으면 지금과 **100% 동일**하게 렌더 → 표 마크업 중복 없음, 정적 글 폴백 보존.
  - 두 컴포넌트는 server-only 의존이 없는 **client-safe 프레젠테이션 컴포넌트**로 정리(필요 시 `AffiliateButton` 포함 점검 — `<a>` + `data-ga` 속성만 사용하므로 client 트리에서 안전해야 함).

## 페이지 통합 (`src/app/[slug]/page.tsx`)

- `#compare` 섹션:
  - `attributes`를 가진 제품이 **하나라도 있으면** → `<ComparisonExplorer products={products} article={slug} />`.
  - 없으면 → 기존 정적 `ComparisonTable` / `ComparisonCards`.
- `ViewItemList`(등급표 도달 추적, IntersectionObserver)는 그대로 유지.
- `StickyCta`는 v1에서 `recommended` 고정 유지(동적 변경은 후속).

## 애널리틱스 (전환 루프 연결)

- **전환은 그대로 `select_item`** — 재정렬된 카드 안 `AffiliateButton`의 `data-ga`가 유지되므로
  클릭 귀속에 영향 없음(`placement`: comparison_table / product_card 그대로).
- `view_item_list`(등급표 도달)와 `select_item`(클릭) 사이의 **관심 신호**로
  `filter_apply` 이벤트 신규 추가(`src/lib/gtag.ts`에 `trackFilter` 헬퍼, GA_ID 미설정 시 no-op).
  - 파라미터: 설정한 조건(budgetMax / features / month) + 최상위 매칭 제품.
  - → `npm run insights`가 "어떤 조건을 거는가 / 거른 뒤 전환율"을 진단 가능.
- `filter_*` 파라미터는 GA4 **커스텀** 측정기준이라 등록 필요 — CLAUDE.md 애널리틱스 절에 메모 추가.

## 테스트 전략 (TDD)

- `src/lib/explorer.ts`의 순수 함수가 1차 테스트 대상:
  - `deriveFilters(products)`: 예산 min/max, 기능 합집합, 월령 가시성 규칙(동일 값이면 미노출).
  - `rankProducts(products, state)`: 빈 조건=원래 순서, 동점 정렬 키, never-empty, 충족/누락 계산.
- 컴포넌트 상호작용 테스트는 선택(상태 변경 → 정렬 반영) — v1 필수 아님.

## 파일 변경 요약

| 파일 | 변경 |
|------|------|
| `src/lib/types.ts` | `ProductAttributes` 추가, `Product.attributes?` 추가 |
| `src/lib/explorer.ts` | **신규** — `deriveFilters`, `rankProducts` (순수 함수) |
| `src/lib/explorer.test.ts` | **신규** — 순수 함수 단위 테스트 |
| `src/components/ComparisonExplorer.tsx` | **신규** ("use client") — 상태 + FilterPanel + 정렬 결과 |
| `src/components/FilterPanel.tsx` | **신규** — deriveFilters 결과로 컨트롤 자동 렌더 |
| `src/components/ComparisonTable.tsx` | 선택적 `matchMap` prop 추가, client-safe 정리 |
| `src/components/ComparisonCards.tsx` | 선택적 `matchMap` prop 추가, client-safe 정리 |
| `src/lib/gtag.ts` | `trackFilter` 헬퍼 추가 |
| `src/app/[slug]/page.tsx` | `#compare` 분기(attributes 유무) |
| `src/content/products/stroller.ts` | 데모용 `attributes` 채우기(기존 값 구조화, 새 사실 생성 아님) |
| `CLAUDE.md` | 애널리틱스 절에 `filter_apply` 커스텀 측정기준 메모 |

## 후속(별도 사이클)

- URL 쿼리 동기화 → 공유 가능한 필터 링크 + 필터별 SEO 진입.
- StickyCta가 현재 최상위 매칭으로 동적 변경.
- 카테고리 단위/전 제품 통합 비교 도구(데이터 풀 충분히 쌓인 뒤).
