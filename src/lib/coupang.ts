// 쿠팡 파트너스 Open API 클라이언트 (서버 전용)
//
// - 절대 클라이언트 컴포넌트에서 import하지 마세요. 키가 노출됩니다.
//   (스크립트, Route Handler, generateStaticParams 등 서버 환경에서만 사용)
// - 키 발급: 쿠팡 파트너스 → Tools → 파트너스 API (Access Key / Secret Key)
//   .env.local 에 COUPANG_ACCESS_KEY / COUPANG_SECRET_KEY 저장
// - HMAC 서명은 생성 후 5분간만 유효하므로 호출마다 새로 생성합니다.
// - Search API는 호출 제한이 있습니다(현재 가이드 기준 분당 최대 50회, 최대 10개 상품).
//   상세/최신 사양은 쿠팡 파트너스 공식 문서로 반드시 재확인하세요.

import crypto from "node:crypto";

const DOMAIN = "https://api-gateway.coupang.com";
const V1_BASE_PATH =
  "/v2/providers/affiliate_open_api/apis/openapi/v1";

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
  isFreeShipping?: boolean;
  categoryName: string;
  keyword?: string;
  rank?: number;
}

export interface CoupangDeeplink {
  originalUrl: string;
  shortenUrl: string;
  landingUrl: string;
}

interface CoupangApiResponse<T> {
  rCode: string;
  rMessage?: string;
  data: T;
}

export interface CoupangProductQuery {
  subId?: string;
  imageSize?: string;
}

function addProductQuery(
  params: URLSearchParams,
  options: CoupangProductQuery,
): void {
  if (options.subId) params.set("subId", options.subId);
  if (options.imageSize) params.set("imageSize", options.imageSize);
}

function validateLimit(limit: number, max: number): void {
  if (!Number.isInteger(limit) || limit < 1 || limit > max) {
    throw new RangeError(`limit은 1~${max} 사이의 정수여야 합니다.`);
  }
}

async function requestJson<T>(
  method: "GET" | "POST",
  urlPath: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(DOMAIN + urlPath, {
    method,
    headers: {
      Authorization: authorization(method, urlPath),
      "Content-Type": "application/json;charset=UTF-8",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!res.ok) {
    throw new Error(`Coupang API 실패: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as CoupangApiResponse<T>;
  if (json.rCode !== "0") {
    throw new Error(
      `Coupang API 오류 ${json.rCode}: ${json.rMessage || "알 수 없는 오류"}`,
    );
  }
  return json.data;
}

// 키워드로 상품 검색 → 실제 이름·가격·이미지·추적 URL을 반환
export async function searchProducts(
  keyword: string,
  limit = 10,
  options: CoupangProductQuery = {},
): Promise<CoupangProduct[]> {
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) throw new Error("검색 키워드가 필요합니다.");
  validateLimit(limit, 10);

  const params = new URLSearchParams({
    keyword: normalizedKeyword,
    limit: String(limit),
  });
  addProductQuery(params, options);
  const urlPath = `${V1_BASE_PATH}/products/search?${params}`;
  const data = await requestJson<{ productData?: CoupangProduct[] }>(
    "GET",
    urlPath,
  );
  return data.productData ?? [];
}

// 카테고리별 베스트 상품 조회. 공식 카테고리 ID를 사용합니다.
export async function getBestCategoryProducts(
  categoryId: number,
  limit = 20,
  options: CoupangProductQuery = {},
): Promise<CoupangProduct[]> {
  if (!Number.isInteger(categoryId) || categoryId < 1) {
    throw new Error("유효한 쿠팡 카테고리 ID가 필요합니다.");
  }
  validateLimit(limit, 100);
  const params = new URLSearchParams({ limit: String(limit) });
  addProductQuery(params, options);
  return requestJson<CoupangProduct[]>(
    "GET",
    `${V1_BASE_PATH}/products/bestcategories/${categoryId}?${params}`,
  );
}

// 매일 오전 7:30경 갱신되는 골드박스 상품 조회.
export async function getGoldboxProducts(
  options: CoupangProductQuery = {},
): Promise<CoupangProduct[]> {
  const params = new URLSearchParams();
  addProductQuery(params, options);
  const query = params.size > 0 ? `?${params}` : "";
  return requestJson<CoupangProduct[]>(
    "GET",
    `${V1_BASE_PATH}/products/goldbox${query}`,
  );
}

// 일반 쿠팡 상품 URL을 파트너스 추적 딥링크로 변환
export async function createDeeplinks(
  coupangUrls: string[],
  subId?: string,
): Promise<CoupangDeeplink[]> {
  if (coupangUrls.length < 1 || coupangUrls.length > 20) {
    throw new RangeError("딥링크 변환 URL은 한 번에 1~20개여야 합니다.");
  }
  const urlPath = `${V1_BASE_PATH}/deeplink`;
  return requestJson<CoupangDeeplink[]>("POST", urlPath, {
    coupangUrls,
    ...(subId ? { subId } : {}),
  });
}
