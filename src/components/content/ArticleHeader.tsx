import type { Article, Category, Provider } from "@/lib/types";
import { Breadcrumb } from "../ui/Primitives";
import { DisclosureNote } from "../DisclosureNote";
import { SaveButton } from "../saved/SaveButton";
import { parseUpdated, SITE_NAME } from "@/lib/site";
export function ArticleHeader({
  article,
  category,
  providers,
}: {
  article: Article;
  category?: Category;
  providers: Provider[];
}) {
  return (
    <header>
      <Breadcrumb
        items={[
          {
            label: category?.name ?? "살림 가이드",
            href: category ? `/category/${category.slug}` : "/browse",
          },
          { label: "가이드" },
        ]}
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="badge">
          {article.type === "comparison" ? "구매 가이드" : "살림 노트"}
        </span>
        <SaveButton
          label
          item={{
            id: `article:${article.slug}`,
            kind: "article",
            href: `/${article.slug}`,
            title: article.title,
            imageUrl: article.products?.[0]?.imageUrl,
          }}
        />
      </div>
      <h1 className="mt-5 text-heading font-medium">{article.title}</h1>
      <p className="mt-4 text-lead text-muted">{article.description}</p>
      <p className="mt-4 flex flex-wrap gap-x-4 text-caption text-faint">
        <span>{article.updated} 기준</span>
        <span>작성: {SITE_NAME}</span>
        {parseUpdated(article.modifiedAt) && <span>페이지 수정일: <time dateTime={article.modifiedAt}>{new Date(article.modifiedAt!).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</time></span>}
        {providers.length > 0 && <span>제휴 링크 포함</span>}
      </p>
      {providers.length > 0 && (
        <DisclosureNote providers={providers} className="mt-5" />
      )}
      {!!article.products?.length && (
        <a href="#compare" className="button button-secondary mt-5" data-ga="toc" data-ga-target="compare" data-ga-article={article.slug}>
          {article.products.length > 1 ? `상품 ${article.products.length}개 조건 비교` : "상품 조건과 가격 보기"}
        </a>
      )}
    </header>
  );
}
