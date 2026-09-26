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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
