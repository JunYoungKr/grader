import { describe, expect, it } from "vitest";
import {
  comparePriorityCandidates,
  isPriorityCandidate,
  observedPriceDrop,
  type CandidatePriorityFacts,
} from "./coupang-promo-priority";

const base: CandidatePriorityFacts = {
  price: 10000,
  previous_price: null,
  previous_price_checked_at: null,
  sources: ["goldbox"],
  is_current: true,
};

describe("promotion review priority", () => {
  it("does not call a Goldbox listing or a small price change a priority deal", () => {
    expect(isPriorityCandidate(base)).toBe(false);
    expect(observedPriceDrop({ ...base, previous_price: 10500, previous_price_checked_at: "yesterday" })).toBe(0);
    expect(isPriorityCandidate({ ...base, previous_price: 10500, previous_price_checked_at: "yesterday" })).toBe(false);
  });

  it("prioritizes a meaningful observed price drop without asserting a discount", () => {
    const candidate = { ...base, previous_price: 12500, previous_price_checked_at: "yesterday" };
    expect(observedPriceDrop(candidate)).toBe(2500);
    expect(isPriorityCandidate(candidate)).toBe(true);
  });

  it("requires the latest batch and known focused search topics", () => {
    const focused = { ...base, sources: ["search:벽걸이 접이식 빨래 바구니"] };
    expect(isPriorityCandidate(focused)).toBe(true);
    expect(isPriorityCandidate({ ...focused, is_current: false })).toBe(false);
    expect(isPriorityCandidate({ ...base, sources: ["search:접이식 빨래 바구니"] })).toBe(false);
  });

  it("puts measured price falls before feature-matched products", () => {
    const observedDrop = { ...base, previous_price: 12500, previous_price_checked_at: "yesterday" };
    const featureMatch = { ...base, sources: ["search:냉장고 자동 음료 디스펜서"] };
    expect(comparePriorityCandidates(observedDrop, featureMatch)).toBeLessThan(0);
  });
});
