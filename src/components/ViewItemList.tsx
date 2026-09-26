"use client";

import { useEffect, useRef } from "react";
import { trackViewItemList } from "@/lib/gtag";
import type { Grade, Provider } from "@/lib/types";

// 실제 상품 영역이 보일 때만 전송한다. 높이가 없는 표식은 사용하지 않는다.
// 전체 Product가 아니라 추적에 필요한 필드만 받아 클라이언트 페이로드를 가볍게 유지.
export function ViewItemList({
  article,
  items,
  children,
}: {
  article: string;
  children: React.ReactNode;
  items: {
    id: string;
    name: string;
    provider: Provider;
    grade?: Grade;
    category?: string;
    price?: number;
  }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !fired.current) {
          fired.current = true;
          trackViewItemList(article, items);
          io.disconnect();
        }
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [article, items]);

  return <div ref={ref}>{children}</div>;
}
