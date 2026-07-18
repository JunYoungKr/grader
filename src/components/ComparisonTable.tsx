import type { Product } from "@/lib/types";
import type { MatchInfo } from "@/lib/explorer";
import { formatPrice } from "@/lib/grade";
import { GradeBadge } from "./GradeBadge";
import { AffiliateButton } from "./AffiliateButton";
import { ProviderTag } from "./ProviderTag";
import { MatchBadge } from "./MatchBadge";
import { ProductImage } from "./ProductImage";

export function ComparisonTable({
  products,
  article,
  matchMap,
}: {
  products: Product[];
  article?: string;
  matchMap?: Record<string, MatchInfo>;
}) {
  const specLabels = products[0]?.specs.map((s) => s.label) ?? [];
  return (
    <div className="overflow-hidden rounded-lg border border-hairline">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-hairline text-left text-xs text-faint">
            <th className="px-4 py-3 font-medium">종합</th>
            <th className="px-4 py-3 font-medium">제품</th>
            {specLabels.map((l) => (
              <th key={l} className="px-4 py-3 font-medium">
                {l}
              </th>
            ))}
            <th className="px-4 py-3 font-medium">조회 가격</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const match = matchMap?.[p.id];
            return (
              <tr
                key={p.id}
                className="border-b border-hairline align-middle last:border-0"
              >
                <td className="px-4 py-3">
                  <GradeBadge grade={p.grade} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex min-w-52 items-center gap-3">
                    {p.imageUrl && (
                      <ProductImage product={p} size={72} className="shrink-0" />
                    )}
                    <div>
                      <div className={p.recommended ? "font-semibold" : "font-medium"}>
                        {p.name}
                      </div>
                      <div className="text-[13px] text-muted">{p.descriptor}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <ProviderTag provider={p.provider} />
                        {p.isRocket && (
                          <span className="text-[11px] font-medium text-brand">로켓배송</span>
                        )}
                      </div>
                      {match && (
                        <div className="mt-1">
                          <MatchBadge info={match} />
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                {p.specs.map((s) => (
                  <td key={s.label} className="px-4 py-3 tabular-nums text-muted">
                    {s.value}
                  </td>
                ))}
                <td className="px-4 py-3 tabular-nums">
                  <div>{formatPrice(p.priceExample)}</div>
                  {p.priceCheckedAt && (
                    <div className="mt-0.5 whitespace-nowrap text-[11px] text-faint">
                      {p.priceCheckedAt} 확인
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="w-24">
                    <AffiliateButton
                      href={p.affiliateUrl}
                      provider={p.provider}
                      label="현재가 확인"
                      size="sm"
                      track={{
                        article,
                        productId: p.coupangProductId ?? p.id,
                        product: p.name,
                        grade: p.grade,
                        price: p.priceExample,
                        placement: "comparison_table",
                        recommended: p.recommended,
                      }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
