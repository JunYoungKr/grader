import Link from "next/link";
import type { Article } from "@/lib/types";
import { ProductPhoto } from "./ProductPhoto";
import { SaveButton } from "../saved/SaveButton";
const LABELS = {
  comparison: "구매 가이드",
  guide: "살림 가이드",
  hub: "모아보기",
};
export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="flex h-full flex-col">
      <div className="relative">
        <Link href={`/${article.slug}`} tabIndex={-1} aria-hidden="true">
          <ProductPhoto src={article.products?.[0]?.imageUrl} alt="" />
        </Link>
        <div className="absolute right-2 top-2">
          <SaveButton
            item={{
              id: `article:${article.slug}`,
              title: article.title,
              href: `/${article.slug}`,
              kind: "article",
              imageUrl: article.products?.[0]?.imageUrl,
            }}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <p className="flex flex-wrap gap-x-3 text-caption text-muted">
          <span>{LABELS[article.type]}</span>
          <time dateTime={article.updated}>{article.updated}</time>
        </p>
        <h3 className="mt-2 text-title font-medium">
          <Link href={`/${article.slug}`} className="hover:text-brand">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-small text-muted">
          {article.description}
        </p>
        <Link href={`/${article.slug}`} className="text-link mt-auto pt-4">
          가이드 읽기
        </Link>
      </div>
    </article>
  );
}
