import type { Article } from "./types";
import { categories } from "@/content/categories";
import { lowSugarStarterArticle } from "@/content/products/low-sugar-starter";
import { pantsHemClipArticle } from "@/content/products/pants-hem-clip";
import { pepsiZeroLimeArticle } from "@/content/products/pepsi-zero-lime";
import { harimChickenBreastArticle } from "@/content/products/harim-chicken-breast";
import { kelloggsRealGranolaArticle } from "@/content/products/kelloggs-real-granola";
import { mynormalAlluloseArticle } from "@/content/products/mynormal-allulose";

// 글 등록처 — src/content/{products,guides,hubs}/<slug>.ts 작성 후 여기에 import 추가.
// 쿠팡 파트너스 API 발급 후에는 scripts/build-from-coupang.ts로 자동 생성·분류 예정.
const articles: Article[] = [
  lowSugarStarterArticle, // 꾸러미 글 — 아래 식품 4종을 역할 기준으로 한 번에 비교
  pantsHemClipArticle,
  pepsiZeroLimeArticle,
  harimChickenBreastArticle,
  kelloggsRealGranolaArticle,
  mynormalAlluloseArticle,
];

export function getAllArticles(): Article[] {
  return articles;
}

export function getAllArticleSlugs(): string[] {
  return articles.map((a) => a.slug);
}

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticlesByCategory(categorySlug: string): Article[] {
  return articles.filter((a) => a.category === categorySlug);
}

export function getCategories() {
  return categories;
}

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
