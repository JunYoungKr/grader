// || (??가 아님): 빈 문자열도 폴백 처리 — .env에 빈 값(=)이 있어도 빌드가 안 깨지게
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://grader.co.kr";

export const SITE_NAME = "Grader";

// 실명은 설정된 경우에만 표시하고, 문의 주소는 확인된 수신 주소를 사용한다.
export const OPERATOR_NAME = process.env.SITE_OPERATOR_NAME || SITE_NAME;
export const CONTACT_EMAIL = "kop981020@naver.com";

// "2026.06" → Date (sitemap lastModified용)
export function parseUpdated(updated: string): Date {
  const [y, m] = updated.split(".").map((n) => Number(n));
  if (y && m) return new Date(Date.UTC(y, m - 1, 1));
  return new Date();
}
