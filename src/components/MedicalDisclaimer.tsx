export function MedicalDisclaimer({ className = "" }: { className?: string }) {
  return (
    <aside
      className={`rounded-lg border border-hairline bg-surface p-4 text-[13px] leading-relaxed text-muted ${className}`}
    >
      <p className="mb-1 font-medium text-ink">의료 면책</p>
      이 글은 일반 정보 제공을 위한 것으로 의학적 진단·처방을 대체하지 않습니다. 아기의
      건강·안전과 관련된 결정은 소아과 전문의 등 전문가와 상담하세요.
    </aside>
  );
}
