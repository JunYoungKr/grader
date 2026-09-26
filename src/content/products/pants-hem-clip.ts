import type { Article } from "@/lib/types";

// 전체 제품 확장의 첫 일상생활 글(시드). 현재 비교 대상이 1종뿐이라 등급(grade)·비교축은
// "잠정값"이며, 같은 종류(밑단 고정 클립/밴드/접착 테이프) 제품이 모이면 실측·재평가 후 확정할 것.
// 지어낸 시험 데이터는 넣지 않음 — specs는 제품 공개 정보(구성·색상)만 기재.
// priceExample 8000은 10개입 세트가(조회 시점) → 발행 전 쿠팡 파트너스 실측가로 교체할 것.
export const pantsHemClipArticle: Article = {
  slug: "pants-hem-clip-grade-2026",
  category: "daily-life",
  type: "comparison",
  title: "바지 밑단 고정 클립 비교, 접어 입는 클립형",
  description:
    "긴 바지 밑단을 접어 고정하는 클립형 제품을 고정력, 눈에 띄지 않음, 재사용성, 가성비로 평가합니다. 바느질, 수선 없이 길이를 조절하려는 분께.",
  updated: "2026.06",
  summary: [
    "바느질이나 수선집 없이 바지 밑단 길이를 임시로 줄이고 싶을 때 쓰는 클립입니다, 접은 밑단을 안쪽에서 집어 고정합니다.",
    "투명 소재는 밖에서 잘 보이지 않아 정장, 슬랙스에도 무난하고, 여러 벌에 돌려 쓸 수 있어 재사용성이 장점입니다.",
    "아직 비교 대상이 1종이라 등급은 잠정값입니다, 같은 종류 제품이 모이면 고정력, 내구성을 실측해 재평가합니다.",
  ],
  axes: [
    { label: "고정력", desc: "접은 밑단이 움직이거나 풀리지 않고 잡아주는 정도." },
    { label: "눈에 띄지 않음", desc: "착용 시 밖에서 클립이 보이는지, 투명, 소형일수록 유리." },
    { label: "재사용성", desc: "여러 벌에 옮겨 쓰거나 반복 사용 시 손상 없이 쓰는 정도." },
    { label: "가성비", desc: "개당 단가(세트가 ÷ 구성 수량) 대비 고정력, 내구성." },
  ],
  products: [
    {
      id: "hemclip-pixelog",
      coupangProductId: 9486875684,
      imageUrl: "https://thumbnail12.coupangcdn.com/thumbnails/remote/512x512ex/image/vendor_inventory/fe7d/20c959369f9c2ba448270423867ffafc3e1cabd6df599c127f4915eed0f1.png",
      name: "픽셀로그 바지 밑단 고정 클립",
      type: "클립형 밑단 고정",
      descriptor: "투명, 10개입, 여러 벌 돌려쓰기",
      grade: "B", // 잠정값 — 단일 제품 시드, 실측 전
      recommended: true,
      priceExample: 8000, // 10개입 세트가(조회 시점)
      provider: "coupang",
      // 픽셀로그 바지 밑단 고정 클립 10개(투명) — 쿠팡 파트너스 추적링크(배너 '쿠팡 최저가 보기'와 동일)
      affiliateUrl: "https://link.coupang.com/a/etoClK2QeW",
      specs: [
        { label: "구성", value: "10개입" },
        { label: "색상", value: "투명" },
        { label: "기준", value: "세트가(10개)" },
      ],
    },
  ],
  // 쿠팡 파트너스 공식 배너(픽셀로그 바지 밑단 고정 클립 10개, 투명) — 실제 추적 링크/creative
  promoBanner: {
    provider: "coupang",
    href: "https://link.coupang.com/a/etoClK2QeW",
    imageUrl:
      "https://image5.coupangcdn.com/image/affiliate/banner/8a3706c5504226113a3cd30c7327a8da@2x.jpg",
    imageAlt: "픽셀로그 바지 밑단 고정 클립 10개, 투명",
    width: 120,
    height: 240,
  },
};
