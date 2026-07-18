"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  gaEnabled,
  trackSelectItem,
  trackSelectPromotion,
  trackTocClick,
} from "@/lib/gtag";
import type { Grade, Provider } from "@/lib/types";

export function Analytics() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  // 클릭 위임: data-ga 속성이 달린 링크 하나만 듣는다 → 컴포넌트는 서버로 유지.
  useEffect(() => {
    if (!gaEnabled || isAdmin) return;
    function onClick(e: MouseEvent) {
      const el = (e.target as Element | null)?.closest?.("a[data-ga]");
      if (!(el instanceof HTMLElement)) return;
      const d = el.dataset;
      if (d.ga === "affiliate") {
        trackSelectItem({
          article: d.gaArticle,
          productId: d.gaProductId,
          product: d.gaProduct,
          grade: d.gaGrade as Grade | undefined,
          category: d.gaCategory,
          price: d.gaPrice ? Number(d.gaPrice) : undefined,
          provider: d.gaProvider as Provider | undefined,
          placement: d.gaPlacement,
          recommended: d.gaRecommended === "true",
        });
      } else if (d.ga === "promotion") {
        trackSelectPromotion({
          article: d.gaArticle,
          name: d.gaPromotionName,
          provider: d.gaProvider as Provider | undefined,
        });
      } else if (d.ga === "toc") {
        trackTocClick(d.gaTarget ?? "", d.gaArticle);
      }
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [isAdmin]);

  return null;
}
