import { getGoldboxProducts, searchProducts, type CoupangProduct } from "./coupang";
import { normalizeDisplayText } from "./display-copy";

const HOUSEHOLD_CATEGORIES = new Set([
  "생활용품", "주방용품", "가구/홈인테리어", "가전디지털",
]);

export const DISCOVERY_TOPICS = [
  { keyword: "서랍 칸막이", match: /칸막이|서랍.*분리|분리.*서랍|서랍.*파티션/ },
  { keyword: "냉장고 회전 트레이", match: /회전.*트레이|회전.*정리|턴테이블/ },
  { keyword: "싱크대 틈새 선반", match: /틈새.*선반|좁은.*선반/ },
  { keyword: "욕실 청소 브러시", match: /(욕실|화장실|틈새|타일).*?(브러시|브러쉬|청소솔)|전동.*?(브러시|브러쉬)/ },
  { keyword: "접이식 빨래 바구니", match: /(접이식|접는).*?(빨래|세탁).*?바구니|(접이식|접는).*?바구니/ },
] as const;

export type PromoCandidate = {
  productKey: string;
  productId: number;
  itemId: string;
  name: string;
  price: number;
  imageUrl: string;
  affiliateUrl: string;
  categoryName: string;
  isRocket: boolean;
  isFreeShipping: boolean;
  sources: string[];
  checkedAt: string;
};

export function toPromoCandidate(
  product: CoupangProduct,
  source: string,
  checkedAt: string,
): PromoCandidate | null {
  try {
    const image = new URL(product.productImage);
    const link = new URL(product.productUrl);
    if (
      !Number.isSafeInteger(product.productId) || product.productId < 1 ||
      !product.productName.trim() ||
      !Number.isFinite(product.productPrice) || product.productPrice <= 0 ||
      product.productPrice > 2_147_483_647 ||
      !HOUSEHOLD_CATEGORIES.has(product.categoryName) ||
      !["http:", "https:"].includes(image.protocol) ||
      !(
        image.hostname.endsWith(".coupangcdn.com") ||
        image.hostname === "ads-partners.coupang.com"
      ) ||
      link.protocol !== "https:" || link.hostname !== "link.coupang.com" ||
      !link.searchParams.get("lptag") ||
      link.searchParams.get("pageKey") !== String(product.productId)
    ) return null;

    const itemId = link.searchParams.get("itemId") ?? "";
    if (itemId && !/^\d+$/.test(itemId)) return null;
    return {
      productKey: `${product.productId}:${itemId || "base"}`,
      productId: product.productId,
      itemId,
      name: normalizeDisplayText(product.productName.trim()),
      price: Math.round(product.productPrice),
      imageUrl: image.toString().replace(/^http:\/\//, "https://"),
      affiliateUrl: link.toString(),
      categoryName: normalizeDisplayText(product.categoryName),
      isRocket: Boolean(product.isRocket),
      isFreeShipping: Boolean(product.isFreeShipping),
      sources: [source],
      checkedAt,
    };
  } catch {
    return null;
  }
}

type GoldboxFetcher = typeof getGoldboxProducts;
type SearchFetcher = typeof searchProducts;

export async function collectPromoCandidates(
  fetchGoldbox: GoldboxFetcher = getGoldboxProducts,
  fetchSearch: SearchFetcher = searchProducts,
  now = new Date(),
): Promise<PromoCandidate[]> {
  const checkedAt = now.toISOString();
  const found = new Map<string, PromoCandidate>();
  const chosenOption = new Map<number, string>();
  function add(products: CoupangProduct[], source: string, match?: RegExp) {
    for (const product of products) {
      if (match && !match.test(product.productName)) continue;
      const candidate = toPromoCandidate(product, source, checkedAt);
      if (!candidate) continue;
      const selectedKey = chosenOption.get(candidate.productId);
      if (selectedKey && selectedKey !== candidate.productKey) continue;
      chosenOption.set(candidate.productId, candidate.productKey);
      const existing = found.get(candidate.productKey);
      if (existing) {
        if (!existing.sources.includes(source)) existing.sources.push(source);
      } else {
        found.set(candidate.productKey, candidate);
      }
    }
  }

  add(await fetchGoldbox({ imageSize: "512x512" }), "goldbox");
  for (const topic of DISCOVERY_TOPICS) {
    const products = await fetchSearch(topic.keyword, 10, { imageSize: "512x512" });
    add(products, `search:${topic.keyword}`, topic.match);
  }
  return [...found.values()];
}
