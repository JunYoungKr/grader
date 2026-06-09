import type { Category } from "@/lib/types";

// 생애주기(life-stage) 중심 분류 — BabyGrade 구조 차용
export const categories: Category[] = [
  { slug: "maternity", name: "임산부", blurb: "임신·출산 준비와 산모 케어 용품 비교" },
  { slug: "newborn", name: "신생아", blurb: "0~3개월 수유·수면·위생 용품 비교" },
  { slug: "infant", name: "영아", blurb: "이유식·외출·놀이 단계 용품 비교" },
  { slug: "toddler", name: "유아", blurb: "위생·식기·활동기 용품 비교" },
  { slug: "safety", name: "안전", blurb: "KC 인증·성분 안전 기준 가이드" },
];
