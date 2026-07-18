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
}: {
  product: Product;
  article?: string;
  match?: MatchInfo;
}) {
  const ring = product.recommended
    ? "border-2 border-brand"
    : "border border-hairline";
  const priceCheckedLabel = checkedAtLabel(product.priceCheckedAt);
  return (
    <div className={`relative rounded-lg bg-surface p-[1.1rem] ${ring}`}>
      {product.recommended && (
        <span className="absolute -top-3 left-3.5 rounded-md bg-brand-soft px-2.5 py-[3px] text-xs font-medium text-brand">
          종합 추천
        </span>
      )}
      <div className="mb-2.5 flex items-center justify-between">
        <GradeBadge grade={product.grade} />
        <span className="text-xs text-faint">{product.type}</span>
      </div>
      {product.imageUrl && (
        <div className="mb-3 flex justify-center">
          <ProductImage product={product} size={180} />
        </div>
      )}
      <p className="text-base font-medium">{product.name}</p>
      <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
        {product.descriptor}
      </p>
      {match && (
        <div className="mt-2">
          <MatchBadge info={match} />
        </div>
      )}
      <dl className="mt-3 space-y-1.5 border-t border-hairline pt-2.5 text-[13px]">
        {product.specs.map((s) => (
          <div key={s.label} className="flex justify-between">
            <dt className="text-muted">{s.label}</dt>
            <dd className="tabular-nums">{s.value}</dd>
          </div>
        ))}
        <div className="flex justify-between">
          <dt className="text-muted">조회 가격</dt>
          <dd className="text-right tabular-nums">
            <span>{formatPrice(product.priceExample)}</span>
            {priceCheckedLabel && (
              <span className="block text-[11px] text-faint">
                {priceCheckedLabel}
              </span>
            )}
          </dd>
        </div>
      </dl>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
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
      <div className="mt-1.5">
        <AffiliateButton
          href={product.affiliateUrl}
          provider={product.provider}
          primary={product.recommended}
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
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-faint">
        가격과 재고는 쿠팡에서 변경될 수 있습니다.
      </p>
    </div>
  );
}
