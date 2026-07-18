import Image from "next/image";
import { formatPrice } from "@/lib/grade";
import type { PopularProduct } from "@/lib/types";
import { AffiliateButton } from "./AffiliateButton";
import { ViewItemList } from "./ViewItemList";

export function PopularProductGrid({
  products,
  category,
}: {
  products: PopularProduct[];
  category: string;
}) {
  const listId = `category-${category}-popular`;

  return (
    <>
      <ViewItemList
        article={listId}
        items={products.map((product) => ({
          id: String(product.coupangProductId),
          name: product.name,
          provider: "coupang" as const,
          category,
          price: product.price,
        }))}
      />
      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <li
            key={product.id}
            className={`flex flex-col rounded-lg bg-surface p-4 ${
              product.position <= 3
                ? "border-2 border-brand"
                : "border border-hairline"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-md bg-brand-soft px-2 py-1 text-xs font-medium text-brand">
                베스트 {product.position}
              </span>
              <span className="truncate text-[11px] text-faint">
                {product.sourceCategoryLabel}
              </span>
            </div>
            <div className="mt-3 flex justify-center overflow-hidden rounded-lg bg-paper">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={180}
                height={180}
                sizes="(min-width: 1024px) 180px, (min-width: 640px) 40vw, 80vw"
                className="aspect-square object-contain p-3"
              />
            </div>
            <h3 className="mt-3 line-clamp-2 min-h-10 text-sm font-medium leading-5">
              {product.name}
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
              {product.isRocket && (
                <span className="rounded-md bg-brand-soft px-2 py-0.5 font-medium text-brand">
                  로켓배송
                </span>
              )}
              {product.isFreeShipping && (
                <span className="rounded-md border border-hairline px-2 py-0.5 text-muted">
                  무료배송
                </span>
              )}
            </div>
            <div className="mt-auto pt-4">
              <p className="text-lg font-semibold tabular-nums">
                {formatPrice(product.price)}
              </p>
              <p className="mt-0.5 text-[11px] text-faint">
                {product.priceCheckedAt} 조회 · 가격 변동 가능
              </p>
              <div className="mt-3">
                <AffiliateButton
                  href={product.affiliateUrl}
                  provider="coupang"
                  primary={product.position <= 3}
                  label="현재가 확인"
                  track={{
                    article: listId,
                    productId: product.coupangProductId,
                    product: product.name,
                    category,
                    price: product.price,
                    placement: "popular_products",
                    recommended: product.position <= 3,
                  }}
                />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
