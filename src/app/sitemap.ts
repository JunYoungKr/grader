import type { MetadataRoute } from "next";
import { getAllArticles, getCategories } from "@/lib/content";
import { SITE_URL, parseUpdated } from "@/lib/site";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/browse`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryUrls: MetadataRoute.Sitemap = getCategories().map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const articles = await getAllArticles();
  const articleUrls: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/${a.slug}`,
    lastModified: parseUpdated(a.modifiedAt),
    changeFrequency: "weekly",
    priority: a.type === "hub" ? 0.9 : 0.8,
  }));

  return [...home, ...categoryUrls, ...articleUrls];
}
