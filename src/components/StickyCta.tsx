import { AffiliateButton } from "./AffiliateButton";
import { formatPrice } from "@/lib/grade";
import type { Product } from "@/lib/types";
export function StickyCta({
  product,
  article,
}: {
  product: Product;
  article?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-card px-4 pb-safe pt-3 shadow-lg md:hidden">
      <div className="mx-auto flex max-w-content items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-small font-medium">{product.name}</p>
          <p className="text-body font-medium tabular-nums">
            {formatPrice(product.priceExample)}{" "}
            <span className="text-caption font-normal text-muted">
              조회 가격
            </span>
          </p>
        </div>
        <div className="w-32 shrink-0">
          <AffiliateButton
            href={product.affiliateUrl}
            provider={product.provider}
            size="sm"
            label="현재가 확인"
            track={{
              article,
              productId: product.coupangProductId ?? product.id,
              product: product.name,
              grade: product.grade,
              price: product.priceExample,
              placement: "sticky_cta",
            }}
          />
        </div>
      </div>
    </div>
  );
}
