export function SummaryBox({
  items,
  id = "summary",
}: {
  items: string[];
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-y border-hairline py-6">
      <h2 className="mb-4 text-title font-medium">요약</h2>
      <ul className="space-y-4 text-body">
        {items.map((text, i) => (
          <li key={i}>
            <span className={i === 0 ? "font-medium" : "text-muted"}>
              {text}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
