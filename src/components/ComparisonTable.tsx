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
          <tr className="border-b border-hairline bg-surface text-left text-[13px] text-muted">
            <th className="px-4 py-3 font-medium">등급</th>
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
          {products.map((p) => (
            <tr
              key={p.id}
              className="border-b border-hairline align-middle last:border-0"
            >
              <td className="px-4 py-3">
                <GradeBadge grade={p.grade} size="sm" />
              </td>
              <td className="px-4 py-3">
                <div className={p.recommended ? "font-semibold" : "font-medium"}>
                  {p.name}
                </div>
                <div className="text-[13px] text-muted">{p.descriptor}</div>
                <div className="mt-0.5">
                  <ProviderTag provider={p.provider} />
                </div>
                {matchMap?.[p.id] && (
                  <div className="mt-1">
                    <MatchBadge info={matchMap[p.id]} />
                  </div>
                )}
              </td>
              {p.specs.map((s) => (
                <td key={s.label} className="px-4 py-3 tabular-nums">
                  {s.value}
                </td>
              ))}
              <td className="px-4 py-3 tabular-nums">
                {formatPrice(p.priceExample)}
              </td>
              <td className="px-4 py-3">
                <div className="w-28">
                  <AffiliateButton
                    href={p.affiliateUrl}
                    provider={p.provider}
                    primary={p.recommended}
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
