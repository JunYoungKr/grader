import type { Article, Category, Provider } from "@/lib/types";
import { Breadcrumb } from "../ui/Primitives";
import { DisclosureNote } from "../DisclosureNote";
import { SaveButton } from "../saved/SaveButton";
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
      <h1 className="mt-5 text-heading font-semibold">{article.title}</h1>
      <p className="mt-5 max-w-prose text-reading text-ink">
        {article.description}
      </p>
      <p className="mt-4 flex flex-wrap gap-x-4 text-caption text-faint">
        <span>{article.updated} 기준</span>
        {providers.length > 0 && <span>제휴 링크 포함</span>}
      </p>
      {providers.length > 0 && (
        <DisclosureNote providers={providers} className="mt-5" />
      )}
    </header>
  );
}
