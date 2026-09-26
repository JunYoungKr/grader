"use client";

import { useEffect, useRef } from "react";
import { trackSearchResults } from "@/lib/gtag";

export function SearchResultsTracking({ category, articleCount, productCount }: {
  category: string;
  articleCount: number;
  productCount: number;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackSearchResults({ category, articleCount, productCount });
  }, [category, articleCount, productCount]);
  return null;
}
