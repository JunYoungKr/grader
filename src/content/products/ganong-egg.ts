import type { Article } from "@/lib/types";

// 식품·건강(food) 시드 글. 비교 대상이 1종뿐이라 grade·axes는 "잠정값" —
// 같은 종류(반숙란·구운란 등 단백질 간식) 제품이 모이면 실측·재평가 후 확정할 것.
// 지어낸 영양/시험 수치는 넣지 않음 — specs는 공개 정보(구성·형태)만.
// priceExample 11600은 20구 세트가(조회 시점) → 가격 변동 시 어드민에서 갱신.
export const ganongEggArticle: Article = {
  slug: "ganong-vitamin-egg",
  category: "food",
  type: "comparison",
  title: "가농 비타민 반숙란 20구, 간편 단백질 간식",
  description:
    "껍질을 깐 뒤 바로 먹는 반숙란 20구입. 끼니 사이 단백질 간식, 식단 단백질 보충 관점에서 개당 단가로 봅니다.",
  updated: "2026.06",
  summary: [
    "조리 없이 바로 먹는 반숙란 20구입, 단백질 간식 자리를 채우기 좋은 형태입니다.",
    "세트가 11,600원 기준 개당 약 580원(조회 시점). 가격은 변동되니 실시간가는 링크에서 확인하세요.",
    "비교 대상이 1종이라 등급은 잠정값입니다, 반숙란, 구운란 등 단백질 간식 비교군이 모이면 재평가합니다.",
  ],
  axes: [
    { label: "간편성", desc: "조리, 세척 없이 바로 먹을 수 있는지, 보관이 쉬운지를 봅니다." },
    { label: "단백질 역할", desc: "끼니 사이 단백질 간식 자리를 안정적으로 채우는지. 구체 영양성분은 판매 페이지 표 기준." },
    { label: "가성비", desc: "개당 단가(세트가 ÷ 구 수) 대비 만족도." },
  ],
  products: [
    {
      id: "ganong-vitamin-egg",
      coupangProductId: 6213104056,
      imageUrl: "https://t2a.coupangcdn.com/thumbnails/remote/512x512ex/image/retail/images/289921759327885-93ea43e5-ce48-440e-8456-a46d0a55c2d8.jpg",
      name: "가농 비타민 반숙란",
      type: "반숙란(단백질 간식)",
      descriptor: "20구, 개당 약 580원",
      grade: "B", // 잠정값 — 단일 제품 시드, 실측 전
      priceExample: 11600, // 20구 세트가(조회 시점)
      provider: "coupang",
      // 가농 비타민 반숙란 20구 — 쿠팡 파트너스 추적링크(배너 '쿠팡 최저가 보기'와 동일)
      affiliateUrl: "https://link.coupang.com/re/AFFSDP?lptag=AF7440212&subid=graderco2026&pageKey=6213104056&itemId=12394793899&traceid=V0-183-b818cdba88334d38",
      specs: [
        { label: "구성", value: "반숙란 20구 × 1개" },
        { label: "개당", value: "약 580원(조회 시점)" },
        { label: "기준", value: "세트가(20구)" },
      ],
    },
  ],
  // 쿠팡 파트너스 공식 배너 — 실제 추적 링크/creative
  promoBanner: {
    provider: "coupang",
    href: "https://link.coupang.com/re/AFFSDP?lptag=AF7440212&subid=graderco2026&pageKey=6213104056&itemId=12394793899&traceid=V0-183-b818cdba88334d38",
    imageUrl:
      "https://img5c.coupangcdn.com/image/affiliate/banner/a7b383eaa6a4af8307863e0fbc2181bd@2x.jpg",
    imageAlt: "가농 비타민 반숙란, 20구, 1개",
    width: 120,
    height: 240,
  },
  related: [
    { slug: "low-sugar-pantry-starter-2026", title: "저당, 고단백 장보기 스타터 4종" },
    { slug: "harim-chicken-breast", title: "하림 닭가슴살 냉장 1kg, 손질 닭가슴살" },
  ],
};
