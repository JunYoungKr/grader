export function TableOfContents({
  items,
  article,
}: {
  items: { id: string; label: string }[];
  article?: string;
}) {
  if (items.length < 2) return null;
  return (
    <nav aria-label="목차" className="rounded-md bg-surface p-4 text-sm">
      <p className="mb-2 font-medium">목차</p>
      <ol className="space-y-1.5">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className="text-muted transition-colors hover:text-ink"
              data-ga="toc"
              data-ga-target={it.id}
              data-ga-article={article}
            >
              {it.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
