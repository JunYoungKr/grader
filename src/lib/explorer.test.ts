import { describe, it, expect } from "vitest";
import { deriveFilters } from "./explorer";
import type { Product } from "./types";

function mk(p: Partial<Product>): Product {
  return {
    id: p.id ?? "x",
    name: p.name ?? "제품",
    type: p.type ?? "형",
    descriptor: p.descriptor ?? "",
    grade: p.grade ?? "A",
    specs: p.specs ?? [],
    priceExample: p.priceExample ?? 10000,
    provider: p.provider ?? "coupang",
    affiliateUrl: p.affiliateUrl ?? "#",
    recommended: p.recommended,
    attributes: p.attributes,
  };
}

describe("deriveFilters", () => {
  it("예산 min~max를 priceExample에서 구한다", () => {
    const f = deriveFilters([
      mk({ id: "a", priceExample: 99000 }),
      mk({ id: "b", priceExample: 389000 }),
      mk({ id: "c", priceExample: 159000 }),
    ]);
    expect(f.budget).toEqual({ min: 99000, max: 389000 });
  });

  it("features를 합집합(중복 제거, 등장 순서 유지)으로 모은다", () => {
    const f = deriveFilters([
      mk({ id: "a", attributes: { features: ["한 손 접이", "기내반입"] } }),
      mk({ id: "b", attributes: { features: ["한 손 접이", "양대면 시트"] } }),
    ]);
    expect(f.features).toEqual(["한 손 접이", "기내반입", "양대면 시트"]);
  });

  it("ageMonths가 서로 다르면 월령 범위를 노출한다", () => {
    const f = deriveFilters([
      mk({ id: "a", attributes: { ageMonths: [1, 48] } }),
      mk({ id: "b", attributes: { ageMonths: [6, 36] } }),
    ]);
    expect(f.age).toEqual({ min: 1, max: 48 });
  });

  it("ageMonths가 모두 같거나 없으면 월령 필터를 숨긴다(null)", () => {
    expect(
      deriveFilters([
        mk({ id: "a", attributes: { ageMonths: [6, 36] } }),
        mk({ id: "b", attributes: { ageMonths: [6, 36] } }),
      ]).age,
    ).toBeNull();
    expect(deriveFilters([mk({ id: "a" }), mk({ id: "b" })]).age).toBeNull();
  });

  it("features가 하나도 없으면 빈 배열", () => {
    expect(deriveFilters([mk({ id: "a" })]).features).toEqual([]);
  });
});
