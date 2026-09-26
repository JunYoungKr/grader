import type { Product } from "@/lib/types";
import type { MatchInfo } from "@/lib/explorer";
import { formatPrice } from "@/lib/grade";
import { GradeBadge } from "./GradeBadge";
import { AffiliateButton } from "./AffiliateButton";
import { ProviderTag } from "./ProviderTag";
import { MatchBadge } from "./MatchBadge";
import { ProductImage } from "./ProductImage";

function checkedAtLabel(value?: string): string | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")} 확인`;
}

export function ProductCard({
  product,
  article,
  match,
  rank,
}: {
  product: Product;
  article?: string;
  match?: MatchInfo;
  rank?: number;
}) {
  const priceCheckedLabel = checkedAtLabel(product.priceCheckedAt);
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-paper p-4">
      <div className="flex items-start gap-3">
        <GradeBadge grade={product.grade} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-faint">
            <span>{product.type}</span>
            {product.recommended && (
              <span className="rounded-md bg-brand-soft px-2 py-px font-medium text-brand">
                에디터 PICK
              </span>
            )}
          </div>
          <h3 className="mt-0.5 text-title font-semibold">{product.name}</h3>
        </div>
        {rank !== undefined && (
          <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 text-xs font-medium leading-relaxed text-paper">
            {rank}위
          </span>
        )}
      </div>

      {product.imageUrl && (
        <div className="flex justify-center rounded-lg bg-surface p-2">
          <ProductImage product={product} size={180} />
        </div>
      )}

      {match && <MatchBadge info={match} />}

      <p className="text-body text-ink">{product.descriptor}</p>

      <dl className="space-y-3 border-t border-hairline pt-4 text-body text-muted">
        {product.specs.map((s) => (
          <div key={s.label} className="flex justify-between gap-3">
            <dt className="shrink-0">{s.label}</dt>
            <dd className="min-w-0 break-words text-right tabular-nums text-ink">{s.value}</dd>
          </div>
        ))}
        <div className="flex justify-between">
          <dt>조회 가격</dt>
          <dd className="text-right tabular-nums">
            <span className="text-title font-semibold text-ink">{formatPrice(product.priceExample)}</span>
            {priceCheckedLabel && (
              <span className="block text-caption text-muted">
                {priceCheckedLabel}
              </span>
            )}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-1.5">
        <ProviderTag provider={product.provider} />
        {product.isRocket && (
          <span className="rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">
            로켓배송
          </span>
        )}
        {product.isFreeShipping && (
          <span className="rounded-md border border-hairline px-2 py-0.5 text-[11px] text-muted">
            무료배송
          </span>
        )}
      </div>

      <AffiliateButton
        href={product.affiliateUrl}
        provider={product.provider}
        track={{
          article,
          productId: product.coupangProductId ?? product.id,
          product: product.name,
          grade: product.grade,
          price: product.priceExample,
          placement: "product_card",
          recommended: product.recommended,
        }}
      />
      <p className="text-[11px] leading-relaxed text-faint">
        가격과 재고는 쿠팡에서 변경될 수 있습니다.
      </p>
    </div>
  );
}
