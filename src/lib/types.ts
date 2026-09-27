export type Grade = "S" | "A" | "B" | "C";

export type Provider = "coupang" | "iherb" | "linkprice" | "tenping";

export type ArticleType = "comparison" | "guide" | "hub";

export interface Spec {
  label: string;
  value: string;
}

export interface ProductAttributes {
  ageMonths?: [number, number]; // 적정 월령 범위 [min, max]
  features?: string[];          // 기능 태그 — "기내반입","한 손 접이" 등 (표시 라벨 그대로)
  // 예산 필터는 기존 priceExample을 사용 (중복 필드 안 만듦)
}

export interface Product {
  id: string;
  coupangProductId?: number; // 쿠팡 API productId (실적 리포트 결합용)
  name: string;
  imageUrl?: string; // 쿠팡 API 상품 이미지
  type: string;
  descriptor: string;
  grade?: Grade; // 기존 비교 글에만 필요하며 설명형 글은 등급을 매기지 않는다.
  specs: Spec[];
  priceExample: number;
  provider: Provider;
  affiliateUrl: string;
  priceCheckedAt?: string; // ISO 날짜(YYYY-MM-DD), 가격 조회 시점
  isRocket?: boolean;
  isFreeShipping?: boolean;
  recommended?: boolean;
  attributes?: ProductAttributes; // 선택적 — 없으면 정적 표로 폴백
}

export interface PopularProduct {
  id: string;
  coupangProductId: number;
  name: string;
  imageUrl: string;
  price: number;
  priceCheckedAt: string;
  affiliateUrl: string;
  isRocket: boolean;
  isFreeShipping: boolean;
  categoryName: string;
  sourceCategoryId: number;
  sourceCategoryLabel: string;
  position: number;
}

export interface PopularProductSnapshot {
  generatedAt: string;
  categories: Record<string, PopularProduct[]>;
}

export interface Axis {
  label: string;
  desc: string;
}

// 제휴처 공식 배너(예: 쿠팡 파트너스 creative). 등급표와 별개로 노출.
export interface PromoBanner {
  provider: Provider;
  href: string;
  imageUrl: string;
  imageAlt: string;
  width: number;
  height: number;
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
  category: string; // 카테고리 slug (src/content/categories.ts)
  type: ArticleType;
  title: string;
  description: string;
  updated: string; // "YYYY.MM"
  modifiedAt?: string; // DB의 실제 수정 시각
  summary: string[]; // 한눈에 요약 (모든 타입 공통)
  medical?: boolean; // 의료 면책 표시 여부 (YMYL)
  axes?: Axis[]; // comparison
  products?: Product[]; // comparison
  promoBanner?: PromoBanner; // 제휴처 공식 배너(선택)
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
