import type { Article } from "./types";

export function ArticleJsonLd({ article }: { article: Article }) {
  const hasProducts = !!article.products && article.products.length > 0;

  const data = hasProducts
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: article.title,
        description: article.description,
        itemListElement: article.products!.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.name,
        })),
      }
    : {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.description,
      };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
