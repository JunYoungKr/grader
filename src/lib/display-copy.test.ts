import { describe, expect, it } from "vitest";
import { normalizeContentCopy, normalizeDisplayText } from "./display-copy";

describe("display copy rules", () => {
  it("cleans separators from nested article and product copy", () => {
    const result = normalizeContentCopy({
      title: "구매 전 \u2014 확인할 내용",
      summary: ["크기\u00b7가격\u30fb호환"],
      products: [{ name: "용기 - 2개", specs: [{ label: "폭\u00b7높이", value: "10\u201320cm" }] }],
      sections: [{ heading: "세척\u2027보관", paragraphs: ["사용\u2219관리"] }],
    });
    expect(result).toEqual({
      title: "구매 전, 확인할 내용",
      summary: ["크기, 가격, 호환"],
      products: [{ name: "용기, 2개", specs: [{ label: "폭, 높이", value: "10~20cm" }] }],
      sections: [{ heading: "세척, 보관", paragraphs: ["사용, 관리"] }],
    });
  });

  it("preserves links, identifiers, model numbers, prices and dates", () => {
    const item = {
      id: "item-123", slug: "low-sugar-pantry-starter-2026",
      href: "https://example.com/a-b?title=x\u00b7y",
      affiliateUrl: "https://link.coupang.com/a/x-y",
      imageUrl: "https://example.com/a\u2014b.jpg",
      name: "ABC-123 2026-09-27", price: 12300, priceCheckedAt: "2026-09-27",
    };
    expect(normalizeContentCopy(item)).toEqual(item);
  });

  it("keeps null fields and numeric ranges valid and does not mutate input", () => {
    const original = { title: "살림\u00b7구매", attributes: { ageMonths: [0, 12] }, sections: null };
    const result = normalizeContentCopy(original);
    expect(original.title).toBe("살림\u00b7구매");
    expect(result).toEqual({ title: "살림, 구매", attributes: { ageMonths: [0, 12] }, sections: null });
    expect(normalizeDisplayText(result.title)).toBe(result.title);
  });
});
