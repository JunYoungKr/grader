// || (??가 아님): 빈 문자열도 폴백 처리 — .env에 빈 값(=)이 있어도 빌드가 안 깨지게
export const SITE_URL =
  new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://grader.co.kr").origin;

export const SITE_NAME = "Grader";

// 개인 이름은 확인된 값만 사용하고, 기본 운영 주체는 사이트 브랜드로 표시한다.
export const OPERATOR_NAME = process.env.SITE_OPERATOR_NAME || SITE_NAME;
export const CONTACT_EMAIL = "kop981020@naver.com";
export const SITE_DESCRIPTION =
  "주방 정리부터 생활용품까지, 우리 집에 맞는 살림 방법과 제품을 찾아보세요. 구매 전 확인할 조건과 정보를 함께 안내합니다.";

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
