import type { Article } from "@/lib/types";

// 식품·건강(food) 시드 글. 비교 대상이 1종뿐이라 grade·axes는 "잠정값" —
// 같은 종류(대체 감미료/알룰로스) 제품이 모이면 실측·재평가 후 확정할 것.
// 지어낸 영양/시험 수치는 넣지 않음 — specs는 공개 정보(용량·구성·특징)만.
// priceExample 12800은 500g 1팩 조회 시점가 → 발행 전 실측가로 교체.
export const mynormalAlluloseArticle: Article = {
  slug: "mynormal-allulose",
  category: "food",
  type: "comparison",
  title: "마이노멀 저당 저칼로리 알룰로스, 대체 감미료",
  description:
    "설탕 대신 쓰는 저당, 저칼로리 알룰로스 500g. 당 관리, 베이킹용으로 단가와 사용성을 봅니다.",
  updated: "2026.06",
  summary: [
    "설탕을 대체하는 알룰로스 감미료로, 당, 칼로리를 줄이려는 분이 커피, 베이킹, 요리에 씁니다.",
    "500g 단위라 100g당 단가로 가성비를 따지고, 단맛 강도(설탕 대비)와 사용 편의를 봅니다.",
    "비교 대상이 1종이라 등급은 잠정값입니다, 다른 알룰로스가 모이면 단가, 단맛으로 재평가합니다.",
  ],
  axes: [
    { label: "당, 칼로리", desc: "설탕 대비 당, 열량 절감 정도. 알룰로스의 핵심 가치." },
    { label: "사용성", desc: "설탕 대비 단맛 강도와 커피, 베이킹 등 활용 범위." },
    { label: "가성비", desc: "100g당 단가 대비 용량, 단맛." },
  ],
  products: [
    {
      id: "mynormal-allulose",
      name: "마이노멀 저당 저칼로리 알룰로스",
      type: "알룰로스 감미료",
      descriptor: "500g, 저당 저칼로리",
      grade: "B", // 잠정값 — 단일 제품 시드, 실측 전
      priceExample: 12800, // 500g 1팩 조회 시점가
      provider: "coupang",
      // 마이노멀 저당 저칼로리 알룰로스 500g — 쿠팡 파트너스 추적링크(배너 '쿠팡 최저가 보기'와 동일)
      affiliateUrl: "https://link.coupang.com/a/etn5rUeb4m",
      specs: [
        { label: "용량", value: "500g" },
        { label: "특징", value: "저당, 저칼로리" },
        { label: "구성", value: "1팩" },
      ],
    },
  ],
  // 쿠팡 파트너스 공식 배너 — 실제 추적 링크/creative
  promoBanner: {
    provider: "coupang",
    href: "https://link.coupang.com/a/etn5rUeb4m",
    imageUrl:
      "https://image4.coupangcdn.com/image/affiliate/banner/7822702b7e6a5788d065f0d9bd9b7a28@2x.jpg",
    imageAlt: "마이노멀 저당 저칼로리 알룰로스, 500g, 1개",
    width: 120,
    height: 240,
  },
};
