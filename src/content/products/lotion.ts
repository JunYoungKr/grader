import type { Article } from "@/lib/types";

export const lotionArticle: Article = {
  slug: "baby-lotion-grade-2026",
  category: "newborn",
  type: "comparison",
  title: "신생아 보습로션 등급 비교 — 성분·저자극·가성비",
  description:
    "전성분·인증·향료 유무를 기준으로 신생아 보습로션을 S/A/B/C로 평가했습니다. 국산은 쿠팡, 유기농 직구는 아이허브 기준으로 함께 비교합니다.",
  updated: "2026.06",
  medical: true,
  summary: [
    "무향·해외 유기농 인증 제품이 전성분 기준 1순위지만, 직구라 배송 기간을 고려해야 합니다.",
    "국산 임상 저자극 제품(약 1.5만 원·대용량)은 접근성과 가성비가 좋아 데일리용으로 무난합니다.",
    "피부 트러블·아토피 의심 시에는 제품 선택보다 소아과 상담이 우선입니다.",
  ],
  axes: [
    { label: "전성분", desc: "EWG 그린 등급 비율과 논란 성분(파라벤·인공향료) 포함 여부를 확인합니다." },
    { label: "저자극", desc: "무향·무색소 여부와 임상 저자극 테스트 표기를 평가합니다." },
    { label: "인증", desc: "국내 안전 표시와 해외 유기농 인증(USDA·COSMOS 등) 유무를 봅니다." },
    { label: "가성비", desc: "100ml당 단가와 용량 구성을 동급끼리 비교합니다." },
  ],
  products: [
    {
      id: "lotion-s",
      name: "유기농 베이비 로션 A",
      type: "유기농 직구",
      descriptor: "무향 · 해외 유기농 인증",
      grade: "S",
      recommended: true,
      priceExample: 18900,
      provider: "iherb",
      affiliateUrl: "#",
      specs: [
        { label: "향료", value: "무향" },
        { label: "인증", value: "COSMOS 유기농" },
        { label: "용량", value: "250ml" },
      ],
    },
    {
      id: "lotion-a",
      name: "국산 저자극 로션 B",
      type: "국산",
      descriptor: "임상 저자극 · 대용량",
      grade: "A",
      priceExample: 14500,
      provider: "coupang",
      affiliateUrl: "#",
      specs: [
        { label: "향료", value: "무향" },
        { label: "인증", value: "저자극 테스트" },
        { label: "용량", value: "400ml" },
      ],
    },
    {
      id: "lotion-b",
      name: "데일리 보습 로션 C",
      type: "국산",
      descriptor: "가성비 · 약한 천연향",
      grade: "B",
      priceExample: 9900,
      provider: "coupang",
      affiliateUrl: "#",
      specs: [
        { label: "향료", value: "천연 약향" },
        { label: "인증", value: "—" },
        { label: "용량", value: "300ml" },
      ],
    },
  ],
  related: [
    { slug: "newborn-essentials-hub-2026", title: "신생아 용품 종합 가이드 — 우선순위 체크리스트" },
  ],
  sources: [
    { label: "식품의약품안전처 — 화장품 표시·광고 기준", url: "https://www.mfds.go.kr/" },
    { label: "EWG SKIN DEEP — 성분 등급 데이터베이스", url: "https://www.ewg.org/skindeep/" },
  ],
};
