import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle, getAllArticleSlugs, getCategory } from "@/lib/content";
import { uniqueProviders } from "@/lib/providers";
import { ArticleJsonLd } from "@/lib/jsonld";
import { Container, SectionHeading } from "@/components/ui/Primitives";
import { ArticleHeader } from "@/components/content/ArticleHeader";
import { ArticleSidebar } from "@/components/content/ArticleSidebar";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { SummaryBox } from "@/components/SummaryBox";
import { TableOfContents } from "@/components/TableOfContents";
import { ComparisonCards } from "@/components/ComparisonCards";
import { ComparisonExplorer } from "@/components/ComparisonExplorer";
import { PromoBanner } from "@/components/PromoBanner";
import { ChecklistTable } from "@/components/ChecklistTable";
import { ViewItemList } from "@/components/ViewItemList";
import { StickyCta } from "@/components/StickyCta";
import { SourceList } from "@/components/SourceList";
import { RelatedLinks } from "@/components/RelatedLinks";
import { RecordView } from "@/components/RecentlyViewed";
import { pageMetadata } from "@/lib/seo";
import { parseUpdated } from "@/lib/site";
export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() {
  return (await getAllArticleSlugs()).map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  return article
    ? pageMetadata({
        title: article.title,
        description: article.description,
        path: `/${article.slug}`,
        type: "article",
        modifiedTime: parseUpdated(article.modifiedAt)?.toISOString(),
      })
    : {};
}
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  const products = article.products ?? [];
  const providers = uniqueProviders([
    ...products.map((p) => p.provider),
    ...(article.promoBanner ? [article.promoBanner.provider] : []),
  ]);
  const featured = products.find((p) => p.recommended) ?? products[0];
  const hasFilters = products.length > 1;
  const toc = [
    { id: "summary", label: "먼저 읽어보세요" },
    ...(article.checklist ? [{ id: "checklist", label: "준비할 것" }] : []),
    ...(products.length ? [{ id: "compare", label: "제품 살펴보기" }] : []),
    ...(article.axes?.length
      ? [{ id: "axes", label: "비교할 때 볼 기준" }]
      : []),
    ...(article.sections ?? []).map((s, i) => ({
      id: `sec-${i}`,
      label: s.heading,
    })),
    ...(article.related?.length ? [{ id: "related", label: "함께 읽기" }] : []),
    ...(article.sources?.length
      ? [{ id: "sources", label: "참고한 자료" }]
      : []),
  ];
  return (
    <Container className={`pt-8 md:py-12 ${products.length ? "pb-40" : "pb-8"}`}>
      <article>
        <ArticleJsonLd article={article} category={getCategory(article.category)} />
        <RecordView slug={slug} title={article.title} />
        <div className="grid items-start gap-10 lg:grid-cols-article">
          <div className="min-w-0">
            <ArticleHeader
              article={article}
              category={getCategory(article.category)}
              providers={providers}
            />
            {article.medical && <MedicalDisclaimer className="mt-6" />}
            <div className="mt-8">
              <SummaryBox items={article.summary} />
            </div>
            <div className="mt-5 lg:hidden">
              <TableOfContents items={toc} article={slug} />
            </div>
            {article.checklist && (
              <section id="checklist" className="section-block">
                <SectionHeading
                  title="시작하기 전에 준비해요"
                  description={article.checklist.caption}
                />
                <ChecklistTable items={article.checklist.items} />
              </section>
            )}
            {products.length > 0 && (
              <section id="compare" className="section-block">
                <SectionHeading
                  title="우리 집에 맞는지 살펴보세요"
                  description="상품별 조건과 조회 가격을 함께 확인해 주세요."
                />
                <ViewItemList
                  key={slug}
                  article={slug}
                  items={products.map((p) => ({
                    id: String(p.coupangProductId ?? p.id),
                    name: p.name,
                    provider: p.provider,
                    grade: p.grade,
                    price: p.priceExample,
                  }))}
                >
                {hasFilters ? (
                  <ComparisonExplorer products={products} article={slug} />
                ) : (
                  <ComparisonCards products={products} article={slug} />
                )}
                </ViewItemList>
                {article.promoBanner && (
                  <PromoBanner banner={article.promoBanner} article={slug} />
                )}
              </section>
            )}
            {!!article.axes?.length && (
              <section id="axes" className="section-block">
                <SectionHeading title="비교할 때 이런 점을 살펴봐요" />
                <dl className="panel divide-y divide-hairline px-6">
                  {article.axes.map((axis) => (
                    <div key={axis.label} className="py-5">
                      <dt className="mb-2 text-body font-medium text-brand">
                        {axis.label}
                      </dt>
                      <dd className="text-body text-muted">{axis.desc}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
            {(article.sections ?? []).map((section, i) => (
              <section
                key={i}
                id={`sec-${i}`}
                className="section-block article-copy"
              >
                <h2 className="mb-5 text-section font-medium">
                  {section.heading}
                </h2>
                {section.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </section>
            ))}
            {!!article.related?.length && (
              <RelatedLinks
                links={article.related}
                title="함께 읽으면 좋은 이야기"
              />
            )}
            {!!article.sources?.length && (
              <SourceList sources={article.sources} />
            )}
          </div>
          <ArticleSidebar toc={toc} product={featured} slug={slug} />
        </div>
        {featured && !hasFilters && (
          <StickyCta product={featured} article={slug} />
        )}
      </article>
    </Container>
  );
}
