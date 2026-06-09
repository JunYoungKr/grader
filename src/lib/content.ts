import type { Article } from "./types";
import { categories } from "@/content/categories";
import { strollerArticle } from "@/content/products/stroller";
import { lotionArticle } from "@/content/products/lotion";
import { newbornDiaperArticle } from "@/content/products/newborn-diaper";
import { newbornPrepQuantityGuide } from "@/content/guides/newborn-prep-quantity";
import { kcCertificationGuide } from "@/content/guides/kc-certification";
import { newbornEssentialsHub } from "@/content/hubs/newborn-essentials";

const articles: Article[] = [
  strollerArticle,
  lotionArticle,
  newbornDiaperArticle,
  newbornPrepQuantityGuide,
  kcCertificationGuide,
  newbornEssentialsHub,
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
