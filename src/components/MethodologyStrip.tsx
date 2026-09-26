function ShieldIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-brand"
    >
      <path d="M12 3 4 6v6c0 5 3.4 7.5 8 9 4.6-1.5 8-4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function MethodologyStrip() {
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted">
      <ShieldIcon />
      <span>광고비와 분리된 평가, KC안전인증, 소비자원 비교시험 등 1차 출처 기반</span>
    </p>
  );
}
