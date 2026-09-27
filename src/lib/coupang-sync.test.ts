import { afterEach, describe, expect, it, vi } from "vitest";
import { collectCoupangSnapshot } from "./coupang-sync";
import { isCoupangSyncAuthorized } from "./coupang-sync-auth";
import {
  getCurrentPopularSnapshot,
  isValidProductSnapshot,
} from "./popular-products-live";
import type { CoupangProduct, CoupangProductQuery } from "./coupang";

const names: Record<number, string> = {
  1011: "출산/유아",
  1013: "주방용품",
  1014: "생활용품",
  1016: "가전디지털",
  1012: "식품",
  1010: "뷰티",
  1017: "스포츠/레저용품",
};
function products(category: number): CoupangProduct[] {
  return Array.from({ length: 25 }, (_, index) => {
    const id = category * 100 + index;
    return {
      productId: id,
      productName: `상품 ${id}`,
      productPrice: 1000,
      productImage: "https://t1.coupangcdn.com/product.jpg",
      productUrl: `https://link.coupang.com/re/AFFSDP?lptag=test&pageKey=${id}`,
      categoryName: names[category],
      isRocket: false,
    };
  });
}
const fetchProducts = async (category: number) => products(category);
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("daily Coupang refresh", () => {
  it("uses the registered channel ID for every product link request", async () => {
    vi.stubEnv("COUPANG_SUB_ID", "graderco2026");
    const fetch = vi.fn(
      async (
        category: number,
        _limit = 20,
        _options: CoupangProductQuery = {},
      ) =>
        products(category),
    );
    await collectCoupangSnapshot(fetch);
    expect(fetch).toHaveBeenCalled();
    expect(fetch.mock.calls.every((call) => call[2]?.subId === "graderco2026")).toBe(true);
  });

  it("keeps 20 unique validated products per category and uses Korean dates", async () => {
    const snapshot = await collectCoupangSnapshot(async (category) => {
      const list = products(category);
      return [list[0], list[0], { ...list[0], productPrice: -1 }, ...list];
    }, new Date("2026-09-26T15:00:00Z"));
    const all = Object.values(snapshot.categories).flat();
    expect(all).toHaveLength(120);
    expect(new Set(all.map((p) => p.coupangProductId)).size).toBe(120);
    expect(all.every((p) => p.priceCheckedAt === "2026-09-27")).toBe(true);
    expect(
      snapshot.categories["daily-life"]
        .slice(0, 4)
        .map((p) => p.sourceCategoryId),
    ).toEqual([1013, 1014, 1013, 1014]);
    expect(isValidProductSnapshot(snapshot)).toBe(true);
  });

  it("drops duplicate names, foreign categories, and invalid affiliate links", async () => {
    const snapshot = await collectCoupangSnapshot(async (category) => {
      const list = products(category);
      return [
        { ...list[0], productUrl: "https://example.com" },
        { ...list[1], categoryName: "wrong" },
        list[0],
        { ...list[1], productName: list[0].productName.replace(" ", "-") },
        ...list.slice(2),
      ];
    });
    expect(
      Object.values(snapshot.categories).every((list) => list.length === 20),
    ).toBe(true);
    expect(snapshot.categories.baby[1].coupangProductId).toBe(101102);
  });

  it("rejects incomplete API results instead of returning a partial snapshot", async () => {
    await expect(
      collectCoupangSnapshot(async (category) =>
        products(category).slice(0, 3),
      ),
    ).rejects.toThrow("20 required");
    await expect(
      collectCoupangSnapshot(async () => {
        throw new Error("API down");
      }),
    ).rejects.toThrow("API down");
  });

  it("rejects missing or incorrect schedule credentials", () => {
    const secret = "a".repeat(48);
    expect(isCoupangSyncAuthorized(null, secret)).toBe(false);
    expect(isCoupangSyncAuthorized("Bearer x", undefined)).toBe(false);
    expect(isCoupangSyncAuthorized("Bearer " + "b".repeat(48), secret)).toBe(
      false,
    );
    expect(isCoupangSyncAuthorized("Bearer " + secret, secret)).toBe(true);
  });

  it("reads the database snapshot and rejects a malformed response", async () => {
    const snapshot = await collectCoupangSnapshot(fetchProducts);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify([{ payload: snapshot }])),
        ),
    );
    expect(await getCurrentPopularSnapshot()).toEqual(snapshot);
    expect(
      isValidProductSnapshot({ generatedAt: "invalid", categories: {} }),
    ).toBe(false);
    snapshot.categories.baby[1].coupangProductId =
      snapshot.categories.baby[0].coupangProductId;
    expect(isValidProductSnapshot(snapshot)).toBe(false);
  });

  it("retains the bundled catalog if the database is unavailable", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const snapshot = await getCurrentPopularSnapshot();
    expect(Object.values(snapshot.categories).flat()).toHaveLength(120);
    expect(snapshot.generatedAt).toBeTruthy();
  });
});
