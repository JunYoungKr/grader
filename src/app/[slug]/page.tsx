import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle, getAllArticleSlugs, getCategory } from "@/lib/content";
import { uniqueProviders } from "@/lib/providers";
import { formatPrice } from "@/lib/grade";
import { GradeBadge } from "@/components/GradeBadge";
import { AffiliateButton } from "@/components/AffiliateButton";
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

// DB(ISR) — 어드민 저장 시 revalidatePath로 즉시 갱신. 새 slug도 빌드 없이 서빙.
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
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
  const article = await getArticle(slug);
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
          <h1 className="mt-1 text-3xl font-medium leading-tight tracking-tight">
            {article.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            {article.description}
          </p>
          <p className="mt-2 text-xs text-faint">
            {article.updated} 기준{providers.length > 0 && " · 제휴 링크 포함"}
          </p>
          {providers.length > 0 && (
            <DisclosureNote providers={providers} className="mt-3 max-w-3xl" />
          )}

          {article.type === "comparison" && (
            <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline">
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
              <h2 className="text-lg font-medium">품목별 권장 수량</h2>
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
                    id: String(p.coupangProductId ?? p.id),
                    name: p.name,
                    provider: p.provider,
                    grade: p.grade,
                    price: p.priceExample,
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
                  <h2 className="text-lg font-medium">평가 기준</h2>
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
              <h2 className="text-lg font-medium">{s.heading}</h2>
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

        </div>

        {/* 데스크톱: 우측 sticky 사이드바 — 목차 + 1순위 추천 + 최근 본 제품 */}
        <aside className="hidden lg:block">
          <div className="sticky top-[76px] space-y-4">
            <TableOfContents items={toc} article={slug} />
            {article.type === "comparison" && recommended && (
              <div className="rounded-lg border border-hairline bg-paper p-4">
                <p className="text-xs font-medium tracking-[0.04em] text-faint">
                  1순위 추천
                </p>
                <div className="mt-2.5 flex items-center gap-2.5">
                  <GradeBadge grade={recommended.grade} />
                  <span className="min-w-0 truncate text-sm font-medium">
                    {recommended.name}
                  </span>
                </div>
                <p className="mt-2 text-lg font-medium tabular-nums">
                  {formatPrice(recommended.priceExample)}
                </p>
                <div className="mt-3">
                  <AffiliateButton
                    href={recommended.affiliateUrl}
                    provider={recommended.provider}
                    track={{
                      article: slug,
                      product: recommended.name,
                      grade: recommended.grade,
                      placement: "sidebar_cta",
                      recommended: true,
                    }}
                  />
                </div>
              </div>
            )}
            <RecentlyViewed currentSlug={slug} />
          </div>
        </aside>
      </div>

      {article.type === "comparison" && recommended && !hasAttributes && (
        <StickyCta product={recommended} article={slug} />
      )}
    </article>
  );
}
