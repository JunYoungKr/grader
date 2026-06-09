import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ComparisonCards({
  products,
  article,
}: {
  products: Product[];
  article?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} article={article} />
      ))}
    </div>
  );
}
