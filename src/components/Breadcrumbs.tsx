import Link from "next/link";

export interface BreadcrumbItem { name: string; href: string }

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="현재 위치" className="mb-5 text-xs text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {i === items.length - 1
              ? <span aria-current="page">{item.name}</span>
              : <Link href={item.href} className="hover:text-brand">{item.name}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
