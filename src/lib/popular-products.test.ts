import { describe, expect, it } from "vitest";
import { categories } from "../content/categories";
import {
  COUPANG_ALLOWED_CATEGORY_NAMES,
  COUPANG_CATEGORY_SOURCES,
} from "./coupang-categories";
import {
  getPopularProducts,
  getPopularProductsGeneratedAt,
} from "./popular-products";

describe("쿠팡 카테고리 인기 상품 스냅샷", () => {
  it("모든 사이트 카테고리에 20개씩 등록한다", () => {
    for (const category of categories) {
      expect(getPopularProducts(category.slug)).toHaveLength(20);
    }
  });

  it("상품 ID와 제휴 URL이 유효하고 중복되지 않는다", () => {
    const products = categories.flatMap((category) =>
      getPopularProducts(category.slug),
    );
    expect(products).toHaveLength(120);
    expect(new Set(products.map((product) => product.id)).size).toBe(120);

    for (const product of products) {
      expect(product.coupangProductId).toBeGreaterThan(0);
      expect(product.affiliateUrl).toMatch(/^https:\/\/link\.coupang\.com\//);
      expect(product.imageUrl).toMatch(/^https:\/\//);
      expect(product.price).toBeGreaterThan(0);
      expect(product.priceCheckedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(product.affiliateUrl).not.toContain("등록한_채널_ID");
    }
  });

  it("교차 카테고리 광고 상품을 제외한다", () => {
    for (const category of categories) {
      const allowed = COUPANG_ALLOWED_CATEGORY_NAMES[category.slug];
      const sourceIds = new Set(
        COUPANG_CATEGORY_SOURCES[category.slug].map((source) => source.id),
      );
      for (const product of getPopularProducts(category.slug)) {
        expect(allowed).toContain(product.categoryName);
        expect(sourceIds.has(product.sourceCategoryId)).toBe(true);
      }
    }
  });

  it("생성 시각을 기록한다", () => {
    const generatedAt = getPopularProductsGeneratedAt();
    expect(generatedAt).not.toBeNull();
    expect(Number.isNaN(Date.parse(generatedAt ?? ""))).toBe(false);
  });
});
