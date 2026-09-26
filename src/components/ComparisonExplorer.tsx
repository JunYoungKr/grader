"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { deriveFilters, rankProducts, type FilterState } from "@/lib/explorer";
import { trackFilter } from "@/lib/gtag";
import { FilterPanel } from "./FilterPanel";
import { ComparisonTable } from "./ComparisonTable";
import { ComparisonCards } from "./ComparisonCards";
import { StickyCta } from "./StickyCta";

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
  const stickyProduct = hasActive
    ? sorted[0]
    : (products.find((product) => product.recommended) ?? products[0]);
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
        <p
          role="status"
          aria-live="polite"
          className="mt-3 text-caption text-muted"
        >
          선택한 조건의 충족 수, 조회 가격 순으로 정렬했어요. 미충족 조건도 함께
          확인해 주세요.
        </p>
      )}
      <div className="mt-5">
        <ComparisonCards
          products={sorted}
          article={article}
          matchMap={matchMap}
        />
      </div>
      <details className="mt-6 rounded-lg border border-hairline bg-card p-4">
        <summary className="min-h-touch cursor-pointer text-small font-medium text-brand">
          사양을 표로 비교하기
        </summary>
        <ComparisonTable
          products={sorted}
          article={article}
          matchMap={matchMap}
        />
      </details>
      {stickyProduct && <StickyCta product={stickyProduct} article={article} />}
    </div>
  );
}
