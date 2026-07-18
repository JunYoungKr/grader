import { describe, expect, it } from "vitest";
import { normalizeGa4Date } from "./ga4-admin";

describe("normalizeGa4Date", () => {
  it("accepts GA4 relative and ISO dates", () => {
    expect(normalizeGa4Date("28daysAgo", "7daysAgo")).toBe("28daysAgo");
    expect(normalizeGa4Date("2026-07-18", "7daysAgo")).toBe("2026-07-18");
    expect(normalizeGa4Date("today", "7daysAgo")).toBe("today");
  });

  it("rejects arbitrary input", () => {
    expect(normalizeGa4Date("../../etc/passwd", "28daysAgo")).toBe("28daysAgo");
  });
});
