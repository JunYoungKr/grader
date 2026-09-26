import { getGoldboxProducts, searchProducts, type CoupangProduct } from "./coupang";
import { normalizeDisplayText } from "./display-copy";

const HOUSEHOLD_CATEGORIES = new Set([
  "생활용품", "주방용품", "가구/홈인테리어", "가전디지털",
]);

export const DISCOVERY_TOPICS = [
  {
    keyword: "냉장고 자동 음료 디스펜서",
    match: /(?=.*(?:자동|롤링|슬라이드))(?=.*(?:음료|캔))(?=.*(?:디스펜서|보관함|정리대|트레이))/i,
  },
  {
    keyword: "벽걸이 접이식 빨래 바구니",
    match: /(?=.*(?:벽걸이|벽부착|부착형|틈새걸이|문걸이))(?=.*(?:접이식|폴딩|접는))(?=.*(?:빨래|세탁|바구니))/,
  },
  {
    keyword: "자석 틈새 선반",
    match: /(?=.*(?:자석|마그네틱))(?=.*(?:틈새|사이드|슬림))(?=.*(?:선반|정리대|수납))/,
  },
  {
    keyword: "V자 틈새 청소솔",
    match: /(?=.*(?:v자|v형|v컷))(?=.*(?:틈새|청소솔|브러시|브러쉬))/i,
  },
  {
    keyword: "길이조절 서랍 칸막이",
    match: /(?=.*서랍)(?=.*(?:길이조절|조절|확장형))(?=.*(?:칸막이|파티션))/,
  },
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
