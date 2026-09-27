import Link from "next/link";
import type { Article } from "@/lib/types";
import { SectionHeading } from "../ui/Primitives";
import { ArticleCard } from "../content/ArticleCard";
import { BuyingChecklist } from "../content/BuyingChecklist";

export function GuideSection({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;
  return (
    <section className="section-block">
      <SectionHeading
        title="최근 살림 가이드"
        href="/browse#guides"
        linkLabel="글 더 보기"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.slice(0, 3).map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}

export function ChecklistSection() {
  return (
    <section className="section-block border-t border-hairline pt-8">
      <SectionHeading
        title="구매 전 확인"
        href="/about#criteria"
        linkLabel="작성 기준"
      />
      <BuyingChecklist />
    </section>
  );
}

export function SavedCollectionBanner() {
  return (
    <section className="section-block flex flex-col items-start justify-between gap-4 border-t border-hairline pt-8 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-title font-medium">저장한 글과 상품</h2>
        <p className="mt-2 text-small text-muted">
          저장 버튼을 누르면 이 브라우저에서 다시 볼 수 있어요.
        </p>
      </div>
      <Link href="/saved" className="text-link shrink-0">
        저장 목록 보기
      </Link>
    </section>
  );
}
