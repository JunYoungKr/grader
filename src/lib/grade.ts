import type { Grade } from "./types";

// 등급 시그니처 — 실제 색 값은 globals.css의 --grade-* 토큰(라이트/다크 두 벌).
// 여기서는 토큰 참조만 관리해 다크모드가 자동으로 따라오게 한다.
export const GRADE_STYLES: Record<
  Grade,
  {
    bg: string;
    text: string;
    label: string;
    gradient?: string; // S 전용 — 시스템에서 유일하게 허용된 그라데이션
    soft: string; // 틴트 배경 (soft 배지·행 하이라이트)
    inkText: string; // paper/surface 위에 올리는 등급색 텍스트
  }
> = {
  S: {
    bg: "var(--grade-s)",
    gradient: "var(--grade-s-gradient)",
    text: "var(--grade-s-fg)",
    soft: "var(--grade-s-soft)",
    inkText: "var(--grade-s-ink)",
    label: "최상위",
  },
  A: {
    bg: "var(--grade-a)",
    text: "var(--grade-a-fg)",
    soft: "var(--grade-a-soft)",
    inkText: "var(--grade-a-ink)",
    label: "우수",
  },
  B: {
    bg: "var(--grade-b)",
    text: "var(--grade-b-fg)",
    soft: "var(--grade-b-soft)",
    inkText: "var(--grade-b-ink)",
    label: "보통",
  },
  C: {
    bg: "var(--grade-c)",
    text: "var(--grade-c-fg)",
    soft: "var(--grade-c-soft)",
    inkText: "var(--grade-c-ink)",
    label: "입문",
  },
};

export function formatPrice(won: number): string {
  return `₩${won.toLocaleString("ko-KR")}`;
}
