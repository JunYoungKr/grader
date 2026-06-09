import type { Provider } from "./types";

export const PROVIDERS: Record<
  Provider,
  { label: string; cta: string; disclosure: string }
> = {
  coupang: {
    label: "쿠팡",
    cta: "쿠팡 최저가 보기",
    disclosure: "쿠팡 파트너스",
  },
  iherb: {
    label: "아이허브",
    cta: "아이허브에서 보기",
    disclosure: "아이허브 리워드(추천) 프로그램",
  },
  linkprice: {
    label: "링크프라이스",
    cta: "최저가 보기",
    disclosure: "링크프라이스 제휴",
  },
  tenping: {
    label: "텐핑",
    cta: "최저가 보기",
    disclosure: "텐핑 제휴",
  },
};

export const SITE_PROVIDERS: Provider[] = ["coupang", "iherb"];

export function uniqueProviders(list: Provider[]): Provider[] {
  return Array.from(new Set(list));
}

export function buildDisclosure(providers: Provider[]): string {
  const names = uniqueProviders(providers)
    .map((p) => PROVIDERS[p].disclosure)
    .join(" · ");
  return `이 페이지는 ${names} 활동의 일환으로 일정액의 수수료를 제공받습니다. 등급은 수수료와 무관하게 평가됩니다.`;
}
