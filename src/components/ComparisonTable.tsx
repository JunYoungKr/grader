import type { Product } from "@/lib/types";
import type { MatchInfo } from "@/lib/explorer";
import { formatPrice } from "@/lib/grade";
import { AffiliateButton } from "./AffiliateButton";
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
  const labels = Array.from(
    new Set(products.flatMap((p) => p.specs.map((s) => s.label))),
  );
  return (
    <div
      className="overflow-x-auto rounded-lg border border-hairline"
      role="region"
      aria-label="상품 사양 비교표"
      tabIndex={0}
    >
      <table className="w-full border-collapse bg-card text-small">
        <caption className="sr-only">제품별 사양과 조회 가격 비교</caption>
        <thead>
          <tr className="border-b border-hairline bg-surface text-left text-muted">
            <th scope="col" className="min-w-52 px-5 py-4 font-medium">
              제품
            </th>
            {labels.map((l) => (
              <th
                scope="col"
                key={l}
                className="min-w-28 px-5 py-4 font-medium"
              >
                {l}
              </th>
            ))}
            <th scope="col" className="min-w-36 px-5 py-4 font-medium">
              조회 가격
            </th>
            <th scope="col" className="px-5 py-4 font-medium">
              판매처
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-hairline last:border-0">
              <th scope="row" className="px-5 py-5 text-left font-medium">
                {p.name}
                {matchMap?.[p.id] && (
                  <div className="mt-2">
                    <MatchBadge info={matchMap[p.id]} />
                  </div>
                )}
              </th>
              {labels.map((l) => (
                <td key={l} className="px-5 py-5 text-muted">
                  {p.specs.find((s) => s.label === l)?.value ?? "정보 없음"}
                </td>
              ))}
              <td className="px-5 py-5 tabular-nums">
                {formatPrice(p.priceExample)}
                <span className="block text-caption text-faint">
                  {p.priceCheckedAt ?? "조회일 미등록"}
                </span>
              </td>
              <td className="min-w-40 px-5 py-5">
                <AffiliateButton
                  href={p.affiliateUrl}
                  provider={p.provider}
                  size="sm"
                  label="현재가 확인"
                  track={{
                    article,
                    productId: p.coupangProductId ?? p.id,
                    product: p.name,
                    price: p.priceExample,
                    placement: "comparison_table",
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
