import { ExternalIcon } from "./ExternalIcon";
import { PROVIDERS } from "@/lib/providers";
import type { Grade, Provider } from "@/lib/types";
export interface AffiliateTracking {
  article?: string;
  productId?: string | number;
  product?: string;
  grade?: Grade;
  category?: string;
  price?: number;
  placement?: string;
  recommended?: boolean;
}
export function AffiliateButton({
  href,
  provider,
  size = "md",
  primary = true,
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
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      className={`button w-full ${primary ? "button-primary" : "button-secondary"} ${size === "sm" ? "px-3" : ""}`}
      data-ga="affiliate"
      data-ga-provider={provider}
      data-ga-article={track?.article}
      data-ga-product-id={track?.productId}
      data-ga-product={track?.product}
      data-ga-grade={track?.grade}
      data-ga-category={track?.category}
      data-ga-price={track?.price}
      data-ga-placement={track?.placement}
      data-ga-recommended={track?.recommended ? "true" : undefined}
    >
      <span className="flex flex-col items-center py-1 leading-snug">
        <span className="inline-flex items-center gap-2">
          {label ?? p.cta}
          <ExternalIcon />
        </span>
        {size !== "sm" && (
          <span className="mt-1 text-caption opacity-80">
            {p.label} 제휴 링크
          </span>
        )}
      </span>
    </a>
  );
}
