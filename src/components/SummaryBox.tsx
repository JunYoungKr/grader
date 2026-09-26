export function SummaryBox({
  items,
  id = "summary",
}: {
  items: string[];
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-y border-hairline py-6">
      <h2 className="mb-5 text-title font-semibold">요약</h2>
      <ul className="max-w-prose space-y-5 text-reading text-ink">
        {items.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
      </ul>
    </section>
  );
}
