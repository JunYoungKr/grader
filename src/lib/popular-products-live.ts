import fallback from "../content/coupang-bestsellers.json";
import { categories } from "../content/categories";
import type { PopularProductSnapshot } from "./types";

export function isValidProductSnapshot(
  value: unknown,
): value is PopularProductSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as PopularProductSnapshot;
  if (
    typeof snapshot.generatedAt !== "string" ||
    !Number.isFinite(Date.parse(snapshot.generatedAt)) ||
    !snapshot.categories ||
    typeof snapshot.categories !== "object"
  )
    return false;
  const seen = new Set<number>();
  return categories.every((category) => {
    const products = snapshot.categories[category.slug];
    return (
      Array.isArray(products) &&
      products.length === 20 &&
      products.every((product) => {
        if (
          !product ||
          !Number.isSafeInteger(product.coupangProductId) ||
          product.coupangProductId <= 0 ||
          seen.has(product.coupangProductId)
        )
          return false;
        seen.add(product.coupangProductId);
        return (
          typeof product.id === "string" &&
          typeof product.name === "string" &&
          product.name.trim().length > 0 &&
          Number.isFinite(product.price) &&
          product.price > 0 &&
          typeof product.imageUrl === "string" &&
          typeof product.affiliateUrl === "string" &&
          product.affiliateUrl.startsWith("https://link.coupang.com/") &&
          typeof product.priceCheckedAt === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(product.priceCheckedAt) &&
          typeof product.sourceCategoryLabel === "string"
        );
      })
    );
  });
}

export async function getCurrentPopularSnapshot(): Promise<PopularProductSnapshot> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      const response = await fetch(
        `${url}/rest/v1/coupang_product_snapshots?name=eq.coupang-bestsellers&select=payload&limit=1`,
        {
          headers: { apikey: key, Authorization: `Bearer ${key}` },
          next: { revalidate: 300, tags: ["coupang-products"] },
          signal: AbortSignal.timeout(5000),
        },
      );
      if (!response.ok)
        throw new Error(`Snapshot read failed: ${response.status}`);
      const rows = await response.json();
      if (isValidProductSnapshot(rows?.[0]?.payload)) return rows[0].payload;
      console.warn(
        "[coupang-products] No valid DB snapshot; using bundled fallback",
      );
    } catch (error) {
      console.error(
        "[coupang-products]",
        error instanceof Error ? error.message : "Read failed",
      );
    }
  }
  return fallback as PopularProductSnapshot;
}

export async function getCurrentPopularProducts(category: string) {
  return (await getCurrentPopularSnapshot()).categories[category] ?? [];
}
