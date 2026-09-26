import { describe, expect, it } from "vitest";
import { pageMetadata, serializeJsonLd } from "./seo";
import { parseUpdated } from "./site";
import { buildFeed } from "./feed";

describe("SEO output integrity", () => {
  it("assigns each route its own canonical URL, including the home page", () => {
    for (const path of ["/", "/category/food", "/pepsi-zero-lime", "/about", "/privacy"]) {
      const metadata = pageMetadata({ title: "제목", path });
      expect(metadata.alternates?.canonical).toBe(`https://grader.co.kr${path}`);
      expect(metadata.openGraph?.url).toBe(metadata.alternates?.canonical);
    }
  });
  it("omits unknown or invalid modification dates instead of inventing a date", () => {
    for (const value of [undefined, "", "2026.06", "invalid", "2026-02-30"]) {
      expect(parseUpdated(value)).toBeUndefined();
    }
    expect(parseUpdated("2026-07-18T12:34:56.000Z")?.toISOString()).toBe("2026-07-18T12:34:56.000Z");
    expect(parseUpdated("2026-07-18T01:00:00+09:00")?.toISOString()).toBe("2026-07-17T16:00:00.000Z");
  });
  it("does not let article text terminate a JSON-LD script", () => {
    const value = { headline: '</script><script>alert("x")</script>' };
    const output = serializeJsonLd(value);
    expect(output).not.toContain("<");
    expect(JSON.parse(output)).toEqual(value);
  });
  it("escapes user content in RSS text and embedded HTML", () => {
    const xml = buildFeed([{ slug: "test", category: "food", type: "guide", title: 'A & <B>', description: '"description"', updated: "2026.06", summary: ["</content:encoded><script>bad</script>"] }]);
    expect(xml).toContain("A &amp; &lt;B&gt;");
    expect(xml).not.toContain("<script>");
    expect(xml).toContain("https://grader.co.kr/test");
    expect(xml).not.toContain("<pubDate>");
  });
});
