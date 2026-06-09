import type { MatchInfo } from "@/lib/explorer";

export function MatchBadge({ info }: { info: MatchInfo }) {
  if (info.total === 0) return null;
  const full = info.satisfied === info.total;
  return (
    <span
      role="status"
      className={`inline-flex flex-wrap items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        full ? "bg-brand-soft text-brand" : "bg-surface text-muted"
      }`}
    >
      조건 {info.total}개 중 {info.satisfied}개 충족
      {info.missed.length > 0 && (
        <span className="text-faint">· {info.missed.join(" · ")} 미충족</span>
      )}
    </span>
  );
}
