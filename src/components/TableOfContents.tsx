export function TableOfContents({
  items,
  article,
}: {
  items: { id: string; label: string }[];
  article?: string;
}) {
  if (items.length < 2) return null;
  return (
    <nav
      aria-label="목차"
      className="rounded-lg border border-hairline bg-paper p-4 text-sm"
    >
      <p className="mb-2.5 text-xs font-medium tracking-[0.04em] text-faint">목차</p>
      {/* 모바일 2열 → 데스크톱 사이드바 1열 */}
      <ol className="grid grid-cols-2 gap-x-3 gap-y-1.5 lg:grid-cols-1">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className="text-brand transition-opacity hover:opacity-80"
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
