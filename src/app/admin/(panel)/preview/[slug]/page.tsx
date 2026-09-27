import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/server";
import { rowToArticle, type ArticleRow } from "@/lib/content";
import { SummaryBox } from "@/components/SummaryBox";
import { ComparisonCards } from "@/components/ComparisonCards";
import { ArticleSection } from "@/components/content/ArticleSection";
import { SourceList } from "@/components/SourceList";
import { DisclosureNote } from "@/components/DisclosureNote";
import { uniqueProviders } from "@/lib/providers";

export const metadata: Metadata = {
  title: "비공개 글 미리보기",
  robots: { index: false, follow: false },
};

export default async function AdminArticlePreview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await supabaseAdmin()
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`초안을 불러오지 못했습니다: ${error.message}`);
  if (!data) notFound();

  const article = rowToArticle(data as ArticleRow);
  const products = article.products ?? [];
  const providers = uniqueProviders(products.map((product) => product.provider));

  return (
    <article className="mx-auto max-w-3xl pb-16">
      <div className="panel border-brand p-5">
        <p className="text-small font-medium text-brand">
          {data.published ? "공개 글 검수 화면" : "비공개 초안 검수 화면"}
        </p>
        <p className="mt-2 text-body text-muted">
          이 화면은 관리자만 볼 수 있습니다. 저장과 공개 설정은 편집 화면에서 변경하세요.
        </p>
        <Link
          href={`/admin/edit/${slug}`}
          className="mt-3 inline-block text-small font-medium text-brand underline"
        >
          편집 화면으로 돌아가기
        </Link>
      </div>

      <header className="mt-8">
        <h1 className="text-heading font-semibold">{article.title}</h1>
        <p className="mt-4 text-reading text-ink">{article.description}</p>
        <p className="mt-3 text-caption text-muted">{article.updated} 기준</p>
        {providers.length > 0 && (
          <DisclosureNote providers={providers} className="mt-4" />
        )}
      </header>

      <div className="mt-8">
        <SummaryBox items={article.summary} />
      </div>

      {products.length > 0 && (
        <section className="section-block">
          <h2 className="mb-5 text-section font-semibold">상품 조건과 조회 가격</h2>
          <ComparisonCards products={products} article={slug} />
        </section>
      )}

      {(article.sections ?? []).map((section, index) => (
        <ArticleSection
          key={index}
          id={`section-${index}`}
          heading={section.heading}
          paragraphs={section.paragraphs}
        />
      ))}

      {!!article.sources?.length && <SourceList sources={article.sources} />}
    </article>
  );
}
