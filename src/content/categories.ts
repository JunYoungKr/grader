import type { Category } from "@/lib/types";

// 전체 생활 제품 대분류 — 쿠팡 파트너스 API 발급 전 임시 수동 분류.
// API 발급 후 상품 자동 분류 체계가 들어오면 그 기준에 맞춰 재정비한다.
export const categories: Category[] = [
  { slug: "baby", name: "육아·출산", blurb: "임신·출산 준비부터 영유아 용품까지 비교" },
  { slug: "daily-life", name: "생활·주방", blurb: "생활 잡화·주방·정리 용품 비교" },
  { slug: "digital", name: "가전·디지털", blurb: "생활가전·디지털 기기 비교" },
  { slug: "food", name: "식품·건강", blurb: "식품·건강기능식품 비교" },
  { slug: "beauty", name: "뷰티", blurb: "스킨케어·바디·헤어 제품 비교" },
  { slug: "sports", name: "스포츠·레저", blurb: "운동·아웃도어 용품 비교" },
];
