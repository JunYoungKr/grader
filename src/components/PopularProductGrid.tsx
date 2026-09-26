import type { PopularProduct } from "@/lib/types";
import { AffiliateButton } from "./AffiliateButton";
import { ViewItemList } from "./ViewItemList";
import { SaveButton } from "./saved/SaveButton";
import { ProductPhoto } from "./content/ProductPhoto";
import { ProductPrice, DeliveryTags } from "./content/ProductMeta";
function PopularProductCard({
  product,
  listId,
  category,
}: {
  product: PopularProduct;
  listId: string;
  category: string;
}) {
  return (
    <article className="flex h-full flex-col">
      <div className="relative">
        <ProductPhoto src={product.imageUrl} alt={product.name} />
        <div className="absolute right-2 top-2">
          <SaveButton
            item={{
              id: `product:${product.coupangProductId}:${product.id}`,
              title: product.name,
              href: product.affiliateUrl,
              kind: "product",
              imageUrl: product.imageUrl,
              price: product.price,
              priceCheckedAt: product.priceCheckedAt,
              category,
              provider: "coupang",
              productId: product.coupangProductId,
              article: listId,
            }}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 pt-4">
        <p className="text-caption text-muted">
          {product.sourceCategoryLabel}
        </p>
        <h3 className="line-clamp-2 text-body font-medium leading-relaxed">
          {product.name}
        </h3>
        <DeliveryTags rocket={product.isRocket} free={product.isFreeShipping} />
        <div className="mt-auto pt-2">
          <ProductPrice
            price={product.price}
            checkedAt={product.priceCheckedAt}
          />
        </div>
        <AffiliateButton
          href={product.affiliateUrl}
          provider="coupang"
          primary={false}
          label="쿠팡에서 확인"
          track={{
            article: listId,
            productId: product.coupangProductId,
            product: product.name,
            category,
            price: product.price,
            placement: "popular_products",
          }}
        />
      </div>
    </article>
  );
}
export function PopularProductGrid({
  products,
  category,
}: {
  products: PopularProduct[];
  category: string;
}) {
  const listId = `category-${category}-popular`;
  return (
    <>
      <ViewItemList
        key={`${listId}:${products.map((p) => p.id).join(",")}`}
        article={listId}
        items={products.map((p) => ({
          id: String(p.coupangProductId),
          name: p.name,
          provider: "coupang" as const,
          category,
          price: p.price,
        }))}
      >
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.id}>
            <PopularProductCard
              product={product}
              listId={listId}
              category={category}
            />
          </li>
        ))}
      </ul>
      </ViewItemList>
    </>
  );
}
