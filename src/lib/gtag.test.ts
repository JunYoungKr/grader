import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("growth measurement contract", () => {
  const gtag = vi.fn();
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-TEST12345");
    vi.stubGlobal("window", { gtag });
    gtag.mockClear();
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it("records an affiliate click with its item and placement, never as a purchase", async () => {
    const { trackSelectItem } = await import("./gtag");
    trackSelectItem({ productId: 123, product: "상품", provider: "coupang", article: "saved", placement: "saved_collection", price: 12000 });
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith("event", "select_item", expect.objectContaining({
      placement: "saved_collection", item_list_id: "saved",
      items: [expect.objectContaining({ item_id: 123, item_name: "상품", price: 12000 })],
    }));
    expect(gtag.mock.calls.some((call) => call[1] === "purchase")).toBe(false);
  });
  it("records empty search results without a query or URL", async () => {
    const { trackSearchResults } = await import("./gtag");
    trackSearchResults({ category: "daily-life", articleCount: 0, productCount: 0 });
    expect(gtag).toHaveBeenCalledWith("event", "search_results_view", {
      category: "daily-life", article_count: 0, product_count: 0, has_results: false,
    });
  });
  it("distinguishes save and removal without sending the saved title or URL", async () => {
    const { trackSavedItem } = await import("./gtag");
    trackSavedItem({ id: "article:test", kind: "article", action: "save" });
    trackSavedItem({ id: "article:test", kind: "article", action: "remove" });
    expect(gtag.mock.calls).toEqual([
      ["event", "save_item", { content_id: "article:test", content_type: "article" }],
      ["event", "remove_saved_item", { content_id: "article:test", content_type: "article" }],
    ]);
  });
  it("does not send events when measurement is unconfigured", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "");
    const { trackSavedItem } = await import("./gtag");
    trackSavedItem({ id: "article:test", kind: "article", action: "save" });
    expect(gtag).not.toHaveBeenCalled();
  });
});
