import Link from "next/link";
import type { ChecklistItem } from "@/lib/types";

// 품목 | 권장 수량 | 메모 — 일부 품목은 비교글로 내부 연결(funnel)
export function ChecklistTable({ items }: { items: ChecklistItem[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline">
      <table className="w-full border-collapse text-small">
        <thead>
          <tr className="border-b border-hairline bg-surface text-left text-small text-muted">
            <th className="px-4 py-3 font-medium">품목</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">
              권장 수량
            </th>
            <th className="px-4 py-3 font-medium">메모</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr
              key={it.name}
              className="border-b border-hairline align-top last:border-0"
            >
              <td className="px-4 py-3 font-medium">
                {it.slug ? (
                  <Link
                    href={`/${it.slug}`}
                    className="text-brand hover:underline"
                  >
                    {it.name}
                  </Link>
                ) : (
                  it.name
                )}
              </td>
              <td className="px-4 py-3 tabular-nums">{it.quantity}</td>
              <td className="px-4 py-3 leading-relaxed text-muted">
                {it.note}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
