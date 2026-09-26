import { GRADE_STYLES } from "@/lib/grade";
import type { Grade } from "@/lib/types";

// 등급 시그니처 배지. solid(채움) / soft(틴트) 두 변형.
// S만 골드 그라데이션(시스템 유일) — 그림자·링 없이 색으로만 말한다.
export function GradeBadge({
  grade,
  size = "md",
  variant = "solid",
}: {
  grade: Grade;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "soft";
}) {
  const s = GRADE_STYLES[grade];
  const dim =
    size === "sm"
      ? "h-[22px] w-[22px] rounded-[6px] text-xs"
      : size === "lg"
        ? "h-11 w-11 rounded-lg text-[28px]"
        : "h-[30px] w-[30px] rounded-md text-lg";
  const style =
    variant === "soft"
      ? { background: s.soft, color: s.inkText }
      : { background: s.gradient ?? s.bg, color: s.text };
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center font-medium leading-none ${dim}`}
      style={style}
      aria-label={`등급 ${grade}, ${s.label}`}
    >
      {grade}
    </span>
  );
}
