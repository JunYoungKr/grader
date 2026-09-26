import snapshotJson from "../content/coupang-bestsellers.json";
import type { PopularProductSnapshot } from "./types";
import { normalizeContentCopy } from "./display-copy";

const snapshot = normalizeContentCopy(snapshotJson as PopularProductSnapshot);

export function getPopularProducts(category: string) {
  return snapshot.categories[category] ?? [];
}

export function getPopularProductsGeneratedAt(): string | null {
  return snapshot.generatedAt || null;
}
