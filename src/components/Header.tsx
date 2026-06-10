import Link from "next/link";
import { getCategories } from "@/lib/content";
import { SITE_NAME } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const categories = getCategories();
  return (
    <header className="border-b border-hairline">
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-4">
        <Link href="/" className="text-lg font-medium tracking-tight">
          {SITE_NAME}
        </Link>
        <div className="flex min-w-0 items-center gap-4">
          <nav className="flex gap-4 overflow-x-auto whitespace-nowrap text-sm text-muted">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="transition-colors hover:text-ink"
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
