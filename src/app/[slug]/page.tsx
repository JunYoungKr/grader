import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle, getAllArticleSlugs, getCategory } from "@/lib/content";
import { uniqueProviders } from "@/lib/providers";
import { MethodologyStrip } from "@/components/MethodologyStrip";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { SummaryBox } from "@/components/SummaryBox";
import { TableOfContents } from "@/components/TableOfContents";
import { MetricCard } from "@/components/MetricCard";
import { ComparisonCards } from "@/components/ComparisonCards";
import { ComparisonTable } from "@/components/ComparisonTable";
import { ComparisonExplorer } from "@/components/ComparisonExplorer";
import { PromoBanner } from "@/components/PromoBanner";
import { ChecklistTable } from "@/components/ChecklistTable";
import { ViewItemList } from "@/components/ViewItemList";
import { StickyCta } from "@/components/StickyCta";
import { SourceList } from "@/components/SourceList";
import { RelatedLinks } from "@/components/RelatedLinks";
import { DisclosureNote } from "@/components/DisclosureNote";
import { RecordView, RecentlyViewed } from "@/components/RecentlyViewed";
import { ArticleJsonLd } from "@/lib/jsonld";

export function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const category = getCategory(article.category);
  const products = article.products ?? [];
  const providers = uniqueProviders(products.map((p) => p.provider));
  const recommended = products.find((p) => p.recommended) ?? products[0];
  const hasAttributes = products.some((p) => p.attributes);

  const toc: { id: string; label: string }[] = [
    { id: "summary", label: "한눈에 요약" },
  ];
  if (article.checklist) toc.push({ id: "checklist", label: "품목별 수량" });
  if (article.type === "comparison") {
    toc.push({ id: "compare", label: "제품 비교" });
    if (article.axes?.length) toc.push({ id: "axes", label: "평가 기준" });
  }
  (article.sections ?? []).forEach((s, i) =>
    toc.push({ id: `sec-${i}`, label: s.heading }),
  );
  if (article.related?.length) toc.push({ id: "related", label: "관련 글" });
  if (article.sources?.length) toc.push({ id: "sources", label: "출처" });

  return (
    <article className="mx-auto max-w-content px-5 pb-24 pt-10 md:pb-12">
      <ArticleJsonLd article={article} />
      <RecordView slug={slug} title={article.title} />

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10">
        <div className="min-w-0">
          <MethodologyStrip />
          {category && <p className="mt-3 text-sm text-muted">{category.name}</p>}
          <h1 className="mt-1 text-3xl font-semibold leading-tight tracking-tight">
            {article.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            {article.description}
          </p>

          {article.type === "comparison" && (
            <div className="mt-6 grid grid-cols-3 gap-3">
              <MetricCard label="비교 제품" value={`${products.length}종`} />
              <MetricCard label="평가 축" value={`${article.axes?.length ?? 0}개`} />
              <MetricCard label="갱신" value={article.updated} />
            </div>
          )}

          {article.medical && <MedicalDisclaimer className="mt-6" />}

          <div className="mt-6">
            <SummaryBox items={article.summary} />
          </div>

          {/* 모바일: 인라인 목차 (데스크톱은 우측 sticky 사이드바) */}
          <div className="mt-4 lg:hidden">
            <TableOfContents items={toc} article={slug} />
          </div>

          {article.checklist && (
            <section id="checklist" className="mt-10 scroll-mt-24">
              <h2 className="text-lg font-semibold">품목별 권장 수량</h2>
              <div className="mt-3">
                <ChecklistTable items={article.checklist.items} />
              </div>
            </section>
          )}

          {article.type === "comparison" && (
            <>
              <section id="compare" className="mt-10 scroll-mt-24">
                <ViewItemList
                  article={slug}
                  items={products.map((p) => ({
                    id: p.id,
                    name: p.name,
                    provider: p.provider,
                    grade: p.grade,
                  }))}
                />
                {hasAttributes ? (
                  <ComparisonExplorer products={products} article={slug} />
                ) : (
                  <>
                    <div className="hidden md:block">
                      <ComparisonTable products={products} article={slug} />
                    </div>
                    <div className="md:hidden">
                      <ComparisonCards products={products} article={slug} />
                    </div>
                  </>
                )}
                {article.promoBanner && (
                  <PromoBanner banner={article.promoBanner} article={slug} />
                )}
              </section>

              {article.axes?.length ? (
                <section id="axes" className="mt-12 scroll-mt-24">
                  <h2 className="text-lg font-semibold">평가 기준</h2>
                  <dl className="mt-3 divide-y divide-hairline border-y border-hairline">
                    {article.axes.map((a) => (
                      <div key={a.label} className="flex gap-4 py-3">
                        <dt className="w-24 shrink-0 font-medium">{a.label}</dt>
                        <dd className="text-[15px] leading-relaxed text-muted">
                          {a.desc}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ) : null}
            </>
          )}

          {(article.sections ?? []).map((s, i) => (
            <section key={i} id={`sec-${i}`} className="mt-12 scroll-mt-24">
              <h2 className="text-lg font-semibold">{s.heading}</h2>
              {s.paragraphs.map((p, j) => (
                <p key={j} className="mt-3 text-[15px] leading-relaxed">
                  {p}
                </p>
              ))}
            </section>
          ))}

          {article.related?.length ? (
            <RelatedLinks links={article.related} />
          ) : null}

          {article.sources?.length ? (
            <SourceList sources={article.sources} />
          ) : null}

          {providers.length > 0 && (
            <DisclosureNote providers={providers} className="mt-12" />
          )}
        </div>

        {/* 데스크톱: 우측 sticky 사이드바 — 목차 + 최근 본 제품 */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-6">
            <TableOfContents items={toc} article={slug} />
            <RecentlyViewed currentSlug={slug} />
          </div>
        </aside>
      </div>

      {article.type === "comparison" && recommended && (
        <StickyCta product={recommended} article={slug} />
      )}
    </article>
  );
}
