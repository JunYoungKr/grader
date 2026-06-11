import type { Product } from "@/lib/types";
import type { MatchInfo } from "@/lib/explorer";
import { formatPrice } from "@/lib/grade";
import { GradeBadge } from "./GradeBadge";
import { AffiliateButton } from "./AffiliateButton";
import { ProviderTag } from "./ProviderTag";
import { MatchBadge } from "./MatchBadge";

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
            <th className="px-4 py-3 font-medium">예시가</th>
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
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{p.name}</span>
                    {p.recommended && (
                      <span className="rounded-md bg-brand-soft px-1.5 py-px text-[11px] font-medium text-brand">
                        PICK
                      </span>
                    )}
                  </div>
                  <div className="text-[13px] text-muted">{p.descriptor}</div>
                  <div className="mt-0.5">
                    <ProviderTag provider={p.provider} />
                  </div>
                  {match && (
                    <div className="mt-1">
                      <MatchBadge info={match} />
                    </div>
                  )}
                </td>
                {p.specs.map((s) => (
                  <td key={s.label} className="px-4 py-3 tabular-nums text-muted">
                    {s.value}
                  </td>
                ))}
                <td className="px-4 py-3 font-medium tabular-nums">
                  {formatPrice(p.priceExample)}
                </td>
                <td className="px-4 py-3">
                  <div className="w-24">
                    <AffiliateButton
                      href={p.affiliateUrl}
                      provider={p.provider}
                      size="sm"
                      label="보기"
                      track={{
                        article,
                        product: p.name,
                        grade: p.grade,
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
