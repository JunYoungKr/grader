import type { Metadata } from "next";
import { getAllArticles, getCategories } from "@/lib/content";
import { getCurrentPopularSnapshot } from "@/lib/popular-products-live";
import {
  Container,
  Breadcrumb,
  SectionHeading,
  EmptyState,
  ContentNotice,
} from "@/components/ui/Primitives";
import { SearchForm } from "@/components/ui/SearchForm";
import { CategoryTabs } from "@/components/content/CategoryTabs";
import { ArticleCard } from "@/components/content/ArticleCard";
import { PopularProductGrid } from "@/components/PopularProductGrid";
import { DisclosureNote } from "@/components/DisclosureNote";
import { pageMetadata } from "@/lib/seo";
import { SearchResultsTracking } from "@/components/SearchResultsTracking";
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  return { ...pageMetadata({
  path: "/browse",
  title: "살림 둘러보기",
  description:
    "살림 가이드와 생활용품을 분야별로 찾고, 우리 집에 필요한 정보를 검색하세요.",
  }), ...(params.q || params.category ? { robots: { index: false, follow: true } } : {}) };
}
export const revalidate = 300;
export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const query =
    typeof params.q === "string" ? params.q.trim().slice(0, 200) : "";
  const categories = getCategories();
  const category = categories.some((c) => c.slug === params.category)
    ? params.category!
    : "";
  const words = query.toLocaleLowerCase("ko-KR").split(/\s+/).filter(Boolean);
  const matches = (value: string) =>
    words.every((word) => value.toLocaleLowerCase("ko-KR").includes(word));
  const articles = (await getAllArticles()).filter(
    (a) =>
      (!category || a.category === category) &&
      matches(`${a.title} ${a.description} ${a.summary.join(" ")}`),
  );
  const productSnapshot = await getCurrentPopularSnapshot();
  const products = categories
    .filter((c) => !category || c.slug === category)
    .flatMap((c) => productSnapshot.categories[c.slug] ?? [])
    .filter((p) =>
      matches(`${p.name} ${p.categoryName} ${p.sourceCategoryLabel}`),
    );
  const uniqueProducts = products.filter(
    (p, i) =>
      products.findIndex(
        (other) => other.coupangProductId === p.coupangProductId,
      ) === i,
  );
  return (
    <Container className="py-8 md:py-12">
      {query && <SearchResultsTracking key={`${category}:${query}`} category={category || "all"} articleCount={articles.length} productCount={uniqueProducts.length} />}
      <Breadcrumb items={[{ label: "살림 둘러보기" }]} />
      <h1 className="text-heading font-medium">살림 둘러보기</h1>
      <p className="mt-3 text-body text-muted">
        제품명이나 궁금한 내용을 검색하세요.
      </p>
      <div className="mt-6 max-w-2xl">
        <SearchForm
          key={`${query}:${category}`}
          query={query}
          category={category}
        />
      </div>
      <div className="mt-6">
        <CategoryTabs selected={category} query={query} />
      </div>
      {query && (
        <p className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-small text-muted">
          <span>‘{query}’ 검색 결과</span>
          <span>
            글 {articles.length}개, 상품 {uniqueProducts.length}개
          </span>
        </p>
      )}
      {articles.length > 0 ? (
        <section id="guides" className="section-block">
          <SectionHeading title="살림 가이드" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      ) : (
        <div id="guides" className="mt-8">
          <ContentNotice>
            {query
              ? "검색어에 맞는 가이드가 없습니다."
              : "아직 등록된 가이드가 없습니다."}
          </ContentNotice>
        </div>
      )}
      <section className="section-block">
        <SectionHeading
          title="상품 목록"
          description="쿠팡에서 수집한 상품입니다. 상품별 가격 조회일을 확인하세요."
        />
        {uniqueProducts.length ? (
          <>
            <DisclosureNote providers={["coupang"]} className="mb-5" />
            <PopularProductGrid
              products={uniqueProducts}
              category={category || "all"}
            />
          </>
        ) : (
          <EmptyState
            title="조건에 맞는 상품이 없어요"
            description="검색어를 짧게 입력하거나 다른 분야를 선택해 보세요."
            href="/browse"
            action="전체 다시 보기"
          />
        )}
      </section>
    </Container>
  );
}
