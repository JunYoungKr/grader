import type { Product } from "@/lib/types";
import type { MatchInfo } from "@/lib/explorer";
import { AffiliateButton } from "./AffiliateButton";
import { MatchBadge } from "./MatchBadge";
import { ProductPhoto } from "./content/ProductPhoto";
import { ProductPrice, DeliveryTags } from "./content/ProductMeta";
import { SaveButton } from "./saved/SaveButton";
export function ProductCard({
  product,
  article,
  match,
}: {
  product: Product;
  article?: string;
  match?: MatchInfo;
  rank?: number;
}) {
  return (
    <div className="panel flex h-full flex-col overflow-hidden">
      <div className="relative p-4">
        <ProductPhoto src={product.imageUrl} alt={product.name} />
        <div className="absolute right-6 top-6">
          <SaveButton
            item={{
              id: `detail-product:${product.coupangProductId ?? product.id}`,
              kind: "product",
              title: product.name,
              href: product.affiliateUrl,
              imageUrl: product.imageUrl,
              price: product.priceExample,
              priceCheckedAt: product.priceCheckedAt,
            }}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5 pt-0">
        <div>
          <p className="text-caption text-brand">{product.type}</p>
          <h3 className="mt-1 text-title font-semibold">{product.name}</h3>
        </div>
        {match && <MatchBadge info={match} />}
        <p className="text-body text-ink">{product.descriptor}</p>
        {product.specs.length > 0 && (
          <dl className="divide-y divide-hairline border-y border-hairline text-body">
            {product.specs.map((s) => (
              <div key={s.label} className="flex justify-between gap-4 py-3">
                <dt className="shrink-0 text-muted">{s.label}</dt>
                <dd className="text-right">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <DeliveryTags rocket={product.isRocket} free={product.isFreeShipping} />
        <div className="mt-auto">
          <ProductPrice
            price={product.priceExample}
            checkedAt={product.priceCheckedAt}
          />
        </div>
        <AffiliateButton
          href={product.affiliateUrl}
          provider={product.provider}
          track={{
            article,
            productId: product.coupangProductId ?? product.id,
            product: product.name,
            grade: product.grade,
            category: product.grade ? undefined : product.type,
            price: product.priceExample,
            placement: "product_card",
            recommended: product.recommended,
          }}
        />
        <p className="text-caption text-muted">
          옵션, 설치 조건, 현재 가격은 판매처에서 확인하세요.
        </p>
      </div>
    </div>
  );
}
