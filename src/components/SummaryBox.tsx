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
      className="scroll-mt-20 rounded-lg border border-hairline bg-surface p-5"
    >
      <h2 className="text-base font-semibold">한눈에 요약</h2>
      <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-muted">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-brand" aria-hidden="true">
              ·
            </span>
            {/* 첫 줄 = 핵심 답변 → semibold로 강조 */}
            <span className={i === 0 ? "font-semibold text-ink" : ""}>{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
