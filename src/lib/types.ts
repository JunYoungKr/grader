export type Grade = "S" | "A" | "B" | "C";

export type Provider = "coupang" | "iherb" | "linkprice" | "tenping";

export type ArticleType = "comparison" | "guide" | "hub";

export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  descriptor: string;
  grade: Grade;
  specs: Spec[];
  priceExample: number;
  provider: Provider;
  affiliateUrl: string;
  recommended?: boolean;
}

export interface Axis {
  label: string;
  desc: string;
}

export interface Section {
  heading: string;
  paragraphs: string[];
}

export interface ChecklistItem {
  name: string; // 품목
  quantity: string; // 권장 수량
  note?: string; // 메모
  slug?: string; // 내부 비교글로 연결(funnel)
}

export interface Source {
  label: string;
  url: string;
}

export interface RelatedLink {
  slug: string;
  title: string;
}

export interface Article {
  slug: string;
  category: string; // 생애주기 카테고리 slug
  type: ArticleType;
  title: string;
  description: string;
  updated: string; // "YYYY.MM"
  summary: string[]; // 한눈에 요약 (모든 타입 공통)
  medical?: boolean; // 의료 면책 표시 여부 (YMYL)
  axes?: Axis[]; // comparison
  products?: Product[]; // comparison
  sections?: Section[]; // guide / hub 본문
  checklist?: { caption?: string; items: ChecklistItem[] }; // 품목별 수량 표(funnel)
  related?: RelatedLink[]; // 내부 링크(클러스터/관련 글)
  sources?: Source[]; // 1차 출처
}

export interface Category {
  slug: string;
  name: string;
  blurb: string;
}
