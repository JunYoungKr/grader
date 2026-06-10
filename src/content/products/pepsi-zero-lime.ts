import type { Article } from "@/lib/types";

// 식품·건강(food) 시드 글. 비교 대상이 1종뿐이라 grade·axes는 "잠정값" —
// 같은 종류(제로 탄산음료) 제품이 모이면 실측·재평가 후 확정할 것.
// 지어낸 영양/시험 수치는 넣지 않음 — specs는 공개 정보(용량·구성·맛)만.
// priceExample 14440은 210ml 30캔 세트가(조회 시점) → 발행 전 실측가로 교체.
export const pepsiZeroLimeArticle: Article = {
  slug: "pepsi-zero-lime",
  category: "food",
  type: "comparison",
  title: "펩시 제로슈거 라임향 — 칼로리 제로 탄산",
  description:
    "설탕·칼로리 0의 라임향 제로 콜라. 210ml 슬림캔 30개입을 개당 단가와 맛으로 봅니다.",
  updated: "2026.06",
  summary: [
    "설탕을 뺀 제로 탄산음료로, 라임향을 더해 단맛 없이 청량감을 원하는 분께 맞습니다.",
    "210ml 슬림캔 30개입 묶음이라 개당 단가가 낮은 편 — 자주 마신다면 가성비가 좋습니다.",
    "비교 대상이 1종이라 등급은 잠정값입니다 — 다른 제로 음료가 모이면 맛·가성비로 재평가합니다.",
  ],
  axes: [
    { label: "당·칼로리", desc: "설탕·열량 함량. 제로 제품은 0kcal 표기 여부를 봅니다." },
    { label: "맛", desc: "단맛·청량감과 인공감미료 특유의 뒷맛 정도." },
    { label: "가성비", desc: "개당 단가(세트가 ÷ 캔 수) 대비 용량·맛." },
  ],
  products: [
    {
      id: "pepsi-zero-lime",
      name: "펩시 제로슈거 라임향",
      type: "제로 탄산음료",
      descriptor: "라임향 · 210ml 30캔",
      grade: "B", // 잠정값 — 단일 제품 시드, 실측 전
      priceExample: 14440, // 210ml 30캔 세트가(조회 시점)
      provider: "coupang",
      // 펩시 제로슈거 라임향 210ml 30개 — 실제 쿠팡 파트너스 추적링크
      affiliateUrl: "https://link.coupang.com/a/etnKywDH76",
      specs: [
        { label: "용량", value: "210ml × 30캔" },
        { label: "당·칼로리", value: "제로" },
        { label: "기준", value: "세트가(30캔)" },
      ],
    },
  ],
  // 쿠팡 파트너스 공식 배너 — 실제 추적 링크/creative
  promoBanner: {
    provider: "coupang",
    href: "https://link.coupang.com/a/etnVlEmlRk",
    imageUrl:
      "https://image4.coupangcdn.com/image/affiliate/banner/0a8c5f969a1287853cae92cff6ccf7e7@2x.jpg",
    imageAlt: "펩시 제로슈거 라임향, 210ml, 30개",
    width: 120,
    height: 240,
  },
};
