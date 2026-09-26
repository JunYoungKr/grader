import type { MatchInfo } from "@/lib/explorer";

export function MatchBadge({ info }: { info: MatchInfo }) {
  if (info.total === 0) return null;
  const full = info.satisfied === info.total;
  return (
    <span
      className={`inline-flex flex-col items-start gap-1 text-caption font-medium ${
        full ? "text-brand" : "text-muted"
      }`}
    >
      조건 {info.total}개 중 {info.satisfied}개 충족
      {info.missed.length > 0 && (
        <span className="text-faint">미충족: {info.missed.join(", ")}</span>
      )}
    </span>
  );
}
