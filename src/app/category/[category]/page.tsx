import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getCategory,
  getCategories,
  getArticlesByCategory,
} from "@/lib/content";
import { GradeBadge } from "@/components/GradeBadge";
import type { Article } from "@/lib/types";

const TYPE_LABEL: Record<Article["type"], string> = {
  comparison: "등급표",
  guide: "가이드",
  hub: "종합 가이드",
};

export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return {};
  return { title: `${cat.name} 등급 비교`, description: cat.blurb };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();
  const articles = getArticlesByCategory(category);

  return (
    <div className="mx-auto max-w-content px-5 py-10">
      <h1 className="text-3xl font-medium tracking-tight">{cat.name}</h1>
      <p className="mt-2 text-[15px] text-muted">{cat.blurb}</p>

      {articles.length === 0 ? (
        <p className="mt-10 text-[15px] text-muted">
          아직 등록된 글이 없습니다. 첫 비교 글을 준비 중입니다.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-hairline border-y border-hairline">
          {articles.map((a) => {
            const top = a.products?.[0];
            return (
              <li key={a.slug}>
                <Link
                  href={`/${a.slug}`}
                  className="flex items-center gap-4 py-4 transition-colors hover:bg-surface"
                >
                  {top ? (
                    <GradeBadge grade={top.grade} size="sm" />
                  ) : (
                    <span className="inline-flex h-7 items-center rounded-md bg-surface px-2 text-xs text-muted">
                      {TYPE_LABEL[a.type]}
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="truncate font-medium">{a.title}</div>
                    <div className="text-[13px] text-muted">{a.updated}</div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
