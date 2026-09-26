import type { Article } from "./types";
import { categories } from "@/content/categories";
import { supabasePublic } from "./supabase/server";
import { normalizeContentCopy } from "./display-copy";

// 콘텐츠 로더 — 글은 Supabase(articles 테이블), 카테고리는 코드(거의 안 바뀜).
// 어드민(/admin)에서 수정하면 revalidatePath로 즉시 반영된다.
// env 미설정(로컬 초기·CI) 시 빈 목록 폴백 — 빌드는 통과, 화면은 빈 상태 처리.

export interface ArticleRow {
  slug: string;
  category: string;
  type: Article["type"];
  title: string;
  description: string;
  updated: string;
  medical: boolean;
  summary: string[];
  axes: Article["axes"];
  products: Article["products"];
  promo_banner: Article["promoBanner"];
  sections: Article["sections"];
  checklist: Article["checklist"];
  related: Article["related"];
  sources: Article["sources"];
  published: boolean;
  sort_order: number;
}

export function rowToArticle(r: ArticleRow): Article {
  return normalizeContentCopy({
    slug: r.slug,
    category: r.category,
    type: r.type,
    title: r.title,
    description: r.description,
    updated: r.updated,
    medical: r.medical || undefined,
    summary: r.summary ?? [],
    axes: r.axes ?? undefined,
    products: r.products ?? undefined,
    promoBanner: r.promo_banner ?? undefined,
    sections: r.sections ?? undefined,
    checklist: r.checklist ?? undefined,
    related: r.related ?? undefined,
    sources: r.sources ?? undefined,
  });
}

export async function getAllArticles(): Promise<Article[]> {
  const sb = supabasePublic();
  if (!sb) return [];
  const { data, error } = await sb
    .from("articles")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[content] getAllArticles 실패:", error.message);
    return [];
  }
  return (data as ArticleRow[]).map(rowToArticle);
}

export async function getAllArticleSlugs(): Promise<string[]> {
  const sb = supabasePublic();
  if (!sb) return [];
  const { data, error } = await sb.from("articles").select("slug");
  if (error) {
    console.error("[content] getAllArticleSlugs 실패:", error.message);
    return [];
  }
  return (data as { slug: string }[]).map((r) => r.slug);
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  const sb = supabasePublic();
  if (!sb) return undefined;
  const { data, error } = await sb
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("[content] getArticle 실패:", error.message);
    return undefined;
  }
  return data ? rowToArticle(data as ArticleRow) : undefined;
}

export async function getArticlesByCategory(
  categorySlug: string,
): Promise<Article[]> {
  const sb = supabasePublic();
  if (!sb) return [];
  const { data, error } = await sb
    .from("articles")
    .select("*")
    .eq("category", categorySlug)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[content] getArticlesByCategory 실패:", error.message);
    return [];
  }
  return (data as ArticleRow[]).map(rowToArticle);
}

export function getCategories() {
  return categories;
}

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
