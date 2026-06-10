import Link from "next/link";
import { getCategories, getAllArticles, getCategory } from "@/lib/content";
import { GradeBadge } from "@/components/GradeBadge";
import { MethodologyStrip } from "@/components/MethodologyStrip";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import type { Article } from "@/lib/types";

const TYPE_LABEL: Record<Article["type"], string> = {
  comparison: "등급표",
  guide: "가이드",
  hub: "종합 가이드",
};

function ArticleRow({ article }: { article: Article }) {
  const cat = getCategory(article.category);
  const top = article.products?.[0];
  return (
    <Link
      href={`/${article.slug}`}
      className="flex items-center gap-4 py-4 transition-colors hover:bg-surface"
    >
      {top ? (
        <GradeBadge grade={top.grade} size="sm" />
      ) : (
        <span className="inline-flex h-7 items-center rounded-md bg-surface px-2 text-xs text-muted">
          {TYPE_LABEL[article.type]}
        </span>
      )}
      <div className="min-w-0">
        <div className="truncate font-medium">{article.title}</div>
        <div className="text-[13px] text-muted">
          {cat?.name} · {article.updated}
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const categories = getCategories();
  const articles = getAllArticles();
  return (
    <div className="mx-auto max-w-content px-5 py-12">
      <section className="max-w-2xl">
        <MethodologyStrip />
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight">
          사야 할 제품, 등급으로 빠르게 비교하세요
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          안전성·성능·성분·가격을 카테고리별 기준으로 평가해 S/A/B/C 등급을
          매깁니다. 리뷰 데이터와 1차 출처로 검증하고, 등급은 광고비와 분리합니다.
        </p>
      </section>

      <RecentlyViewed className="mt-10" />

      <section className="mt-10">
        <h2 className="text-lg font-semibold">카테고리</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="rounded-lg border border-hairline bg-surface p-4 transition-colors hover:border-brand"
            >
              <div className="font-medium">{c.name}</div>
              <div className="mt-1 text-[13px] text-muted">{c.blurb}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">최신 글</h2>
        {articles.length === 0 ? (
          <p className="mt-4 text-[15px] text-muted">
            아직 등록된 글이 없습니다. 카테고리별 비교 글을 준비 중입니다.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
            {articles.map((a) => (
              <li key={a.slug}>
                <ArticleRow article={a} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
