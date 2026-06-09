// Google Analytics 4 헬퍼 (클라이언트 전용).
// NEXT_PUBLIC_GA_ID 미설정 시 모든 호출은 조용히 no-op → 빌드/로컬에서 안전.
import type { Grade, Provider } from "./types";

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
export const gaEnabled = GA_ID.length > 0;

type GtagParams = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function send(event: string, params: GtagParams = {}): void {
  if (!gaEnabled || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event, params);
}

// SPA 라우트 변경 시 수동 페이지뷰 (config는 send_page_view:false로 초기화).
export function pageview(path: string): void {
  send("page_view", { page_path: path, page_location: typeof window !== "undefined" ? window.location.href : path });
}

// 제휴 링크 클릭 = 이 사이트의 전환(북극성). GA4 표준 select_item으로 전송.
// item_brand/item_category/item_list_id는 GA4 표준 측정기준이라 별도 등록 없이 리포트에 잡힘.
// placement는 커스텀 → 필요 시 GA4에서 맞춤 측정기준으로 등록.
export interface AffiliateItem {
  article?: string; // 글 slug
  product?: string; // 제품명
  grade?: Grade; // 등급 S/A/B/C
  provider?: Provider; // 제휴처
  placement?: string; // comparison_table | sticky_cta | product_card
  recommended?: boolean; // 1순위 추천 여부
}

export function trackSelectItem(d: AffiliateItem): void {
  send("select_item", {
    item_list_id: d.article,
    placement: d.placement,
    recommended: d.recommended === true,
    items: [
      {
        item_id: d.product,
        item_name: d.product,
        item_brand: d.provider, // 제휴처
        item_category: d.grade, // 등급
        item_list_id: d.article,
      },
    ],
  });
}

// 등급표가 화면에 보일 때(view_item_list) → 유입 대비 "등급표 도달" 단계.
export function trackViewItemList(
  article: string,
  items: { id: string; name: string; provider: Provider; grade: Grade }[],
): void {
  send("view_item_list", {
    item_list_id: article,
    items: items.map((p) => ({
      item_id: p.id,
      item_name: p.name,
      item_brand: p.provider,
      item_category: p.grade,
      item_list_id: article,
    })),
  });
}

// 목차 클릭 → 무엇을 궁금해하는지(관심 신호).
export function trackTocClick(target: string, article?: string): void {
  send("toc_click", { target, item_list_id: article });
}

// 필터 적용(조건 입력) → view_item_list와 select_item 사이의 관심 신호.
// filter_* 파라미터는 GA4 커스텀 측정기준이라 리포트에 쓰려면 등록 필요.
export interface FilterEvent {
  article?: string;
  budgetMax?: number | null;
  features?: string[];
  month?: number | null;
  topProduct?: string; // 현재 최상위 매칭 제품명
}

export function trackFilter(d: FilterEvent): void {
  send("filter_apply", {
    item_list_id: d.article,
    filter_budget_max: d.budgetMax ?? undefined,
    filter_features:
      d.features && d.features.length > 0 ? d.features.join(",") : undefined,
    filter_month: d.month ?? undefined,
    top_item: d.topProduct,
  });
}
