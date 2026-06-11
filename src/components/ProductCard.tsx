import type { Product } from "@/lib/types";
import type { MatchInfo } from "@/lib/explorer";
import { formatPrice } from "@/lib/grade";
import { GradeBadge } from "./GradeBadge";
import { AffiliateButton } from "./AffiliateButton";
import { ProviderTag } from "./ProviderTag";
import { MatchBadge } from "./MatchBadge";

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
          <p className="mt-0.5 text-lg font-medium leading-snug">{product.name}</p>
        </div>
        {rank !== undefined && (
          <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 text-xs font-medium leading-relaxed text-paper">
            {rank}위
          </span>
        )}
      </div>

      {match && <MatchBadge info={match} />}

      <p className="text-sm leading-relaxed text-muted">{product.descriptor}</p>

      <dl className="space-y-1.5 border-t border-hairline pt-2.5 text-xs text-faint">
        {product.specs.map((s) => (
          <div key={s.label} className="flex justify-between gap-3">
            <dt>{s.label}</dt>
            <dd className="text-right tabular-nums text-muted">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-lg font-medium tabular-nums leading-tight">
            {formatPrice(product.priceExample)}
          </div>
          <div className="text-xs text-faint">예시가 · 조회 시점 기준</div>
        </div>
        <ProviderTag provider={product.provider} />
      </div>

      <AffiliateButton
        href={product.affiliateUrl}
        provider={product.provider}
        track={{
          article,
          product: product.name,
          grade: product.grade,
          placement: "product_card",
          recommended: product.recommended,
        }}
      />
    </div>
  );
}
