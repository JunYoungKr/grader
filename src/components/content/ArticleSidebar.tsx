import type { Product } from "@/lib/types";
import { TableOfContents } from "../TableOfContents";
import { RecentlyViewed } from "../RecentlyViewed";
import { ProductPhoto } from "./ProductPhoto";
import { ProductPrice } from "./ProductMeta";
import { AffiliateButton } from "../AffiliateButton";
export function ArticleSidebar({
  toc,
  product,
  slug,
}: {
  toc: { id: string; label: string }[];
  product?: Product;
  slug: string;
}) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-sticky space-y-5">
        <TableOfContents items={toc} article={slug} />
        {product && (
          <div className="panel space-y-4 p-5">
            <p className="text-caption text-muted">이 글에서 살펴본 제품</p>
            <ProductPhoto compact src={product.imageUrl} alt={product.name} />
            <h2 className="text-body font-semibold">{product.name}</h2>
            <ProductPrice
              price={product.priceExample}
              checkedAt={product.priceCheckedAt}
            />
            <AffiliateButton
              href={product.affiliateUrl}
              provider={product.provider}
              track={{
                article: slug,
                productId: product.coupangProductId ?? product.id,
                product: product.name,
                price: product.priceExample,
                placement: "sidebar_cta",
              }}
            />
          </div>
        )}
        <RecentlyViewed currentSlug={slug} />
      </div>
    </aside>
  );
}
