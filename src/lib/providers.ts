import type { Provider } from "./types";

export const PROVIDERS: Record<
  Provider,
  { label: string; cta: string; disclosure: string }
> = {
  coupang: {
    label: "쿠팡",
    cta: "쿠팡 가격과 옵션 확인",
    disclosure: "쿠팡 파트너스",
  },
  iherb: {
    label: "아이허브",
    cta: "아이허브에서 보기",
    disclosure: "아이허브 리워드(추천) 프로그램",
  },
  linkprice: {
    label: "링크프라이스",
    cta: "판매처에서 확인",
    disclosure: "링크프라이스 제휴",
  },
  tenping: {
    label: "텐핑",
    cta: "판매처에서 확인",
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
    .join(" 및 ");
  return `이 페이지는 ${names} 활동의 일환으로 일정액의 수수료를 제공받습니다. 구매 전 판매처에서 최신 가격과 옵션을 확인해 주세요.`;
}
