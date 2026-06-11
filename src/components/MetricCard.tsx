// 지표 셀 — 부모가 hairline 1px 간격 그리드(gap-px bg-hairline)로 감싼다.
export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper px-4 py-3">
      <div className="text-lg font-medium tabular-nums md:text-[22px]">{value}</div>
      <div className="mt-0.5 text-xs text-faint">{label}</div>
    </div>
  );
}
