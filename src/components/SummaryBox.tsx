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
      <h2 className="text-title font-semibold text-ink">한눈에 요약</h2>
      <ul className="mt-5 max-w-prose space-y-5 text-reading text-ink break-keep">
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </section>
  );
}
