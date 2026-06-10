import { describe, it, expect } from "vitest";
import { deriveFilters, rankProducts } from "./explorer";
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

describe("rankProducts", () => {
  const products = [
    mk({ id: "s", grade: "S", priceExample: 389000, recommended: true, attributes: { ageMonths: [1, 48], features: ["한 손 접이", "양대면 시트"] } }),
    mk({ id: "a", grade: "A", priceExample: 249000, attributes: { ageMonths: [6, 48], features: [] } }),
    mk({ id: "b", grade: "B", priceExample: 159000, attributes: { ageMonths: [6, 36], features: ["한 손 접이", "기내반입"] } }),
    mk({ id: "c", grade: "C", priceExample: 99000, attributes: { ageMonths: [6, 36], features: [] } }),
  ];

  it("조건이 없으면 원본 순서를 유지하고 match는 0/0", () => {
    const r = rankProducts(products, { budgetMax: null, features: [], month: null });
    expect(r.map((x) => x.product.id)).toEqual(["s", "a", "b", "c"]);
    expect(r[0].match).toEqual({ satisfied: 0, total: 0, missed: [] });
  });

  it("예산 상한을 넘는 제품은 미충족 처리되어 아래로 내려간다", () => {
    const r = rankProducts(products, { budgetMax: 160000, features: [], month: null });
    expect(r[0].match.satisfied).toBe(1);
    expect(r.find((x) => x.product.id === "s")!.match.missed).toEqual(["예산"]);
    const satisfiedIds = r.filter((x) => x.match.satisfied === 1).map((x) => x.product.id);
    expect(new Set(satisfiedIds)).toEqual(new Set(["b", "c"]));
  });

  it("선택한 기능을 모두 가진 제품만 충족", () => {
    const r = rankProducts(products, { budgetMax: null, features: ["한 손 접이", "기내반입"], month: null });
    expect(r[0].product.id).toBe("b");
    expect(r[0].match.satisfied).toBe(1);
    expect(r.find((x) => x.product.id === "s")!.match.missed).toEqual(["기능"]);
  });

  it("월령이 범위에 들면 충족, 범위 밖/미보유는 미충족", () => {
    const r = rankProducts(products, { budgetMax: null, features: [], month: 2 });
    expect(r[0].product.id).toBe("s");
    expect(r.find((x) => x.product.id === "b")!.match.missed).toEqual(["월령"]);
  });

  it("충족 수 동점이면 등급(S>A>B>C) 순", () => {
    const r = rankProducts(products, { budgetMax: 500000, features: [], month: null });
    expect(r.map((x) => x.product.id)).toEqual(["s", "a", "b", "c"]);
  });

  it("total은 활성 조건 수와 같다", () => {
    const r = rankProducts(products, { budgetMax: 200000, features: ["한 손 접이"], month: null });
    expect(r[0].match.total).toBe(2);
  });
});
