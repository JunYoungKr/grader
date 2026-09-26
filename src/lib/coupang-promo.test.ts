import { describe, expect, it } from "vitest";
import { collectPromoCandidates, toPromoCandidate } from "./coupang-promo";
import type { CoupangProduct } from "./coupang";

function product(id: number, name = "길이조절 서랍 칸막이 정리함"): CoupangProduct {
  return {
    productId: id,
    productName: name,
    productPrice: 12900,
    productImage: "https://t1.coupangcdn.com/example.jpg",
    productUrl: `https://link.coupang.com/re/AFFSDP?lptag=test&pageKey=${id}&itemId=301`,
    categoryName: "생활용품",
    isRocket: true,
  };
}

describe("promotion candidate collection", () => {
  it("keeps the exact affiliate option and merges discovery sources", async () => {
    const candidates = await collectPromoCandidates(
      async () => [product(12)],
      async (keyword) => keyword === "길이조절 서랍 칸막이" ? [product(12)] : [],
      new Date("2026-09-27T00:00:00Z"),
    );
    expect(candidates).toHaveLength(1);
    expect(candidates[0].productKey).toBe("12:301");
    expect(candidates[0].sources).toEqual(["goldbox", "search:길이조절 서랍 칸막이"]);
    expect(candidates[0].checkedAt).toBe("2026-09-27T00:00:00.000Z");
  });

  it("rejects unrelated ads, invalid prices, and mismatched tracking links", async () => {
    const candidates = await collectPromoCandidates(
      async () => [
        { ...product(12), productPrice: -1 },
        { ...product(13), productUrl: "https://example.com/product" },
      ],
      async (keyword) => keyword === "길이조절 서랍 칸막이" ? [
        product(14, "브랜드 식기세척기"),
        product(16, "평범한 서랍 칸막이"),
        product(15),
      ] : [],
    );
    expect(candidates.map((candidate) => candidate.productId)).toEqual([15]);
    expect(toPromoCandidate({ ...product(16), categoryName: "패션의류" }, "goldbox", "now")).toBeNull();
    expect(toPromoCandidate({ ...product(17), productUrl: product(18).productUrl }, "goldbox", "now")).toBeNull();
  });

  it("accepts official search image URLs and keeps one option per product", async () => {
    const first = {
      ...product(20),
      productImage: "https://ads-partners.coupang.com/image1",
    };
    const second = {
      ...first,
      productUrl: first.productUrl.replace("itemId=301", "itemId=302"),
    };
    const candidates = await collectPromoCandidates(
      async () => [],
      async (keyword) => keyword === "길이조절 서랍 칸막이" ? [first, second] : [],
    );
    expect(candidates).toHaveLength(1);
    expect(candidates[0].productKey).toBe("20:301");
  });

  it("keeps only products with the specific household feature in a search topic", async () => {
    const candidates = await collectPromoCandidates(
      async () => [],
      async (keyword) => keyword === "벽걸이 접이식 빨래 바구니" ? [
        product(30, "접이식 빨래 바구니"),
        product(31, "벽걸이 접이식 빨래 바구니"),
      ] : [],
    );
    expect(candidates.map((candidate) => candidate.productId)).toEqual([31]);
  });
});
