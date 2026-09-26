import type { Metadata } from "next";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "./site";

export const SOCIAL_IMAGE = {
  url: absoluteUrl("/og"), width: 1200, height: 630,
  alt: "Grader, 제품 등급 비교",
};

export function pageMetadata({
  title, description = SITE_DESCRIPTION, path, type = "website", modifiedTime,
}: {
  title: string; description?: string; path: string;
  type?: "website" | "article"; modifiedTime?: string;
}): Metadata {
  return {
    title, description,
    alternates: {
      canonical: absoluteUrl(path),
      types: { "application/rss+xml": absoluteUrl("/feed.xml") },
    },
    openGraph: {
      title, description, url: absoluteUrl(path), type,
      locale: "ko_KR", siteName: SITE_NAME, images: [SOCIAL_IMAGE],
      ...(type === "article" && modifiedTime ? { modifiedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images: [SOCIAL_IMAGE] },
  };
}

// JSON-LD는 script 내부이므로 CMS의 '<'를 HTML 종료 태그로 해석하지 않게 한다.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
