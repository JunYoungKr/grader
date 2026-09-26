import { describe, expect, it } from "vitest";
import type { Product } from "./types";
import { productFromDraft, productToDraft } from "./product-form";

const product: Product = {
  id: "existing-product", name: "기존 상품", type: "식품", descriptor: "1개",
  grade: "B", provider: "coupang", priceExample: 12000,
  affiliateUrl: "https://link.coupang.com/a/existing",
  imageUrl: "https://thumbnail4.coupangcdn.com/product.jpg",
  coupangProductId: 1234, priceCheckedAt: "2026-09-27",
  isRocket: true, isFreeShipping: false,
  specs: [{ label: "구성", value: "1개" }],
  attributes: { features: ["냉장"] },
};

describe("product editor persistence", () => {
  it("preserves the image and API metadata when only the name changes", () => {
    const draft = productToDraft(product);
    draft.name = "수정한 상품명";
    expect(productFromDraft(draft)).toEqual({ ...product, name: "수정한 상품명" });
  });

  it("saves an edited image URL without leaking editor-only fields", () => {
    const draft = productToDraft(product);
    draft.imageUrl = "  https://thumbnail4.coupangcdn.com/replacement.jpg  ";
    draft.specsText = "용량 | 500g";
    const saved = productFromDraft(draft);
    expect(saved.imageUrl).toBe("https://thumbnail4.coupangcdn.com/replacement.jpg");
    expect(saved.specs).toEqual([{ label: "용량", value: "500g" }]);
    expect(saved).not.toHaveProperty("specsText");
    expect(saved).not.toHaveProperty("attributesJson");
  });

  it("keeps an explanation guide product without an invented grade", () => {
    const { grade: _grade, ...ungradedProduct } = product;
    const draft = productToDraft(ungradedProduct);
    expect(draft.grade).toBeUndefined();
    expect(productFromDraft(draft)).toEqual(ungradedProduct);
  });
});
