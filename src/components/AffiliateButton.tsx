import { ExternalIcon } from "./ExternalIcon";
import { PROVIDERS } from "@/lib/providers";
import type { Grade, Provider } from "@/lib/types";

// 클릭 추적 컨텍스트. data-ga-* 속성으로 내려보내고 전역 리스너(Analytics)가 읽는다.
export interface AffiliateTracking {
  article?: string; // 글 slug
  product?: string; // 제품명
  grade?: Grade; // 등급
  placement?: string; // comparison_table | sticky_cta | product_card
  recommended?: boolean;
}

export function AffiliateButton({
  href,
  provider,
  primary = false,
  label,
  track,
}: {
  href: string;
  provider: Provider;
  primary?: boolean;
  label?: string;
  track?: AffiliateTracking;
}) {
  const base =
    "inline-flex w-full items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-medium transition-colors";
  const variant = primary
    ? "bg-brand text-on-brand hover:opacity-90"
    : "border border-hairline text-ink hover:bg-paper";
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      className={`${base} ${variant}`}
      data-ga="affiliate"
      data-ga-provider={provider}
      data-ga-article={track?.article}
      data-ga-product={track?.product}
      data-ga-grade={track?.grade}
      data-ga-placement={track?.placement}
      data-ga-recommended={track?.recommended ? "true" : undefined}
    >
      {label ?? PROVIDERS[provider].cta}
      <ExternalIcon />
    </a>
  );
}
