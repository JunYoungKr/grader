# 인터랙티브 비교 엔진 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 비교 글 1개 안에서 예산·기능·월령 조건으로 제품을 소프트 랭킹(재정렬)해, "지금 조건엔 이게 최선" 1종을 강조하고 제휴 클릭으로 잇는 인터랙티브 패널을 추가한다.

**Architecture:** 순수 함수(`lib/explorer.ts`)가 제품 `attributes`에서 필터를 자동 생성하고 적합도순으로 정렬한다. 클라이언트 island(`ComparisonExplorer`)가 상태를 들고 기존 표/카드 컴포넌트를 재정렬해 렌더한다. `attributes`가 없는 글은 기존 정적 표로 폴백한다(그레이스풀 다운).

**Tech Stack:** Next.js 15(App Router) · React 19 · TypeScript(strict) · Tailwind 3 · Vitest(신규, 순수 함수 단위 테스트)

---

## 설계 출처

`docs/superpowers/specs/2026-06-09-interactive-comparison-engine-design.md` 승인본 기준.

## 파일 구조

| 파일 | 책임 | 변경 |
|------|------|------|
| `src/lib/types.ts` | 데이터 모델 | `ProductAttributes` 추가, `Product.attributes?` |
| `src/lib/explorer.ts` | 필터 파생·랭킹(순수 함수) | **신규** |
| `src/lib/explorer.test.ts` | 순수 함수 단위 테스트 | **신규** |
| `src/lib/gtag.ts` | GA4 헬퍼 | `trackFilter` 추가 |
| `src/components/MatchBadge.tsx` | "조건 N개 중 M개 충족" 배지 | **신규** |
| `src/components/FilterPanel.tsx` | 필터 컨트롤(자동 생성) | **신규** |
| `src/components/ComparisonExplorer.tsx` | 상태 island + 정렬 결과 | **신규** |
| `src/components/ComparisonTable.tsx` | 데스크톱 표 | `matchMap` prop 추가 |
| `src/components/ComparisonCards.tsx` | 모바일 카드 묶음 | `matchMap` prop 추가 |
| `src/components/ProductCard.tsx` | 단일 카드 | `match` prop 추가 |
| `src/app/[slug]/page.tsx` | 글 페이지 | `#compare` 분기 |
| `src/content/products/stroller.ts` | 데모 데이터 | `attributes` 백필 |
| `CLAUDE.md` | 문서 | `filter_apply` 메모 |
| `vitest.config.ts` | 테스트 설정 | **신규** |
| `package.json` | 스크립트/deps | `vitest` devDep + `test` 스크립트 |

## 공유 타입 (Task 2에서 `explorer.ts`에 정의, 이후 전 태스크가 참조)

```ts
export interface FilterState { budgetMax: number | null; features: string[]; month: number | null; }
export interface DerivedFilters { budget: { min: number; max: number } | null; features: string[]; age: { min: number; max: number } | null; }
export interface MatchInfo { satisfied: number; total: number; missed: string[]; }
export interface RankedProduct { product: Product; match: MatchInfo; }
```

---

### Task 1: 데이터 모델 — `Product.attributes`

**Files:**
- Modify: `src/lib/types.ts`

- [ ] **Step 1: `ProductAttributes` 추가 및 `Product`에 연결**

`src/lib/types.ts`의 `Product` 인터페이스 바로 위에 추가하고, `Product`에 필드를 더한다.

```ts
export interface ProductAttributes {
  ageMonths?: [number, number]; // 적정 월령 범위 [min, max]
  features?: string[];          // 기능 태그 — "기내반입","한 손 접이" 등 (표시 라벨 그대로)
  // 예산 필터는 기존 priceExample을 사용 (중복 필드 안 만듦)
}
```

`Product` 인터페이스 안 `recommended?: boolean;` 다음 줄에 추가:

```ts
  attributes?: ProductAttributes; // 선택적 — 없으면 정적 표로 폴백
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음(종료 코드 0).

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: Product에 attributes(월령·기능) 선택 필드 추가"
```

---

### Task 2: Vitest 설정 + `deriveFilters` (TDD)

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/lib/explorer.ts`
- Test: `src/lib/explorer.test.ts`

- [ ] **Step 1: Vitest 설치**

Run: `npm install -D vitest`
Expected: `vitest`가 devDependencies에 추가됨.

- [ ] **Step 2: Vitest 설정 파일 생성**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: `test` 스크립트 추가**

`package.json`의 `"scripts"`에 추가(`"lint"` 항목 다음):

```json
    "test": "vitest run",
```

- [ ] **Step 4: 실패하는 테스트 작성 (러너 동작 + deriveFilters 명세)**

Create `src/lib/explorer.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { deriveFilters } from "./explorer";
import type { Product } from "./types";

function mk(p: Partial<Product>): Product {
  return {
    id: p.id ?? "x",
    name: p.name ?? "제품",
    type: p.type ?? "형",
    descriptor: p.descriptor ?? "",
    grade: p.grade ?? "A",
    specs: p.specs ?? [],
    priceExample: p.priceExample ?? 10000,
    provider: p.provider ?? "coupang",
    affiliateUrl: p.affiliateUrl ?? "#",
    recommended: p.recommended,
    attributes: p.attributes,
  };
}

describe("deriveFilters", () => {
  it("예산 min~max를 priceExample에서 구한다", () => {
    const f = deriveFilters([
      mk({ id: "a", priceExample: 99000 }),
      mk({ id: "b", priceExample: 389000 }),
      mk({ id: "c", priceExample: 159000 }),
    ]);
    expect(f.budget).toEqual({ min: 99000, max: 389000 });
  });

  it("features를 합집합(중복 제거, 등장 순서 유지)으로 모은다", () => {
    const f = deriveFilters([
      mk({ id: "a", attributes: { features: ["한 손 접이", "기내반입"] } }),
      mk({ id: "b", attributes: { features: ["한 손 접이", "양대면 시트"] } }),
    ]);
    expect(f.features).toEqual(["한 손 접이", "기내반입", "양대면 시트"]);
  });

  it("ageMonths가 서로 다르면 월령 범위를 노출한다", () => {
    const f = deriveFilters([
      mk({ id: "a", attributes: { ageMonths: [1, 48] } }),
      mk({ id: "b", attributes: { ageMonths: [6, 36] } }),
    ]);
    expect(f.age).toEqual({ min: 1, max: 48 });
  });

  it("ageMonths가 모두 같거나 없으면 월령 필터를 숨긴다(null)", () => {
    expect(
      deriveFilters([
        mk({ id: "a", attributes: { ageMonths: [6, 36] } }),
        mk({ id: "b", attributes: { ageMonths: [6, 36] } }),
      ]).age,
    ).toBeNull();
    expect(deriveFilters([mk({ id: "a" }), mk({ id: "b" })]).age).toBeNull();
  });

  it("features가 하나도 없으면 빈 배열", () => {
    expect(deriveFilters([mk({ id: "a" })]).features).toEqual([]);
  });
});
```

- [ ] **Step 5: 테스트 실행해 실패 확인**

Run: `npm test`
Expected: FAIL — `deriveFilters` is not defined / 모듈 `./explorer` 없음.

- [ ] **Step 6: `explorer.ts` 작성 (deriveFilters까지)**

Create `src/lib/explorer.ts`:

```ts
import type { Product } from "./types";

export interface FilterState {
  budgetMax: number | null;
  features: string[];
  month: number | null;
}

export interface DerivedFilters {
  budget: { min: number; max: number } | null;
  features: string[];
  age: { min: number; max: number } | null;
}

export interface MatchInfo {
  satisfied: number;
  total: number;
  missed: string[];
}

export interface RankedProduct {
  product: Product;
  match: MatchInfo;
}

const GRADE_RANK: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };

export function deriveFilters(products: Product[]): DerivedFilters {
  // 예산: 제품이 있으면 항상. priceExample의 min~max.
  const prices = products.map((p) => p.priceExample);
  const budget =
    prices.length > 0
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : null;

  // 기능: 모든 제품 features의 합집합(중복 제거, 등장 순서 유지).
  const features: string[] = [];
  for (const p of products) {
    for (const f of p.attributes?.features ?? []) {
      if (!features.includes(f)) features.push(f);
    }
  }

  // 월령: ageMonths를 가진 제품의 범위가 2개 이상 서로 다를 때만 노출.
  const ranges = products
    .map((p) => p.attributes?.ageMonths)
    .filter((r): r is [number, number] => Array.isArray(r));
  let age: { min: number; max: number } | null = null;
  if (ranges.length > 0) {
    const distinct = new Set(ranges.map((r) => `${r[0]}-${r[1]}`));
    if (distinct.size > 1) {
      age = {
        min: Math.min(...ranges.map((r) => r[0])),
        max: Math.max(...ranges.map((r) => r[1])),
      };
    }
  }

  return { budget, features, age };
}
```

- [ ] **Step 7: 테스트 통과 확인**

Run: `npm test`
Expected: PASS (deriveFilters 5개 테스트 통과).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/explorer.ts src/lib/explorer.test.ts
git commit -m "feat: Vitest 도입 + deriveFilters(필터 자동 생성) 추가"
```

---

### Task 3: `rankProducts` 소프트 랭킹 (TDD)

**Files:**
- Modify: `src/lib/explorer.ts`
- Test: `src/lib/explorer.test.ts`

- [ ] **Step 1: 실패하는 테스트 추가**

`src/lib/explorer.test.ts` 상단 import에 `rankProducts`를 추가:

```ts
import { deriveFilters, rankProducts } from "./explorer";
```

파일 맨 끝에 추가:

```ts
describe("rankProducts", () => {
  const products = [
    mk({ id: "s", grade: "S", priceExample: 389000, recommended: true, attributes: { ageMonths: [1, 48], features: ["한 손 접이", "양대면 시트"] } }),
    mk({ id: "a", grade: "A", priceExample: 249000, attributes: { ageMonths: [6, 48], features: [] } }),
    mk({ id: "b", grade: "B", priceExample: 159000, attributes: { ageMonths: [6, 36], features: ["한 손 접이", "기내반입"] } }),
    mk({ id: "c", grade: "C", priceExample: 99000, attributes: { ageMonths: [6, 36], features: [] } }),
  ];

  it("조건이 없으면 원본 순서를 유지하고 match는 0/0", () => {
    const r = rankProducts(products, { budgetMax: null, features: [], month: null });
    expect(r.map((x) => x.product.id)).toEqual(["s", "a", "b", "c"]);
    expect(r[0].match).toEqual({ satisfied: 0, total: 0, missed: [] });
  });

  it("예산 상한을 넘는 제품은 미충족 처리되어 아래로 내려간다", () => {
    const r = rankProducts(products, { budgetMax: 160000, features: [], month: null });
    // 99000·159000은 충족(1/1), 249000·389000은 미충족(0/1)
    expect(r[0].match.satisfied).toBe(1);
    expect(r.find((x) => x.product.id === "s")!.match.missed).toEqual(["예산"]);
    const satisfiedIds = r.filter((x) => x.match.satisfied === 1).map((x) => x.product.id);
    expect(new Set(satisfiedIds)).toEqual(new Set(["b", "c"]));
  });

  it("선택한 기능을 모두 가진 제품만 충족", () => {
    const r = rankProducts(products, { budgetMax: null, features: ["한 손 접이", "기내반입"], month: null });
    expect(r[0].product.id).toBe("b"); // b만 두 기능 모두 보유
    expect(r[0].match.satisfied).toBe(1);
    expect(r.find((x) => x.product.id === "s")!.match.missed).toEqual(["기능"]);
  });

  it("월령이 범위에 들면 충족, 범위 밖/미보유는 미충족", () => {
    const r = rankProducts(products, { budgetMax: null, features: [], month: 2 });
    // 월령 2 → s(1~48)만 충족
    expect(r[0].product.id).toBe("s");
    expect(r.find((x) => x.product.id === "b")!.match.missed).toEqual(["월령"]);
  });

  it("충족 수 동점이면 등급(S>A>B>C) 순", () => {
    // 예산 상한 500000 → 전원 충족(1/1) → 등급 순으로 정렬
    const r = rankProducts(products, { budgetMax: 500000, features: [], month: null });
    expect(r.map((x) => x.product.id)).toEqual(["s", "a", "b", "c"]);
  });

  it("total은 활성 조건 수와 같다", () => {
    const r = rankProducts(products, { budgetMax: 200000, features: ["한 손 접이"], month: null });
    expect(r[0].match.total).toBe(2);
  });
});
```

- [ ] **Step 2: 테스트 실행해 실패 확인**

Run: `npm test`
Expected: FAIL — `rankProducts` is not defined.

- [ ] **Step 3: `rankProducts` 구현**

`src/lib/explorer.ts` 맨 끝(`deriveFilters` 다음)에 추가:

```ts
export function rankProducts(
  products: Product[],
  state: FilterState,
): RankedProduct[] {
  const budgetActive = state.budgetMax !== null;
  const featuresActive = state.features.length > 0;
  const monthActive = state.month !== null;
  const total =
    (budgetActive ? 1 : 0) + (featuresActive ? 1 : 0) + (monthActive ? 1 : 0);

  const evaluate = (p: Product): MatchInfo => {
    const missed: string[] = [];
    if (budgetActive && p.priceExample > (state.budgetMax as number)) {
      missed.push("예산");
    }
    if (featuresActive) {
      const owned = p.attributes?.features ?? [];
      if (!state.features.every((f) => owned.includes(f))) missed.push("기능");
    }
    if (monthActive) {
      const r = p.attributes?.ageMonths;
      const m = state.month as number;
      if (!(Array.isArray(r) && m >= r[0] && m <= r[1])) missed.push("월령");
    }
    return { satisfied: total - missed.length, total, missed };
  };

  const ranked = products.map((product) => ({ product, match: evaluate(product) }));

  // 조건 0개 → 원본 순서 그대로(현재 화면과 동일).
  if (total === 0) return ranked;

  // 충족 수 ↓ → 등급 → 추천 → 가격 ↑, 동점은 원본 순서 유지.
  return ranked
    .map((r, i) => ({ r, i }))
    .sort((a, b) => {
      if (b.r.match.satisfied !== a.r.match.satisfied)
        return b.r.match.satisfied - a.r.match.satisfied;
      const ga = GRADE_RANK[a.r.product.grade] ?? 99;
      const gb = GRADE_RANK[b.r.product.grade] ?? 99;
      if (ga !== gb) return ga - gb;
      const ra = a.r.product.recommended ? 0 : 1;
      const rb = b.r.product.recommended ? 0 : 1;
      if (ra !== rb) return ra - rb;
      if (a.r.product.priceExample !== b.r.product.priceExample)
        return a.r.product.priceExample - b.r.product.priceExample;
      return a.i - b.i;
    })
    .map(({ r }) => r);
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test`
Expected: PASS (deriveFilters + rankProducts 전체 통과).

- [ ] **Step 5: Commit**

```bash
git add src/lib/explorer.ts src/lib/explorer.test.ts
git commit -m "feat: rankProducts 소프트 랭킹 추가 (조건 적합도순 정렬)"
```

---

### Task 4: `trackFilter` GA4 헬퍼

**Files:**
- Modify: `src/lib/gtag.ts`

- [ ] **Step 1: `trackFilter` 추가**

`src/lib/gtag.ts` 맨 끝(`trackTocClick` 다음)에 추가:

```ts
// 필터 적용(조건 입력) → view_item_list와 select_item 사이의 관심 신호.
// filter_* 파라미터는 GA4 커스텀 측정기준이라 리포트에 쓰려면 등록 필요.
export interface FilterEvent {
  article?: string;
  budgetMax?: number | null;
  features?: string[];
  month?: number | null;
  topProduct?: string; // 현재 최상위 매칭 제품명
}

export function trackFilter(d: FilterEvent): void {
  send("filter_apply", {
    item_list_id: d.article,
    filter_budget_max: d.budgetMax ?? undefined,
    filter_features:
      d.features && d.features.length > 0 ? d.features.join(",") : undefined,
    filter_month: d.month ?? undefined,
    top_item: d.topProduct,
  });
}
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add src/lib/gtag.ts
git commit -m "feat: filter_apply 이벤트(trackFilter) 추가"
```

---

### Task 5: `MatchBadge` + 표/카드에 `matchMap` 주입

**Files:**
- Create: `src/components/MatchBadge.tsx`
- Modify: `src/components/ComparisonTable.tsx`
- Modify: `src/components/ComparisonCards.tsx`
- Modify: `src/components/ProductCard.tsx`

- [ ] **Step 1: `MatchBadge` 컴포넌트 생성**

Create `src/components/MatchBadge.tsx`:

```tsx
import type { MatchInfo } from "@/lib/explorer";

export function MatchBadge({ info }: { info: MatchInfo }) {
  if (info.total === 0) return null;
  const full = info.satisfied === info.total;
  return (
    <span
      className={`inline-flex flex-wrap items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        full ? "bg-brand-soft text-brand" : "bg-surface text-muted"
      }`}
    >
      조건 {info.total}개 중 {info.satisfied}개 충족
      {info.missed.length > 0 && (
        <span className="text-faint">· {info.missed.join("·")} 미충족</span>
      )}
    </span>
  );
}
```

- [ ] **Step 2: `ComparisonTable`에 `matchMap` prop 추가**

`src/components/ComparisonTable.tsx` 상단 import에 추가:

```ts
import type { Product } from "@/lib/types";
import type { MatchInfo } from "@/lib/explorer";
import { MatchBadge } from "./MatchBadge";
```

함수 시그니처를 교체:

```tsx
export function ComparisonTable({
  products,
  article,
  matchMap,
}: {
  products: Product[];
  article?: string;
  matchMap?: Record<string, MatchInfo>;
}) {
```

제품 셀의 `<ProviderTag>` 직후(같은 `<td>` 안, `</td>` 직전)에 배지 추가:

```tsx
                <div className="mt-0.5">
                  <ProviderTag provider={p.provider} />
                </div>
                {matchMap?.[p.id] && (
                  <div className="mt-1">
                    <MatchBadge info={matchMap[p.id]} />
                  </div>
                )}
```

- [ ] **Step 3: `ProductCard`에 `match` prop 추가**

`src/components/ProductCard.tsx` 상단 import에 추가:

```ts
import type { MatchInfo } from "@/lib/explorer";
import { MatchBadge } from "./MatchBadge";
```

함수 시그니처를 교체:

```tsx
export function ProductCard({
  product,
  article,
  match,
}: {
  product: Product;
  article?: string;
  match?: MatchInfo;
}) {
```

`descriptor` 문단(`<p className="mt-0.5 text-[13px] ...">{product.descriptor}</p>`) 바로 다음에 추가:

```tsx
      {match && (
        <div className="mt-2">
          <MatchBadge info={match} />
        </div>
      )}
```

- [ ] **Step 4: `ComparisonCards`에 `matchMap` 전달**

`src/components/ComparisonCards.tsx` 전체를 교체:

```tsx
import type { Product } from "@/lib/types";
import type { MatchInfo } from "@/lib/explorer";
import { ProductCard } from "./ProductCard";

export function ComparisonCards({
  products,
  article,
  matchMap,
}: {
  products: Product[];
  article?: string;
  matchMap?: Record<string, MatchInfo>;
}) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          article={article}
          match={matchMap?.[p.id]}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: 타입 체크 (기존 호출부 회귀 없음 확인)**

Run: `npx tsc --noEmit`
Expected: 에러 없음. `matchMap`/`match`는 선택적이라 기존 `page.tsx`의 호출은 그대로 유효.

- [ ] **Step 6: Commit**

```bash
git add src/components/MatchBadge.tsx src/components/ComparisonTable.tsx src/components/ComparisonCards.tsx src/components/ProductCard.tsx
git commit -m "feat: 비교 표/카드에 조건 충족 배지(matchMap) 선택 prop 추가"
```

---

### Task 6: `FilterPanel` + `ComparisonExplorer` 클라이언트 island

**Files:**
- Create: `src/components/FilterPanel.tsx`
- Create: `src/components/ComparisonExplorer.tsx`

- [ ] **Step 1: `FilterPanel` 생성**

Create `src/components/FilterPanel.tsx`:

```tsx
"use client";

import type { DerivedFilters, FilterState } from "@/lib/explorer";
import { formatPrice } from "@/lib/grade";

export function FilterPanel({
  filters,
  state,
  onChange,
}: {
  filters: DerivedFilters;
  state: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const budgetValue = state.budgetMax ?? filters.budget?.max ?? 0;

  return (
    <div className="rounded-lg border border-hairline bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">내 조건으로 좁히기</h3>
        <button
          type="button"
          className="text-[13px] text-muted underline-offset-2 hover:underline"
          onClick={() => onChange({ budgetMax: null, features: [], month: null })}
        >
          초기화
        </button>
      </div>

      <div className="mt-4 space-y-5">
        {filters.budget && (
          <div>
            <div className="flex items-center justify-between text-[13px]">
              <label htmlFor="filter-budget" className="text-muted">
                예산 상한
              </label>
              <span className="tabular-nums">
                {state.budgetMax === null ? "전체" : formatPrice(state.budgetMax)}
              </span>
            </div>
            <input
              id="filter-budget"
              type="range"
              min={filters.budget.min}
              max={filters.budget.max}
              step={1000}
              value={budgetValue}
              onChange={(e) =>
                onChange({ ...state, budgetMax: Number(e.target.value) })
              }
              className="mt-2 w-full accent-brand"
            />
          </div>
        )}

        {filters.features.length > 0 && (
          <div>
            <span className="text-[13px] text-muted">필요 기능</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {filters.features.map((f) => {
                const on = state.features.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      onChange({
                        ...state,
                        features: on
                          ? state.features.filter((x) => x !== f)
                          : [...state.features, f],
                      })
                    }
                    className={`rounded-full border px-3 py-1 text-[13px] transition-colors ${
                      on
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-hairline text-muted hover:bg-paper"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {filters.age && (
          <div>
            <label htmlFor="filter-month" className="text-[13px] text-muted">
              우리 아이 개월수
            </label>
            <select
              id="filter-month"
              value={state.month ?? ""}
              onChange={(e) =>
                onChange({
                  ...state,
                  month: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className="mt-2 block w-full rounded-md border border-hairline bg-paper px-3 py-2 text-sm"
            >
              <option value="">선택 안 함</option>
              {Array.from(
                { length: filters.age.max - filters.age.min + 1 },
                (_, i) => filters.age!.min + i,
              ).map((m) => (
                <option key={m} value={m}>
                  {m}개월
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `ComparisonExplorer` 생성**

Create `src/components/ComparisonExplorer.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { deriveFilters, rankProducts, type FilterState } from "@/lib/explorer";
import { trackFilter } from "@/lib/gtag";
import { FilterPanel } from "./FilterPanel";
import { ComparisonTable } from "./ComparisonTable";
import { ComparisonCards } from "./ComparisonCards";

export function ComparisonExplorer({
  products,
  article,
}: {
  products: Product[];
  article: string;
}) {
  const filters = useMemo(() => deriveFilters(products), [products]);
  const [state, setState] = useState<FilterState>({
    budgetMax: null,
    features: [],
    month: null,
  });

  const hasActive =
    state.budgetMax !== null ||
    state.features.length > 0 ||
    state.month !== null;

  const ranked = useMemo(
    () => rankProducts(products, state),
    [products, state],
  );

  const sorted = ranked.map((r) => r.product);
  const matchMap = hasActive
    ? Object.fromEntries(ranked.map((r) => [r.product.id, r.match]))
    : undefined;

  // 필터 적용을 관심 신호로 전송(디바운스). 전환은 여전히 select_item.
  useEffect(() => {
    if (!hasActive) return;
    const t = setTimeout(() => {
      trackFilter({
        article,
        budgetMax: state.budgetMax,
        features: state.features,
        month: state.month,
        topProduct: ranked[0]?.product.name,
      });
    }, 600);
    return () => clearTimeout(t);
  }, [article, state, hasActive, ranked]);

  return (
    <div>
      <FilterPanel filters={filters} state={state} onChange={setState} />
      {hasActive && (
        <p className="mt-3 text-[13px] text-muted">
          조건에 가까운 순서로 정렬했습니다. 맨 위가 지금 조건에 가장 맞는 제품입니다.
        </p>
      )}
      <div className="mt-4 hidden md:block">
        <ComparisonTable products={sorted} article={article} matchMap={matchMap} />
      </div>
      <div className="mt-4 md:hidden">
        <ComparisonCards products={sorted} article={article} matchMap={matchMap} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 4: Commit**

```bash
git add src/components/FilterPanel.tsx src/components/ComparisonExplorer.tsx
git commit -m "feat: ComparisonExplorer + FilterPanel(필터 island) 추가"
```

---

### Task 7: 글 페이지 통합 (`#compare` 분기)

**Files:**
- Modify: `src/app/[slug]/page.tsx`

- [ ] **Step 1: import 추가**

`src/app/[slug]/page.tsx`의 `import { ComparisonTable } ...` 줄 다음에 추가:

```ts
import { ComparisonExplorer } from "@/components/ComparisonExplorer";
```

- [ ] **Step 2: attributes 보유 여부 계산**

`const recommended = products.find((p) => p.recommended) ?? products[0];` 다음 줄에 추가:

```ts
  const hasAttributes = products.some((p) => p.attributes);
```

- [ ] **Step 3: `#compare` 섹션의 표/카드 블록을 분기로 교체**

기존 블록:

```tsx
                <div className="hidden md:block">
                  <ComparisonTable products={products} article={slug} />
                </div>
                <div className="md:hidden">
                  <ComparisonCards products={products} article={slug} />
                </div>
```

를 다음으로 교체:

```tsx
                {hasAttributes ? (
                  <ComparisonExplorer products={products} article={slug} />
                ) : (
                  <>
                    <div className="hidden md:block">
                      <ComparisonTable products={products} article={slug} />
                    </div>
                    <div className="md:hidden">
                      <ComparisonCards products={products} article={slug} />
                    </div>
                  </>
                )}
```

- [ ] **Step 4: 빌드로 정적 생성 검증**

Run: `npm run build`
Expected: 성공. 모든 글이 정적 생성되고(현재 attributes 없는 글은 폴백 경로), 에러 없음.

- [ ] **Step 5: Commit**

```bash
git add src/app/[slug]/page.tsx
git commit -m "feat: attributes 보유 글은 ComparisonExplorer로 렌더(폴백 유지)"
```

---

### Task 8: 유모차 글 데모 데이터 백필

**Files:**
- Modify: `src/content/products/stroller.ts`

- [ ] **Step 1: 각 제품에 `attributes` 추가**

> 참고: 이 글의 제품 데이터는 모두 데모/플레이스홀더(이름 "경량 디럭스 A", `affiliateUrl: "#"`)다.
> 아래 `attributes`도 실측 교체 전 데모값이며, 실데이터로 글을 쓸 땐 사양서 기준으로 다시 채운다(CLAUDE.md 원칙).

`stroller-s` 제품 객체의 `specs: [...]` 배열 다음(같은 객체 안)에 추가:

```ts
      attributes: {
        ageMonths: [1, 48], // 데모값 — 신생아부터 사용 가능한 디럭스형
        features: ["한 손 접이", "양대면 시트"],
      },
```

`stroller-a` 제품에 추가:

```ts
      attributes: {
        ageMonths: [6, 48], // 데모값
        features: [],
      },
```

`stroller-b` 제품에 추가:

```ts
      attributes: {
        ageMonths: [6, 36], // 데모값
        features: ["한 손 접이", "기내반입"],
      },
```

`stroller-c` 제품에 추가:

```ts
      attributes: {
        ageMonths: [6, 36], // 데모값
        features: [],
      },
```

- [ ] **Step 2: 빌드 + 개발 서버 수동 확인**

Run: `npm run build`
Expected: 성공.

Run(수동 확인용): `npm run dev` 후 `http://localhost:3000/baby-stroller-grade-2026` 접속.
Expected:
- "내 조건으로 좁히기" 패널에 예산 슬라이더 + 기능 칩(한 손 접이/양대면 시트/기내반입) + 개월수 선택(1~48개월)이 보인다.
- 예산을 16만으로 내리면 C·B가 위로 올라오고 S·A에 "예산 미충족" 배지가 뜬다.
- "기내반입"을 켜면 B(초경량 휴대 C)가 1순위로 올라온다.
- 초기화 누르면 원래 순서(S·A·B·C)로 돌아오고 배지가 사라진다.

- [ ] **Step 3: Commit**

```bash
git add src/content/products/stroller.ts
git commit -m "chore: 유모차 글에 데모 attributes 추가(엔진 동작 검증용)"
```

---

### Task 9: 문서 메모 + 최종 검증

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: 애널리틱스 절에 `filter_apply` 메모 추가**

`CLAUDE.md`의 "## 애널리틱스 (GA4)" 절, `**퍼널**:` 항목 다음 줄에 추가:

```markdown
- **관심 신호 `filter_apply`**: 인터랙티브 비교 엔진에서 조건(예산·기능·월령) 적용 시 전송(`view_item_list`→`select_item` 사이). `filter_budget_max`/`filter_features`/`filter_month`/`top_item` 파라미터는 GA4 **커스텀** 측정기준이라 리포트에 쓰려면 등록 필요. 구현: `lib/explorer.ts`(순수 함수) + `components/ComparisonExplorer.tsx`(island) + `lib/gtag.ts`의 `trackFilter`.
```

- [ ] **Step 2: 전체 검증 (테스트 · 린트 · 빌드)**

Run: `npm test && npm run lint && npm run build`
Expected: 셋 다 성공. 테스트 통과, 린트 경고/에러 없음, 정적 생성 성공.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: filter_apply 이벤트 애널리틱스 메모 추가"
```

---

## Self-Review 결과

**스펙 커버리지** — 설계안 각 절 대응:
- 데이터 모델(`ProductAttributes`) → Task 1
- 필터 자동 생성(`deriveFilters`) → Task 2
- 소프트 랭킹(`rankProducts`) → Task 3
- 애널리틱스(`filter_apply`) → Task 4, Task 9
- 컴포넌트 구조(`matchMap` 재사용 + island) → Task 5, Task 6
- 페이지 통합/폴백 → Task 7
- 데모 검증(stroller 백필) → Task 8
- 테스트 전략(TDD 순수 함수) → Task 2·3
- 문서 메모 → Task 9

**플레이스홀더** — 없음(모든 코드 단계에 실제 코드 포함).

**타입 일관성** — `FilterState`/`DerivedFilters`/`MatchInfo`/`RankedProduct`는 Task 2에서 정의, Task 3·5·6에서 동일 시그니처로 참조. `matchMap?: Record<string, MatchInfo>`는 Task 5(표/카드)와 Task 6(explorer)에서 일치. `trackFilter`/`FilterEvent`는 Task 4 정의 → Task 6 사용 일치.

## 후속 (이 계획 범위 밖, 설계안대로)
- URL 쿼리 동기화(공유 가능한 필터 링크)
- StickyCta 동적 최상위 매칭 반영
- 카테고리/전 제품 통합 비교 도구
