import type { Article } from "./types";
import { absoluteUrl, SITE_NAME, SITE_DESCRIPTION } from "./site";

export function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (character) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;",
  })[character]!);
}

export function buildFeed(articles: Article[]): string {
  const items = articles.map((article) => {
    const content = [
      `<p>${escapeXml(article.description)}</p>`,
      ...article.summary.map((paragraph) => `<p>${escapeXml(paragraph)}</p>`),
      ...(article.sections ?? []).flatMap((section) => [
        `<h2>${escapeXml(section.heading)}</h2>`,
        ...section.paragraphs.map((paragraph) => `<p>${escapeXml(paragraph)}</p>`),
      ]),
      ...(article.products ?? []).map((product) => `<h2>${escapeXml(product.name)}</h2><p>${escapeXml(product.descriptor)}</p><ul>${product.specs.map((spec) => `<li>${escapeXml(spec.label)}: ${escapeXml(spec.value)}</li>`).join("")}</ul>`),
      `<p><a href="${escapeXml(absoluteUrl(`/${article.slug}`))}">상품 조건과 최신 가격 확인</a></p>`,
    ].join("");
    return `<item><title>${escapeXml(article.title)}</title><link>${escapeXml(absoluteUrl(`/${article.slug}`))}</link><guid isPermaLink="true">${escapeXml(absoluteUrl(`/${article.slug}`))}</guid><description>${escapeXml(article.description)}</description><content:encoded>${escapeXml(content)}</content:encoded></item>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><title>${SITE_NAME}</title><link>${absoluteUrl()}</link><description>${escapeXml(SITE_DESCRIPTION)}</description><language>ko</language><atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
}
