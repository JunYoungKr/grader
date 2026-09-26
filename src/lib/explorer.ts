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

  const ranked = products.map((product) => ({
    product,
    match: evaluate(product),
  }));

  // 조건 0개 → 원본 순서 그대로(현재 화면과 동일).
  if (total === 0) return ranked;

  // 충족 수 ↓ → 조회 가격 ↑, 동점은 원본 순서 유지. 기존 등급은 정렬에 쓰지 않는다.
  return ranked
    .map((r, i) => ({ r, i }))
    .sort((a, b) => {
      if (b.r.match.satisfied !== a.r.match.satisfied)
        return b.r.match.satisfied - a.r.match.satisfied;
      if (a.r.product.priceExample !== b.r.product.priceExample)
        return a.r.product.priceExample - b.r.product.priceExample;
      return a.i - b.i;
    })
    .map(({ r }) => r);
}
