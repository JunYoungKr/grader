import { AffiliateButton } from "./AffiliateButton";
import { GradeBadge } from "./GradeBadge";
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
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-paper px-4 pt-3 md:hidden"
      style={{
        boxShadow: "var(--shadow-lg)",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto flex max-w-content items-center gap-3">
        <GradeBadge grade={product.grade} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm text-muted">
            1순위 추천 · <span className="font-medium text-ink">{product.name}</span>
          </div>
          <div className="text-lg font-medium tabular-nums leading-tight">
            {formatPrice(product.priceExample)}
          </div>
        </div>
        <div className="w-32 shrink-0">
          <AffiliateButton
            href={product.affiliateUrl}
            provider={product.provider}
            size="sm"
            label="최저가 보기"
            track={{
              article,
              productId: product.coupangProductId ?? product.id,
              product: product.name,
              grade: product.grade,
              price: product.priceExample,
              placement: "sticky_cta",
              recommended: true,
            }}
          />
        </div>
      </div>
    </div>
  );
}
