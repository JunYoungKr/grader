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

// GRADE_RANK is used by rankProducts (next task) — kept intentionally.
