// || (??가 아님): 빈 문자열도 폴백 처리 — .env에 빈 값(=)이 있어도 빌드가 안 깨지게
export const SITE_URL =
  new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://grader.co.kr").origin;

export const SITE_NAME = "Grader";

// 개인 이름은 확인된 값만 사용하고, 기본 운영 주체는 사이트 브랜드로 표시한다.
export const OPERATOR_NAME = process.env.SITE_OPERATOR_NAME || SITE_NAME;
export const CONTACT_EMAIL = "kop981020@naver.com";
export const SITE_DESCRIPTION =
  "생활 제품을 안전성·성능·성분·가격으로 비교합니다. 제품별 특징과 평가 기준, 가격 조회 시점을 확인하고 나에게 맞는 제품을 선택하세요.";

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

// 월 단위 평가 기준일로 정확한 수정일을 만들어내지 않는다.
export function parseUpdated(updated?: string): Date | undefined {
  if (!updated || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(updated)) return undefined;
  const date = new Date(updated);
  if (!Number.isFinite(date.getTime())) return undefined;
  const calendarDate = new Date(`${updated.slice(0, 10)}T00:00:00.000Z`);
  if (calendarDate.toISOString().slice(0, 10) !== updated.slice(0, 10)) return undefined;
  return date;
}
