import type { Article } from "@/lib/types";

// 식품·건강(food) 시드 글. 비교 대상이 1종뿐이라 grade·axes는 "잠정값" —
// 같은 종류(닭가슴살) 제품이 모이면 실측·재평가 후 확정할 것.
// 지어낸 영양/시험 수치는 넣지 않음 — specs는 공개 정보(중량·보관·구성)만.
// priceExample 11400은 1kg 1팩 조회 시점가 → 발행 전 실측가로 교체.
export const harimChickenBreastArticle: Article = {
  slug: "harim-chicken-breast",
  category: "food",
  type: "comparison",
  title: "하림 닭가슴살 냉장 1kg, 손질 닭가슴살",
  description:
    "냉장 손질된 하림 닭가슴살 1kg. 단백질 보충, 식단 관리용으로 중량 대비 가격과 간편성을 봅니다.",
  updated: "2026.06",
  summary: [
    "냉장으로 손질돼 별도 해동 없이 바로 조리할 수 있는 닭가슴살입니다, 식단, 단백질 보충용.",
    "1kg 단위라 소분해 보관하기 좋고, 중량 대비 단가를 따져 가성비를 보면 됩니다.",
    "비교 대상이 1종이라 등급은 잠정값입니다, 다른 닭가슴살이 모이면 단가, 품질로 재평가합니다.",
  ],
  axes: [
    { label: "단백질, 중량", desc: "g당 단백질과 포장 중량. 식단 관리 시 핵심 지표." },
    { label: "간편성", desc: "손질, 보관 상태(냉장/냉동)와 바로 조리 가능 여부." },
    { label: "가성비", desc: "100g당 단가 대비 중량, 품질." },
  ],
  products: [
    {
      id: "harim-chicken-breast",
      name: "하림 닭가슴살 (냉장)",
      type: "냉장 닭가슴살",
      descriptor: "1kg, 냉장 손질",
      grade: "B", // 잠정값 — 단일 제품 시드, 실측 전
      priceExample: 11400, // 1kg 1팩 조회 시점가
      provider: "coupang",
      // 하림 닭가슴살(냉장) 1kg — 쿠팡 파트너스 추적링크(배너 '쿠팡 최저가 보기'와 동일)
      affiliateUrl: "https://link.coupang.com/a/etn1VURuMu",
      specs: [
        { label: "중량", value: "1kg" },
        { label: "보관", value: "냉장" },
        { label: "구성", value: "1팩" },
      ],
    },
  ],
  // 쿠팡 파트너스 공식 배너 — 실제 추적 링크/creative
  promoBanner: {
    provider: "coupang",
    href: "https://link.coupang.com/a/etn1VURuMu",
    imageUrl:
      "https://img4c.coupangcdn.com/image/affiliate/banner/abd7926074fd9297a3b9109d47c012bb@2x.jpg",
    imageAlt: "하림 닭가슴살 (냉장), 1개, 1kg",
    width: 120,
    height: 240,
  },
};
