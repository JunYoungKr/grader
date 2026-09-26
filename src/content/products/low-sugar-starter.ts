import type { Article } from "@/lib/types";

// 첫 비(非)육아 카테고리 글 — 저당·고단백 식단 시작 구성 4종.
// 제품 유형이 서로 달라(음료·육류·시리얼·감미료) 동일 스펙 비교가 아니라
// "식단에서 맡는 자리(역할)" 기준으로 비교한다. 영양성분 수치는 지어내지 않고
// 제품명 표기·구성(용량/수량)·조회 시점 가격만 사실로 기재.
// 가격: 2026.06 조회 기준(운영자 확인값). 실시간가는 링크에서 확인.
// 등급: 운영자 확정값(2026.06) — 역할 기준 평가, 펩시 S(추천)·나머지 A.
export const lowSugarStarterArticle: Article = {
  slug: "low-sugar-pantry-starter-2026",
  category: "food",
  type: "comparison",
  medical: true,
  title: "저당, 고단백 장보기 스타터 4종",
  description:
    "저당 식단을 시작할 때 음료, 단백질, 아침 식사, 요리에 쓰는 당을 채우는 구성입니다. 역할과 표기, 가격을 기준으로 비교했습니다.",
  updated: "2026.06",
  summary: [
    "탄산음료 대체(펩시 제로슈거), 단백질(하림 닭가슴살), 아침(켈로그 그래놀라), 설탕 대체(마이노멀 알룰로스), 자리별 1종씩 채우는 구성입니다.",
    "1순위는 펩시 제로슈거 라임향(S), 당이 가장 습관적으로 들어오는 자리(음료)를 바로 대체합니다. 나머지 3종은 모두 A.",
    "4종 합계 약 53,640원(2026.06 조회 기준). 가격은 수시로 바뀌므로 실시간 가격, 재고는 각 제품 링크에서 확인하세요.",
    "서로 유형이 다른 제품이라 같은 스펙으로 줄 세우지 않고, 식단에서 맡는 역할 기준으로 비교했습니다. 영양성분 수치는 판매 페이지의 영양성분표를 확인하세요.",
  ],
  axes: [
    {
      label: "역할",
      desc: "저당 식단에서 맡는 자리, 음료 대체, 단백질, 아침 식사, 설탕 대체. 빠지면 기존 식습관으로 돌아가기 쉬운 자리인지를 봅니다.",
    },
    {
      label: "당류 표기",
      desc: "제품에 표기된 당류 관련 표시(제로 슈거, 저당 등) 기준입니다. 구체적인 영양성분 수치는 판매 페이지에서 확인하세요.",
    },
    {
      label: "활용도",
      desc: "조리 없이 바로 먹을 수 있는지, 다른 식단, 요리에 응용할 수 있는지를 봅니다.",
    },
    {
      label: "가격",
      desc: "조회 시점(2026.06) 판매가 기준. 단위당 가격을 함께 표기하며, 실시간 가격은 링크에서 확인하세요.",
    },
  ],
  products: [
    {
      id: "lss-pepsi-zero-lime",
      coupangProductId: 8279872054,
      imageUrl: "https://thumbnail4.coupangcdn.com/thumbnails/remote/512x512ex/image/retail/images/378947857831841-03b75531-8dd7-4d79-aed8-bd089640f638.jpg",
      name: "펩시 제로슈거 라임향",
      type: "제로 탄산음료",
      descriptor: "탄산음료 대체",
      grade: "S",
      recommended: true,
      priceExample: 14440,
      provider: "coupang",
      // 배너형 링크(보관용): https://link.coupang.com/a/etnVlEmlRk
      affiliateUrl: "https://link.coupang.com/a/etnKywDH76",
      specs: [
        { label: "구성", value: "210ml × 30캔" },
        { label: "표기", value: "제로 슈거" },
        { label: "캔당", value: "약 481원(조회 시점)" },
      ],
    },
    {
      id: "lss-harim-chicken",
      coupangProductId: 8844298106,
      imageUrl: "https://t1c.coupangcdn.com/thumbnails/remote/512x512ex/image/rs_quotation_api/wbmasagm/a2c1d41a837e4f108a4392e6fba3f7b1.jpg",
      name: "하림 닭가슴살 (냉장)",
      type: "닭가슴살(냉장)",
      descriptor: "단백질 메인",
      grade: "A",
      priceExample: 11400,
      provider: "coupang",
      // 배너형 링크(보관용): https://link.coupang.com/a/etn1VURuMu
      affiliateUrl: "https://link.coupang.com/a/etn1pPPchE",
      specs: [
        { label: "구성", value: "1kg × 1개" },
        { label: "보관", value: "냉장" },
        { label: "100g당", value: "약 1,140원(조회 시점)" },
      ],
    },
    {
      id: "lss-kellogg-granola",
      coupangProductId: 7012375223,
      imageUrl: "https://t3c.coupangcdn.com/thumbnails/remote/512x512ex/image/retail/images/fee7bcb6-4750-4877-b749-420e8b8920e416817196393766070120.png",
      name: "켈로그 리얼 그래놀라 오리지널",
      type: "그래놀라 시리얼",
      descriptor: "아침 식사 베이스",
      grade: "A",
      priceExample: 15000,
      provider: "coupang",
      // 배너형 링크(보관용): https://link.coupang.com/a/etn3N43F7s
      affiliateUrl: "https://link.coupang.com/a/etn3wfr4ua",
      specs: [
        { label: "구성", value: "350g × 3개(총 1.05kg)" },
        { label: "100g당", value: "약 1,429원(조회 시점)" },
      ],
    },
    {
      id: "lss-mynormal-allulose",
      coupangProductId: 9246341637,
      imageUrl: "https://t1c.coupangcdn.com/thumbnails/remote/512x512ex/image/retail/images/1377670231344522-f765872e-30cb-48e8-ab6b-fb58e152358d.jpg",
      name: "마이노멀 알룰로스",
      type: "대체 감미료",
      descriptor: "설탕 대체",
      grade: "A",
      priceExample: 12800,
      provider: "coupang",
      // 배너형 링크(보관용): https://link.coupang.com/a/etn5rUeb4m
      affiliateUrl: "https://link.coupang.com/a/etn4SXNark",
      specs: [
        { label: "구성", value: "500g × 1개" },
        { label: "표기", value: "저당, 저칼로리" },
      ],
    },
  ],
  sections: [
    {
      heading: "왜 이 네 자리인가",
      paragraphs: [
        "저당 식단이 무너지는 지점은 대개 정해져 있습니다, 습관처럼 마시는 음료, 출근 전 아침, 요리에 들어가는 설탕, 그리고 단백질이 부족해 군것질로 채우는 순간. 이 글은 그 네 자리를 각각 한 제품씩으로 채우는 시작 구성입니다.",
        "같은 자리 안에서 더 좋은 대안이 있을 수 있습니다. 이 글은 '무엇부터 채울지'의 출발점이고, 자리별 상세 비교는 카테고리가 자라면서 별도 글로 다룹니다.",
      ],
    },
    {
      heading: "평가 방식에 대해",
      paragraphs: [
        "네 제품은 유형이 서로 달라 같은 스펙 축으로 줄 세울 수 없습니다. 그래서 역할(식단에서 맡는 자리), 당류 표기, 활용도, 가격을 기준으로 비교하고, 등급은 같은 가격대에서 그 역할을 얼마나 잘 수행하는지에 대한 운영자 판단입니다.",
        "당류, 칼로리 등 구체적인 영양성분 수치는 제품 페이지의 영양성분표가 기준입니다. 이 글에는 제품명에 표기된 표시(제로 슈거, 저당, 저칼로리)와 구성, 가격만 기재했습니다.",
      ],
    },
  ],
  related: [
    { slug: "pepsi-zero-lime", title: "펩시 제로슈거 라임향, 칼로리 제로 탄산" },
    { slug: "harim-chicken-breast", title: "하림 닭가슴살 냉장 1kg, 손질 닭가슴살" },
    { slug: "kelloggs-real-granola", title: "켈로그 리얼 그래놀라 오리지널, 그래놀라 시리얼" },
    { slug: "mynormal-allulose", title: "마이노멀 저당 저칼로리 알룰로스, 대체 감미료" },
  ],
  sources: [
    {
      label: "식품의약품안전처, 당류 저감, 영양표시 정보",
      url: "https://www.mfds.go.kr/",
    },
  ],
};
