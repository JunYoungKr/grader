"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import {
  GA_ID,
  gaEnabled,
  pageview,
  trackSelectItem,
  trackTocClick,
} from "@/lib/gtag";
import type { Grade, Provider } from "@/lib/types";

// 라우트 변경마다 페이지뷰 전송 (App Router는 수동). useSearchParams는 Suspense 필요.
function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    const qs = searchParams?.toString();
    pageview(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, searchParams]);
  return null;
}

export function Analytics() {
  // 클릭 위임: data-ga 속성이 달린 링크 하나만 듣는다 → 컴포넌트는 서버로 유지.
  useEffect(() => {
    if (!gaEnabled) return;
    function onClick(e: MouseEvent) {
      const el = (e.target as Element | null)?.closest?.("a[data-ga]");
      if (!(el instanceof HTMLElement)) return;
      const d = el.dataset;
      if (d.ga === "affiliate") {
        trackSelectItem({
          article: d.gaArticle,
          product: d.gaProduct,
          grade: d.gaGrade as Grade | undefined,
          provider: d.gaProvider as Provider | undefined,
          placement: d.gaPlacement,
          recommended: d.gaRecommended === "true",
        });
      } else if (d.ga === "toc") {
        trackTocClick(d.gaTarget ?? "", d.gaArticle);
      }
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  if (!gaEnabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:false});`}
      </Script>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
    </>
  );
}
