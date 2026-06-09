import { GRADE_STYLES } from "@/lib/grade";
import type { Grade } from "@/lib/types";

export function GradeBadge({
  grade,
  size = "md",
}: {
  grade: Grade;
  size?: "sm" | "md";
}) {
  const s = GRADE_STYLES[grade];
  const dim =
    size === "sm"
      ? "h-7 w-7 rounded-md text-base"
      : "h-10 w-10 rounded-lg text-xl";
  const special = Boolean(s.gradient);
  return (
    <span
      className={`inline-flex items-center justify-center font-semibold ${
        special ? "" : "ring-inset ring-hairline dark:ring-1"
      } ${dim}`}
      style={{
        background: s.gradient ?? s.bg,
        color: s.text,
        boxShadow: s.glow,
      }}
      aria-label={`등급 ${grade} · ${s.label}`}
    >
      {grade}
    </span>
  );
}
