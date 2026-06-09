import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/grade";
import { GradeBadge } from "./GradeBadge";
import { AffiliateButton } from "./AffiliateButton";
import { ProviderTag } from "./ProviderTag";

export function ProductCard({
  product,
  article,
}: {
  product: Product;
  article?: string;
}) {
  const ring = product.recommended
    ? "border-2 border-brand"
    : "border border-hairline";
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
      <p className="text-base font-medium">{product.name}</p>
      <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
        {product.descriptor}
      </p>
      <dl className="mt-3 space-y-1.5 border-t border-hairline pt-2.5 text-[13px]">
        {product.specs.map((s) => (
          <div key={s.label} className="flex justify-between">
            <dt className="text-muted">{s.label}</dt>
            <dd className="tabular-nums">{s.value}</dd>
          </div>
        ))}
        <div className="flex justify-between">
          <dt className="text-muted">예시가</dt>
          <dd className="tabular-nums">{formatPrice(product.priceExample)}</dd>
        </div>
      </dl>
      <div className="mt-3 flex items-center justify-between">
        <ProviderTag provider={product.provider} />
      </div>
      <div className="mt-1.5">
        <AffiliateButton
          href={product.affiliateUrl}
          provider={product.provider}
          primary={product.recommended}
          track={{
            article,
            product: product.name,
            grade: product.grade,
            placement: "product_card",
            recommended: product.recommended,
          }}
        />
      </div>
    </div>
  );
}
