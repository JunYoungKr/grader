"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { normalizeContentCopy } from "@/lib/display-copy";

type RecentItem = { slug: string; title: string };

const KEY = "grader:recent";
const MAX = 5;

function readList(): RecentItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as RecentItem[]) : [];
    return Array.isArray(list)
      ? list.filter((item) => item && typeof item.slug === "string" && typeof item.title === "string").map((item) => normalizeContentCopy(item))
      : [];
  } catch {
    return [];
  }
}

// 글 조회 시 최근 목록에 기록 (UI 없음)
export function RecordView({ slug, title }: RecentItem) {
  useEffect(() => {
    try {
      const next = [
        { slug, title },
        ...readList().filter((i) => i.slug !== slug),
      ].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* localStorage 불가 환경 무시 */
    }
  }, [slug, title]);
  return null;
}

// 최근 본 제품 최대 5개 — 클릭 시 해당 글로 이동
export function RecentlyViewed({
  currentSlug,
  className = "",
}: {
  currentSlug?: string;
  className?: string;
}) {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    setItems(readList().filter((i) => i.slug !== currentSlug).slice(0, MAX));
  }, [currentSlug]);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="최근 본 제품"
      className={`rounded-lg border border-hairline bg-paper p-4 text-sm ${className}`}
    >
      <p className="mb-2.5 text-xs font-medium tracking-[0.04em] text-faint">
        최근 본 제품
      </p>
      <ul className="space-y-1.5">
        {items.map((i) => (
          <li key={i.slug}>
            <Link
              href={`/${i.slug}`}
              className="block truncate text-muted transition-colors hover:text-ink"
            >
              {i.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
