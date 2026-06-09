import type { MetadataRoute } from "next";
import { getAllArticles, getCategories } from "@/lib/content";
import { SITE_URL, parseUpdated } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const home: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
  ];

  const categoryUrls: MetadataRoute.Sitemap = getCategories().map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const articleUrls: MetadataRoute.Sitemap = getAllArticles().map((a) => ({
    url: `${SITE_URL}/${a.slug}`,
    lastModified: parseUpdated(a.updated),
    changeFrequency: "weekly",
    priority: a.type === "hub" ? 0.9 : 0.8,
  }));

  return [...home, ...categoryUrls, ...articleUrls];
}
