import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCategory,
  getCategories,
  getArticlesByCategory,
} from "@/lib/content";
import { getCurrentPopularProducts } from "@/lib/popular-products-live";
import {
  Container,
  Breadcrumb,
  SectionHeading,
  EmptyState,
} from "@/components/ui/Primitives";
import { CategoryTabs } from "@/components/content/CategoryTabs";
import { ArticleCard } from "@/components/content/ArticleCard";
import { PopularProductGrid } from "@/components/PopularProductGrid";
import { DisclosureNote } from "@/components/DisclosureNote";
import { pageMetadata } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/lib/jsonld";
export const revalidate = 300;
export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const cat = getCategory((await params).category);
  return cat
    ? pageMetadata({ title: `${cat.name} 살림 가이드`, description: cat.blurb, path: `/category/${cat.slug}` })
    : {};
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
  const products = await getCurrentPopularProducts(category);
  return (
    <Container className="py-8 md:py-12">
      <BreadcrumbJsonLd items={[
        { name: "홈", href: "/" },
        { name: "살림 둘러보기", href: "/browse" },
        { name: cat.name, href: `/category/${cat.slug}` },
      ]} />
      <Breadcrumb
        items={[
          { label: "살림 둘러보기", href: "/browse" },
          { label: cat.name },
        ]}
      />
      <div className="mb-8">
        <h1 className="text-heading font-medium">{cat.name}</h1>
        <p className="mt-3 text-body text-muted">{cat.blurb}</p>
      </div>
      <CategoryTabs selected={category} />
      <section className="section-block">
        <SectionHeading title="살림 가이드" />
        {articles.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="아직 등록된 가이드가 없습니다"
            description="아래에서 이 분야의 상품을 확인할 수 있어요."
          />
        )}
      </section>
      <section className="section-block">
        <SectionHeading
          title="상품 목록"
          description="쿠팡에서 수집한 상품입니다. 상품별 가격 조회일을 확인하세요."
        />
        {products.length ? (
          <>
            <DisclosureNote providers={["coupang"]} className="mb-5" />
            <PopularProductGrid products={products} category={category} />
          </>
        ) : (
          <EmptyState
            title="아직 수집된 상품이 없어요"
            description="다른 살림 분야의 상품을 둘러보세요."
            href="/browse"
          />
        )}
      </section>
    </Container>
  );
}
