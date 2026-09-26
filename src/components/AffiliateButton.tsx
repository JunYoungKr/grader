import { ExternalIcon } from "./ExternalIcon";
import { PROVIDERS } from "@/lib/providers";
import type { Grade, Provider } from "@/lib/types";

// 클릭 추적 컨텍스트. data-ga-* 속성으로 내려보내고 전역 리스너(Analytics)가 읽는다.
export interface AffiliateTracking {
  article?: string; // 글 slug
  productId?: string | number; // 쿠팡 productId 또는 내부 ID
  product?: string; // 제품명
  grade?: Grade; // 등급
  category?: string; // 등급이 없는 카탈로그의 사이트 카테고리
  price?: number;
  placement?: string; // comparison_table | sticky_cta | product_card | sidebar_cta
  recommended?: boolean;
}

// 제휴 CTA — 일반 버튼과 의도적으로 구분: 브랜드 채움 + "제휴 링크" 표기로
// 투명한 상업적 행동임을 드러낸다. 카피는 사실형("최저가 보기")만, 과장 금지.
export function AffiliateButton({
  href,
  provider,
  size = "md",
  label,
  track,
}: {
  href: string;
  provider: Provider;
  size?: "sm" | "md";
  primary?: boolean;
  label?: string;
  track?: AffiliateTracking;
}) {
  const p = PROVIDERS[provider];
  const gaProps = {
    "data-ga": "affiliate",
    "data-ga-provider": provider,
    "data-ga-article": track?.article,
    "data-ga-product-id": track?.productId,
    "data-ga-product": track?.product,
    "data-ga-grade": track?.grade,
    "data-ga-category": track?.category,
    "data-ga-price": track?.price,
    "data-ga-placement": track?.placement,
    "data-ga-recommended": track?.recommended ? "true" : undefined,
  } as const;

  if (size === "sm") {
    return (
      <a
        href={href}
        target="_blank"
        rel="sponsored nofollow noopener"
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm font-medium text-on-brand transition-opacity hover:opacity-90"
        {...gaProps}
      >
        {label ?? "보기"}
        <ExternalIcon />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      className="inline-flex min-h-[46px] w-full items-center justify-center rounded-lg bg-brand px-4 py-2 transition-opacity hover:opacity-90"
      {...gaProps}
    >
      <span className="flex flex-col items-center leading-snug text-on-brand">
        <span className="inline-flex items-center gap-1.5 text-[15px] font-medium">
          {label ?? p.cta}
          <ExternalIcon />
        </span>
        <span className="text-xs opacity-75">{p.label} , 제휴 링크</span>
      </span>
    </a>
  );
}
