import type { Article } from "@/lib/types";

// 식품·건강(food) 시드 글. 비교 대상이 1종뿐이라 grade·axes는 "잠정값" —
// 같은 종류(그래놀라/시리얼) 제품이 모이면 실측·재평가 후 확정할 것.
// 지어낸 영양/시험 수치는 넣지 않음 — specs는 공개 정보(용량·구성)만.
// priceExample 15000은 350g 3개 세트가(조회 시점) → 발행 전 실측가로 교체.
export const kelloggsRealGranolaArticle: Article = {
  slug: "kelloggs-real-granola",
  category: "food",
  type: "comparison",
  title: "켈로그 리얼 그래놀라 오리지널 — 그래놀라 시리얼",
  description:
    "켈로그 리얼 그래놀라 오리지널 350g 3개입. 아침 대용·간식용으로 용량 대비 가격과 맛을 봅니다.",
  updated: "2026.06",
  summary: [
    "오트·곡물을 구운 그래놀라 시리얼로, 우유·요거트에 곁들이는 아침 대용이나 간식으로 씁니다.",
    "350g 3개입 묶음이라 100g당 단가로 가성비를 따지면 됩니다.",
    "비교 대상이 1종이라 등급은 잠정값입니다 — 다른 그래놀라가 모이면 당·가성비로 재평가합니다.",
  ],
  axes: [
    { label: "영양·당", desc: "당 함량과 곡물·견과 구성. 그래놀라는 당 함량 차이가 큽니다." },
    { label: "맛", desc: "단맛·식감과 우유/요거트와의 조합." },
    { label: "가성비", desc: "100g당 단가(세트가 ÷ 총 중량) 대비 용량·맛." },
  ],
  products: [
    {
      id: "kelloggs-real-granola",
      name: "켈로그 리얼 그래놀라 오리지널",
      type: "그래놀라 시리얼",
      descriptor: "오리지널 · 350g 3개",
      grade: "B", // 잠정값 — 단일 제품 시드, 실측 전
      priceExample: 15000, // 350g 3개 세트가(조회 시점)
      provider: "coupang",
      // 켈로그 리얼 그래놀라 오리지널 350g 3개 — 쿠팡 파트너스 추적링크(배너 '쿠팡 최저가 보기'와 동일)
      affiliateUrl: "https://link.coupang.com/a/etn3N43F7s",
      specs: [
        { label: "용량", value: "350g × 3개" },
        { label: "종류", value: "오리지널" },
        { label: "기준", value: "세트가(3개)" },
      ],
    },
  ],
  // 쿠팡 파트너스 공식 배너 — 실제 추적 링크/creative
  promoBanner: {
    provider: "coupang",
    href: "https://link.coupang.com/a/etn3N43F7s",
    imageUrl:
      "https://image4.coupangcdn.com/image/affiliate/banner/6a6a4816c5837c4c5fe80ed811ebb6e5@2x.jpg",
    imageAlt: "켈로그 리얼 그래놀라 오리지널 시리얼, 350g, 3개",
    width: 120,
    height: 240,
  },
};
