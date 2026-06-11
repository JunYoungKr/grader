export function SummaryBox({
  items,
  id = "summary",
}: {
  items: string[];
  id?: string;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-xl bg-brand-soft p-5"
    >
      <h2 className="text-sm font-medium text-brand">한눈에 요약</h2>
      <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-muted">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-brand" aria-hidden="true">
              ·
            </span>
            {/* 첫 줄 = 핵심 답변 → medium + ink로 강조 (시스템 최대 굵기 500) */}
            <span className={i === 0 ? "font-medium text-ink" : ""}>{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
