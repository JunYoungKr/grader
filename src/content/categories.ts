import type { Category } from "@/lib/types";

// 전체 생활 제품 대분류 — 쿠팡 파트너스 API 발급 전 임시 수동 분류.
// API 발급 후 상품 자동 분류 체계가 들어오면 그 기준에 맞춰 재정비한다.
export const categories: Category[] = [
  { slug: "baby", name: "육아용품", blurb: "출산 준비와 아이에게 필요한 용품" },
  {
    slug: "daily-life",
    name: "생활용품",
    blurb: "주방, 청소, 정리에 필요한 용품",
  },
  { slug: "digital", name: "가전", blurb: "생활가전과 디지털 기기" },
  { slug: "food", name: "식품", blurb: "식재료와 건강기능식품" },
  { slug: "beauty", name: "뷰티", blurb: "스킨케어, 바디, 헤어 제품" },
  { slug: "sports", name: "운동용품", blurb: "운동과 야외 활동에 필요한 용품" },
];
