import Link from "next/link";
import { getCategories } from "@/lib/content";
import { SITE_NAME } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";

// sticky 헤더 — 반투명 paper + blur(시스템에서 유일한 블러), 하단 헤어라인.
export function Header() {
  const categories = getCategories();
  return (
    <header
      className="sticky top-0 z-20 border-b border-hairline backdrop-blur-[8px]"
      style={{ background: "color-mix(in srgb, var(--paper) 88%, transparent)" }}
    >
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-3">
        <Link href="/" className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-ink text-base font-medium leading-none text-paper"
          >
            G
          </span>
          <span className="text-lg font-medium tracking-tight">{SITE_NAME}</span>
        </Link>
        <div className="flex min-w-0 items-center gap-4">
          <nav className="flex gap-1 overflow-x-auto whitespace-nowrap text-sm text-muted">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="rounded-md px-2.5 py-1.5 transition-colors hover:bg-brand-soft hover:text-brand"
              >
                {c.name}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
