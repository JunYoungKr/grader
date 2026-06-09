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
        <p role="status" aria-live="polite" className="mt-3 text-[13px] text-muted">
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
