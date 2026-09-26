import Link from "next/link";
import { categories } from "@/content/categories";
export function CategoryTabs({
  selected = "",
  query = "",
}: {
  selected?: string;
  query?: string;
}) {
  const ordered = [
    "daily-life",
    "food",
    "digital",
    "baby",
    "beauty",
    "sports",
  ].map((slug) => categories.find((c) => c.slug === slug)!);
  return (
    <nav
      aria-label="살림 분야"
      className="flex flex-wrap gap-x-5 gap-y-2 border-b border-hairline"
    >
      {[{ slug: "", name: "전체" }, ...ordered].map((c) => {
        const params = new URLSearchParams();
        if (c.slug) params.set("category", c.slug);
        if (query) params.set("q", query);
        return (
          <Link
            key={c.slug}
            href={`/browse${params.size ? `?${params}` : ""}`}
            aria-current={selected === c.slug ? "page" : undefined}
            className={`inline-flex min-h-touch items-center border-b-2 px-1 text-small ${selected === c.slug ? "border-brand font-medium text-brand" : "border-transparent text-muted hover:border-hairline hover:text-brand"}`}
          >
            {c.name}
          </Link>
        );
      })}
    </nav>
  );
}
