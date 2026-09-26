import { categories } from "../content/categories";
import {
  COUPANG_ALLOWED_CATEGORY_NAMES,
  COUPANG_CATEGORY_SOURCES,
} from "./coupang-categories";
import { getBestCategoryProducts, type CoupangProduct } from "./coupang";
import type { PopularProductSnapshot } from "./types";

type FetchProducts = typeof getBestCategoryProducts;
export const COUPANG_SYNC_JOB = "coupang-products-daily-0900-kst";
export const COUPANG_SNAPSHOT_NAME = "coupang-bestsellers";
export const COUPANG_CACHE_TAG = "coupang-products";

export function normalizeProductName(name: string): string {
  return name.toLowerCase().replace(/[^0-9a-z가-힣]/g, "");
}

function usableProduct(product: CoupangProduct): boolean {
  try {
    const image = new URL(product.productImage);
    const link = new URL(product.productUrl);
    return (
      Number.isSafeInteger(product.productId) &&
      product.productId > 0 &&
      Boolean(normalizeProductName(product.productName)) &&
      Number.isFinite(product.productPrice) &&
      product.productPrice > 0 &&
      ["http:", "https:"].includes(image.protocol) &&
      image.hostname.endsWith(".coupangcdn.com") &&
      link.protocol === "https:" &&
      link.hostname === "link.coupang.com" &&
      Boolean(link.searchParams.get("lptag")) &&
      link.searchParams.get("pageKey") === String(product.productId)
    );
  } catch {
    return false;
  }
}

// Build the entire snapshot before publishing it. A partial API failure keeps the last good data.
export async function collectCoupangSnapshot(
  fetchProducts: FetchProducts = getBestCategoryProducts,
  now = new Date(),
): Promise<PopularProductSnapshot> {
  const snapshot: PopularProductSnapshot = {
    generatedAt: now.toISOString(),
    categories: {},
  };
  const checkedAt = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const seenIds = new Set<number>();
  const seenNames = new Set<string>();
  for (const category of categories) {
    const sources = COUPANG_CATEGORY_SOURCES[category.slug];
    const allowed = COUPANG_ALLOWED_CATEGORY_NAMES[category.slug];
    if (!sources?.length || !allowed?.length)
      throw new Error(`Unknown category: ${category.slug}`);
    const batches = [];
    // Sequential calls avoid bursting the partner API.
    for (const source of sources) {
      const products = await fetchProducts(source.id, 100, {
        imageSize: "512x512",
      });
      batches.push(
        products
          .filter((p) => usableProduct(p) && allowed.includes(p.categoryName))
          .map((product) => ({ product, source })),
      );
    }
    const selected = [];
    const length = Math.max(...batches.map((batch) => batch.length));
    for (let index = 0; index < length && selected.length < 20; index++) {
      for (const batch of batches) {
        const item = batch[index];
        if (!item) continue;
        const name = normalizeProductName(item.product.productName);
        if (seenIds.has(item.product.productId) || seenNames.has(name))
          continue;
        seenIds.add(item.product.productId);
        seenNames.add(name);
        selected.push(item);
        if (selected.length === 20) break;
      }
    }
    if (selected.length < 20)
      throw new Error(
        `${category.slug}: only ${selected.length} valid unique products (20 required)`,
      );
    snapshot.categories[category.slug] = selected.map(
      ({ product, source }, index) => ({
        id: `${category.slug}-${product.productId}-${index + 1}`,
        coupangProductId: product.productId,
        name: product.productName,
        imageUrl: product.productImage.replace(/^http:\/\//, "https://"),
        price: product.productPrice,
        priceCheckedAt: checkedAt,
        affiliateUrl: product.productUrl,
        isRocket: Boolean(product.isRocket),
        isFreeShipping: Boolean(product.isFreeShipping),
        categoryName: product.categoryName,
        sourceCategoryId: source.id,
        sourceCategoryLabel: source.label,
        position: index + 1,
      }),
    );
  }
  return snapshot;
}
