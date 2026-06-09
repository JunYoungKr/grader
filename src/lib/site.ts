// || (??가 아님): 빈 문자열도 폴백 처리 — .env에 빈 값(=)이 있어도 빌드가 안 깨지게
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://grader.co.kr";

export const SITE_NAME = "Grader";

// 교체해야 할 플레이스홀더 (E-E-A-T·문의 — 한 곳에서 관리)
export const OPERATOR_NAME = "[운영자 실명]"; // TODO: 실명으로 교체
export const CONTACT_EMAIL = "hello@grader.co.kr"; // TODO: 실제 문의 메일로 교체

// "2026.06" → Date (sitemap lastModified용)
export function parseUpdated(updated: string): Date {
  const [y, m] = updated.split(".").map((n) => Number(n));
  if (y && m) return new Date(Date.UTC(y, m - 1, 1));
  return new Date();
}
