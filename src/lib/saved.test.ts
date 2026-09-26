import { describe, expect, it } from "vitest";
import { parseSaved } from "./saved";
const item = {
  id: "article:example",
  title: "살림 가이드",
  href: "/example",
  kind: "article",
};
describe("saved collection boundaries", () => {
  it("handles corrupted browser data without losing valid neighboring items", () => {
    expect(parseSaved("broken json")).toEqual([]);
    expect(parseSaved(JSON.stringify([null, {}, item]))).toEqual([item]);
  });
  it("does not render executable or protocol-relative saved links", () => {
    for (const href of [
      "javascript:alert(1)",
      "//untrusted.example",
      "/\\untrusted.example",
      "data:text/html,test",
    ]) {
      expect(parseSaved(JSON.stringify([{ ...item, href }]))).toEqual([]);
    }
  });
  it("restores article and affiliate entries with their checked prices", () => {
    const product = {
      id: "product:1",
      title: "생활용품",
      href: "https://link.coupang.com/example",
      kind: "product",
      price: 12500,
      priceCheckedAt: "2026-07-18",
    };
    expect(parseSaved(JSON.stringify([item, product]))).toEqual([
      item,
      product,
    ]);
  });
});
