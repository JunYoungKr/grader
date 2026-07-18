import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDeeplinks,
  getBestCategoryProducts,
  searchProducts,
} from "./coupang";

const fetchMock = vi.fn();

function okResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => ({ rCode: "0", rMessage: "", data }),
  };
}

describe("Coupang Partners API client", () => {
  beforeEach(() => {
    process.env.COUPANG_ACCESS_KEY = "test-access-key";
    process.env.COUPANG_SECRET_KEY = "test-secret-key";
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.COUPANG_ACCESS_KEY;
    delete process.env.COUPANG_SECRET_KEY;
  });

  it("uses the documented v1 product search endpoint", async () => {
    fetchMock.mockResolvedValue(okResponse({ productData: [] }));

    await searchProducts("제로 콜라", 5, {
      subId: "registered-channel",
      imageSize: "512x512",
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain(
      "/v2/providers/affiliate_open_api/apis/openapi/v1/products/search?",
    );
    expect(url).toContain("keyword=%EC%A0%9C%EB%A1%9C+%EC%BD%9C%EB%9D%BC");
    expect(url).toContain("limit=5");
    expect(url).toContain("subId=registered-channel");
    expect(init.headers.Authorization).toContain("CEA algorithm=HmacSHA256");
  });

  it("rejects search limits above the documented maximum", async () => {
    await expect(searchProducts("콜라", 11)).rejects.toThrow("1~10");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses the category best endpoint and supports up to 100 products", async () => {
    fetchMock.mockResolvedValue(okResponse([]));

    await getBestCategoryProducts(1012, 100);

    expect(fetchMock.mock.calls[0][0]).toContain(
      "/openapi/v1/products/bestcategories/1012?limit=100",
    );
  });

  it("posts up to 20 Coupang URLs to the deeplink endpoint", async () => {
    const data = [
      {
        originalUrl: "https://www.coupang.com/vp/products/1",
        shortenUrl: "https://coupa.ng/example",
        landingUrl: "https://link.coupang.com/example",
      },
    ];
    fetchMock.mockResolvedValue(okResponse(data));

    const result = await createDeeplinks(
      ["https://www.coupang.com/vp/products/1"],
      "registered-channel",
    );

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/openapi/v1/deeplink");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      coupangUrls: ["https://www.coupang.com/vp/products/1"],
      subId: "registered-channel",
    });
    expect(result).toEqual(data);
  });
});
