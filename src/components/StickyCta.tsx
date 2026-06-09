import { AffiliateButton } from "./AffiliateButton";
import type { Product } from "@/lib/types";

export function StickyCta({
  product,
  article,
}: {
  product: Product;
  article?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-paper p-3 md:hidden">
      <div className="mx-auto flex max-w-content items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] text-faint">1순위 추천</div>
          <div className="truncate text-sm font-semibold">{product.name}</div>
        </div>
        <div className="w-36 shrink-0">
          <AffiliateButton
            href={product.affiliateUrl}
            provider={product.provider}
            primary
            label="추천 보기"
            track={{
              article,
              product: product.name,
              grade: product.grade,
              placement: "sticky_cta",
              recommended: true,
            }}
          />
        </div>
      </div>
    </div>
  );
}
