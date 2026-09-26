import { PROVIDERS } from "@/lib/providers";
import type { PromoBanner as PromoBannerData } from "@/lib/types";

// 제휴처 공식 배너(쿠팡 파트너스 creative 등). 등급표와 별개로 노출.
// - href/referrerpolicy는 제휴처 추적에 필요하므로 원문 그대로 유지.
// - 사이트 원칙: rel="sponsored nofollow noopener" + data-ga로 프로모션 클릭 추적.
// - 외부 CDN 이미지라 next/image 대신 평범한 <img>(추적 임프레션 보존).
export function PromoBanner({
  banner,
  article,
}: {
  banner: PromoBannerData;
  article?: string;
}) {
  const provider = PROVIDERS[banner.provider];
  return (
    <aside className="mt-8 rounded-lg border border-hairline bg-surface p-5">
      <p className="text-small font-medium text-ink">{provider.cta}</p>
      <div className="mt-3 flex justify-center">
        <a
          href={banner.href}
          target="_blank"
          rel="sponsored nofollow noopener"
          referrerPolicy="unsafe-url"
          data-ga="promotion"
          data-ga-provider={banner.provider}
          data-ga-article={article}
          data-ga-promotion-name={banner.imageAlt}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.imageUrl}
            alt={banner.imageAlt}
            width={banner.width}
            height={banner.height}
          />
        </a>
      </div>
      <p className="mt-4 text-caption leading-relaxed text-faint">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를
        제공받습니다.
      </p>
    </aside>
  );
}
