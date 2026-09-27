import { getArticle, getRecentArticles } from "@/lib/content";
import { getCurrentPopularProducts } from "@/lib/popular-products-live";
import { Container, SectionHeading } from "@/components/ui/Primitives";
import { HomeHero } from "@/components/home/HomeHero";
import { TopicNavigation } from "@/components/home/TopicNavigation";
import {
  GuideSection,
  ChecklistSection,
  SavedCollectionBanner,
} from "@/components/home/HomeContent";
import { PopularProductGrid } from "@/components/PopularProductGrid";
import { DisclosureNote } from "@/components/DisclosureNote";
import { pageMetadata } from "@/lib/seo";
export const metadata = {
  ...pageMetadata({ title: "Grader 살림 가이드", path: "/" }),
  title: { absolute: "Grader 살림 가이드" },
};
export const revalidate = 300;
const featuredGuideSlug = "washer-door-stopper-checklist-2026";

export default async function HomePage() {
  const [recentArticles, featuredGuide] = await Promise.all([
    getRecentArticles(),
    getArticle(featuredGuideSlug),
  ]);
  const articles = featuredGuide
    ? [
        featuredGuide,
        ...recentArticles.filter((article) => article.slug !== featuredGuide.slug),
      ].slice(0, 3)
    : recentArticles;
  const products = (await getCurrentPopularProducts("daily-life"))
    .filter(
      (p, i, list) =>
        list.findIndex(
          (other) => other.coupangProductId === p.coupangProductId,
        ) === i,
    )
    .slice(0, 4);
  return (
    <Container>
      <HomeHero />
      <TopicNavigation />
      <GuideSection articles={articles} />
      {products.length > 0 && (
        <section className="section-block">
          <SectionHeading
            title="생활용품"
            description="쿠팡에서 수집한 상품입니다. 상품별 가격 조회일을 확인하세요."
            href="/category/daily-life"
            linkLabel="생활용품 더 보기"
          />
          <DisclosureNote providers={["coupang"]} className="mb-5" />
          <PopularProductGrid products={products} category="daily-life" />
        </section>
      )}
      <ChecklistSection />
      <SavedCollectionBanner />
    </Container>
  );
}
