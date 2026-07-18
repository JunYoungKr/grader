import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getCategory,
  getCategories,
  getArticlesByCategory,
} from "@/lib/content";
import { GradeBadge } from "@/components/GradeBadge";
import { DisclosureNote } from "@/components/DisclosureNote";
import { PopularProductGrid } from "@/components/PopularProductGrid";
import {
  getPopularProducts,
  getPopularProductsGeneratedAt,
} from "@/lib/popular-products";
import type { Article } from "@/lib/types";

const TYPE_LABEL: Record<Article["type"], string> = {
  comparison: "등급표",
  guide: "가이드",
  hub: "종합 가이드",
};

// DB(ISR) — 어드민 저장 시 revalidatePath로 즉시 갱신
export const revalidate = 300;

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
  const articles = await getArticlesByCategory(category);
  const popularProducts = getPopularProducts(category);
  const generatedAt = getPopularProductsGeneratedAt();
  const checkedAt = popularProducts[0]?.priceCheckedAt;

  return (
    <div className="mx-auto max-w-content px-5 py-10">
      <h1 className="text-3xl font-medium tracking-tight">{cat.name}</h1>
      <p className="mt-2 text-[15px] text-muted">{cat.blurb}</p>
      <DisclosureNote providers={["coupang"]} className="mt-3 max-w-3xl" />

      <section className="mt-10">
        <h2 className="text-lg font-semibold">검수된 비교·가이드</h2>
        {articles.length === 0 ? (
          <p className="mt-4 text-[15px] text-muted">
            아직 검수가 끝난 글이 없습니다. 아래 인기 상품을 바탕으로 비교 글을 준비 중입니다.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
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
      </section>

      {popularProducts.length > 0 && (
        <section className="mt-12" aria-labelledby="popular-products">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="popular-products" className="text-lg font-semibold">
                쿠팡 카테고리 인기 상품 20개
              </h2>
              <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-muted">
                쿠팡 카테고리 베스트 API 응답에서 다른 카테고리 상품을 제외한 목록입니다.
                판매량 수치나 Grader 등급을 뜻하지 않으며, 옵션·가격은 구매 전에 확인하세요.
              </p>
            </div>
            <p className="shrink-0 text-xs text-faint">
              {checkedAt ? `${checkedAt} 가격 조회` : "가격 조회일 없음"}
              {generatedAt ? " · API 스냅샷" : ""}
            </p>
          </div>
          <PopularProductGrid products={popularProducts} category={category} />
        </section>
      )}
    </div>
  );
}
