export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface px-4 py-3">
      <div className="text-[13px] text-muted">{label}</div>
      <div className="mt-0.5 text-xl font-medium tabular-nums">{value}</div>
    </div>
  );
}
