export function TableOfContents({
  items,
  article,
}: {
  items: { id: string; label: string }[];
  article?: string;
}) {
  if (items.length < 2) return null;
  return (
    <nav aria-label="목차" className="panel p-5">
      <p className="mb-3 text-body font-semibold text-ink">
        이 글에서 함께 볼 내용
      </p>
      <ol className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="flex min-h-touch items-center gap-3 rounded-md px-2 py-2 text-small text-ink hover:bg-surface hover:text-brand"
              data-ga="toc"
              data-ga-target={item.id}
              data-ga-article={article}
            >
              <span className="shrink-0 text-caption font-medium tabular-nums text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
