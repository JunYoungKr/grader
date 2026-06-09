// 쿠팡 파트너스 Open API 클라이언트 (서버 전용)
//
// - 절대 클라이언트 컴포넌트에서 import하지 마세요. 키가 노출됩니다.
//   (스크립트, Route Handler, generateStaticParams 등 서버 환경에서만 사용)
// - 키 발급: 쿠팡 파트너스 → Tools → 파트너스 API (Access Key / Secret Key)
//   .env.local 에 COUPANG_ACCESS_KEY / COUPANG_SECRET_KEY 저장
// - HMAC 서명은 생성 후 5분간만 유효하므로 호출마다 새로 생성합니다.
// - Search API는 호출 제한이 있습니다(가이드 기준 시간당 약 10회, 최대 10개 상품).
//   상세/최신 사양은 쿠팡 파트너스 공식 문서로 반드시 재확인하세요.

import crypto from "node:crypto";

const DOMAIN = "https://api-gateway.coupang.com";

function signedDateNow(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    p(d.getUTCFullYear() % 100) +
    p(d.getUTCMonth() + 1) +
    p(d.getUTCDate()) +
    "T" +
    p(d.getUTCHours()) +
    p(d.getUTCMinutes()) +
    p(d.getUTCSeconds()) +
    "Z"
  );
}

function authorization(method: string, urlPath: string): string {
  const accessKey = process.env.COUPANG_ACCESS_KEY;
  const secretKey = process.env.COUPANG_SECRET_KEY;
  if (!accessKey || !secretKey) {
    throw new Error(
      "COUPANG_ACCESS_KEY / COUPANG_SECRET_KEY 환경변수가 필요합니다 (.env.local).",
    );
  }
  const [path, query = ""] = urlPath.split("?");
  const signedDate = signedDateNow();
  const message = signedDate + method + path + query;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(message)
    .digest("hex");
  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${signedDate}, signature=${signature}`;
}

export interface CoupangProduct {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string;
  isRocket: boolean;
  categoryName: string;
}

export interface CoupangDeeplink {
  originalUrl: string;
  shortenUrl: string;
  landingUrl: string;
}

// 키워드로 상품 검색 → 실제 이름·가격·이미지·추적 URL을 반환
export async function searchProducts(
  keyword: string,
  limit = 10,
): Promise<CoupangProduct[]> {
  const urlPath =
    "/v2/providers/affiliate_open_api/apis/openapi/products/search" +
    `?keyword=${encodeURIComponent(keyword)}&limit=${limit}`;
  const res = await fetch(DOMAIN + urlPath, {
    method: "GET",
    headers: {
      Authorization: authorization("GET", urlPath),
      "Content-Type": "application/json;charset=UTF-8",
    },
  });
  if (!res.ok) {
    throw new Error(`Coupang search 실패: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json?.data?.productData ?? [];
}

// 일반 쿠팡 상품 URL을 파트너스 추적 딥링크로 변환
export async function createDeeplinks(
  coupangUrls: string[],
  subId?: string,
): Promise<CoupangDeeplink[]> {
  const urlPath =
    "/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink";
  const res = await fetch(DOMAIN + urlPath, {
    method: "POST",
    headers: {
      Authorization: authorization("POST", urlPath),
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify({ coupangUrls, ...(subId ? { subId } : {}) }),
  });
  if (!res.ok) {
    throw new Error(`Coupang deeplink 실패: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json?.data ?? [];
}
