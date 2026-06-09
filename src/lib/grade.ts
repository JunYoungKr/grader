import type { Grade } from "./types";

export const GRADE_STYLES: Record<
  Grade,
  {
    bg: string;
    text: string;
    label: string;
    gradient?: string; // S 스페셜 등 그라데이션
    glow?: string; // 스페셜 등급의 발광 그림자
  }
> = {
  // S = 골드 스페셜 (그라데이션 + 골드 글로우)
  S: {
    bg: "#C2890F",
    gradient: "linear-gradient(135deg, #F2CF5E 0%, #C2890F 100%)",
    glow: "0 1px 8px rgba(194, 137, 15, 0.5)",
    text: "#3B2A02",
    label: "최상위",
  },
  A: { bg: "#157A56", text: "#FFFFFF", label: "우수" }, // 그린
  B: { bg: "#3F6DA3", text: "#FFFFFF", label: "보통" }, // 블루
  C: { bg: "#8C8C84", text: "#FFFFFF", label: "입문" }, // 그레이
};

export function formatPrice(won: number): string {
  return `₩${won.toLocaleString("ko-KR")}`;
}
