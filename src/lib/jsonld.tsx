import type { Article, Category } from "./types";
import { absoluteUrl, CONTACT_EMAIL, SITE_DESCRIPTION, SITE_NAME, parseUpdated } from "./site";
import { serializeJsonLd, SOCIAL_IMAGE } from "./seo";

interface BreadcrumbItem {
  name: string;
  href: string;
}

function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}

export function SiteJsonLd() {
  return <JsonLd data={{
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": absoluteUrl("/#organization"), name: SITE_NAME, url: absoluteUrl(), email: CONTACT_EMAIL, logo: absoluteUrl("/icon.svg") },
      { "@type": "WebSite", "@id": absoluteUrl("/#website"), name: SITE_NAME, url: absoluteUrl(), description: SITE_DESCRIPTION, inLanguage: "ko-KR", publisher: { "@id": absoluteUrl("/#organization") } },
    ],
  }} />;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return <JsonLd data={{
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: absoluteUrl(item.href) })),
  }} />;
}

export function ArticleJsonLd({ article, category }: { article: Article; category?: Category }) {
  const url = absoluteUrl(`/${article.slug}`);
  const products = article.products ?? [];
  const image = products.find((p) => p.imageUrl)?.imageUrl ?? SOCIAL_IMAGE.url;
  return <>
    <JsonLd data={{
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article", "@id": `${url}#article`, url,
          headline: article.title, description: article.description,
          inLanguage: "ko-KR", image: [image],
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          author: { "@type": "Organization", "@id": absoluteUrl("/#organization"), name: SITE_NAME, url: absoluteUrl("/about") },
          publisher: { "@id": absoluteUrl("/#organization") },
          dateModified: parseUpdated(article.modifiedAt)?.toISOString(),
          ...(category ? { articleSection: category.name } : {}),
        },
        ...(products.length ? [{
          "@type": "ItemList", "@id": `${url}#products`, name: article.title,
          numberOfItems: products.length,
          itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name })),
        }] : []),
      ],
    }} />
    <BreadcrumbJsonLd items={[
      { name: "홈", href: "/" },
      ...(category ? [{ name: category.name, href: `/category/${category.slug}` }] : []),
      { name: article.title, href: `/${article.slug}` },
    ]} />
  </>;
}
