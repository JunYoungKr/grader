import Link from "next/link";
import { categories } from "@/content/categories";

const topics = ["daily-life", "food", "digital", "baby"].map(
  (slug) => categories.find((category) => category.slug === slug)!,
);

export function TopicNavigation() {
  return (
    <nav aria-label="주요 살림 분야" className="border-y border-hairline">
      <ul className="grid grid-cols-2 gap-x-6 py-3 sm:grid-cols-4">
        {topics.map((topic) => (
          <li key={topic.slug}>
            <Link
              href={`/category/${topic.slug}`}
              className="flex min-h-touch items-center py-2 text-body font-medium underline-offset-4 hover:text-brand hover:underline"
            >
              {topic.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
