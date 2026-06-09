import type { Article } from "@/lib/types";

export const strollerArticle: Article = {
  slug: "baby-stroller-grade-2026",
  category: "infant",
  type: "comparison",
  title: "유모차 등급 비교 — 경량·디럭스·휴대형",
  description:
    "무게·접이 방식·안전인증·1일 사용 편의를 4축으로 평가해 S/A/B/C로 매겼습니다. 총 12개 제품 중 상위 4종을 정리했습니다.",
  updated: "2026.06",
  summary: [
    "종합 1순위는 6.8kg 경량 디럭스형으로, 한 손 접이와 KC·EN1888 인증을 모두 충족합니다.",
    "가성비를 우선하면 절충형(약 25만 원)이 합리적이고, 여행·기내반입은 4.6kg 휴대형이 적합합니다.",
    "8kg을 넘는 입문형은 휴대성이 떨어져 일상 외출용으로는 권장도가 낮습니다.",
  ],
  axes: [
    { label: "안전성", desc: "KC·EN1888 인증 보유 여부, 5점식 안전벨트, 주차 제동 구조를 확인합니다." },
    { label: "무게·휴대", desc: "본체 중량과 한 손 접이 가능 여부, 접었을 때 부피를 측정합니다." },
    { label: "주행", desc: "바퀴 서스펜션의 노면 충격 흡수와 한 손 회전 반경을 평가합니다." },
    { label: "가성비", desc: "동급 대비 가격과 부속 구성, 국내 A/S 접근성을 함께 봅니다." },
  ],
  products: [
    {
      id: "stroller-s",
      name: "경량 디럭스 A",
      type: "디럭스형",
      descriptor: "한 손 접이 · 양대면 시트",
      grade: "S",
      recommended: true,
      priceExample: 389000,
      provider: "coupang",
      affiliateUrl: "#",
      specs: [
        { label: "무게", value: "6.8kg" },
        { label: "안전인증", value: "KC · EN1888" },
        { label: "접이", value: "한 손 가능" },
      ],
    },
    {
      id: "stroller-a",
      name: "올라운드 B",
      type: "절충형",
      descriptor: "가성비 · 무난한 주행",
      grade: "A",
      priceExample: 249000,
      provider: "coupang",
      affiliateUrl: "#",
      specs: [
        { label: "무게", value: "7.9kg" },
        { label: "안전인증", value: "KC" },
        { label: "접이", value: "두 손" },
      ],
    },
    {
      id: "stroller-b",
      name: "초경량 휴대 C",
      type: "휴대형",
      descriptor: "기내반입 · 단거리용",
      grade: "B",
      priceExample: 159000,
      provider: "coupang",
      affiliateUrl: "#",
      specs: [
        { label: "무게", value: "4.6kg" },
        { label: "안전인증", value: "KC" },
        { label: "접이", value: "한 손 가능" },
      ],
    },
    {
      id: "stroller-c",
      name: "베이직 D",
      type: "입문형",
      descriptor: "최저가 · 기능 최소",
      grade: "C",
      priceExample: 99000,
      provider: "coupang",
      affiliateUrl: "#",
      specs: [
        { label: "무게", value: "8.4kg" },
        { label: "안전인증", value: "KC" },
        { label: "접이", value: "두 손" },
      ],
    },
  ],
  related: [
    { slug: "newborn-essentials-hub-2026", title: "신생아 용품 종합 가이드 — 우선순위 체크리스트" },
    { slug: "kc-certification-2026", title: "KC 인증이란 — 어린이제품 안전 3단계" },
  ],
  sources: [
    { label: "국가기술표준원 — 어린이제품 안전인증 정보", url: "https://www.kats.go.kr/" },
    { label: "한국소비자원 — 유모차 비교시험 자료", url: "https://www.kca.go.kr/" },
  ],
};
