/**
 * 쿠팡 키워드 검색 → 사람 검수용 비교글 초안 생성
 *
 * 실제 발행 파일이 아닌 `.draft.ts`만 만들며 content.ts에는 자동 등록하지 않는다.
 * 등급·추천·스펙은 쿠팡 API가 제공하지 않으므로 반드시 사람이 검수한다.
 */

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { categories } from "../src/content/categories";
import {
  searchProducts,
  type CoupangProduct,
} from "../src/lib/coupang";

loadEnvConfig(process.cwd());

interface Options {
  slug: string;
  category: string;
  keyword: string;
  limit: number;
  subId?: string;
  dryRun: boolean;
  force: boolean;
  stdout: boolean;
}

function usage(): string {
  return `사용법:
  npm run build:coupang -- \\
    --slug=zero-cola-grade-2026 \\
    --category=food \\
    --keyword="제로 콜라" \\
    --limit=5

옵션:
  --sub-id=ID   쿠팡 파트너스에 등록된 채널 ID (기본: COUPANG_SUB_ID)
  --dry-run     키 없이 예시 상품으로 생성 흐름 검증
  --stdout      파일을 쓰지 않고 생성 결과만 출력
  --force       기존 .draft.ts 파일 덮어쓰기`;
}

function optionalSubId(value?: string): string | undefined {
  const normalized = value?.trim();
  if (!normalized) return undefined;
  const placeholders = new Set([
    "등록한_채널_ID",
    "YOUR_SUB_ID",
    "your_sub_id",
    "SUB_ID",
  ]);
  return placeholders.has(normalized) ? undefined : normalized;
}

function parseArgs(argv: string[]): Options {
  const values = new Map<string, string>();
  const flags = new Set<string>();

  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const equals = arg.indexOf("=");
    if (equals === -1) flags.add(arg.slice(2));
    else values.set(arg.slice(2, equals), arg.slice(equals + 1));
  }

  const slug = values.get("slug")?.trim() ?? "";
  const category = values.get("category")?.trim() ?? "";
  const keyword = values.get("keyword")?.trim() ?? "";
  const limit = Number(values.get("limit") ?? 5);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("--slug는 영문 소문자·숫자·하이픈 형식이어야 합니다.");
  }
  if (!categories.some((item) => item.slug === category)) {
    throw new Error(
      `--category는 다음 중 하나여야 합니다: ${categories.map((item) => item.slug).join(", ")}`,
    );
  }
  if (!keyword) throw new Error("--keyword가 필요합니다.");
  if (!Number.isInteger(limit) || limit < 1 || limit > 10) {
    throw new Error("--limit은 1~10 사이의 정수여야 합니다.");
  }

  return {
    slug,
    category,
    keyword,
    limit,
    subId: optionalSubId(values.get("sub-id") ?? process.env.COUPANG_SUB_ID),
    dryRun: flags.has("dry-run"),
    force: flags.has("force"),
    stdout: flags.has("stdout"),
  };
}

function kstDate(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function mockProducts(keyword: string, limit: number): CoupangProduct[] {
  return Array.from({ length: limit }, (_, index) => ({
    productId: 900000000 + index,
    productName: `${keyword} 검수용 예시 ${index + 1}`,
    productPrice: 10000 + index * 2500,
    productImage: "https://static.coupangcdn.com/image/product/mock.jpg",
    productUrl: `https://link.coupang.com/mock/${index + 1}`,
    isRocket: index % 2 === 0,
    isFreeShipping: true,
    categoryName: "검수용 카테고리",
    keyword,
    rank: index + 1,
  }));
}

function q(value: unknown): string {
  return JSON.stringify(value);
}

function normalizeImageUrl(value: string): string {
  return value.replace(/^http:\/\//, "https://");
}

function renderDraft(options: Options, products: CoupangProduct[]): string {
  const checkedAt = kstDate();
  const updated = checkedAt.slice(0, 7).replace("-", ".");
  const productBlocks = products
    .map(
      (product, index) => `    {
      id: ${q(`${options.slug}-${product.productId}-${index + 1}`)},
      coupangProductId: ${product.productId},
      name: ${q(product.productName)},
      imageUrl: ${q(normalizeImageUrl(product.productImage))},
      type: "", // TODO: 제품 유형 검수
      descriptor: "", // TODO: 핵심 차이 한 줄
      grade: "C", // TODO: 1차 출처와 평가 기준으로 재판정
      priceExample: ${product.productPrice},
      priceCheckedAt: ${q(checkedAt)},
      provider: "coupang",
      affiliateUrl: ${q(product.productUrl)},
      isRocket: ${Boolean(product.isRocket)},
      isFreeShipping: ${Boolean(product.isFreeShipping)},
      ${index === 0 ? "// recommended: true, // TODO: 사람 검수 후 1개만 지정\n      " : ""}specs: [], // TODO: 공식 스펙·성분·인증 정보
    }`,
    )
    .join(",\n");

  return `import type { Article } from "@/lib/types";

// AUTO-GENERATED REVIEW DRAFT
// 검색어: ${options.keyword}
// 생성일: ${checkedAt}
// 주의: 쿠팡 검색 결과의 이름·가격·이미지·링크만 자동 반영했습니다.
// 등급·추천·평가축·스펙은 반드시 사람이 1차 출처를 확인한 뒤 작성하세요.
// 검수가 끝날 때까지 content.ts에 등록하지 마세요.
export const draftArticle: Article = {
  slug: ${q(options.slug)},
  category: ${q(options.category)},
  type: "comparison",
  title: ${q(`${options.keyword} 비교 — 검수 필요`)},
  description: "", // TODO: 누구의 어떤 구매 결정을 돕는지 작성
  updated: ${q(updated)},
  summary: [
    "TODO: 대부분에게 맞는 결론",
    "TODO: 가성비 또는 특정 조건 추천",
    "TODO: 선택 전 주의사항",
  ],
  axes: [], // TODO: 같은 기준으로 비교 가능한 평가축
  products: [
${productBlocks}
  ],
  sources: [], // TODO: 제조사·공공기관·전문기관 1차 출처
};
`;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  let options: Options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`✗ ${(error as Error).message}\n\n${usage()}`);
    process.exitCode = 1;
    return;
  }

  if (!options.dryRun && (!process.env.COUPANG_ACCESS_KEY || !process.env.COUPANG_SECRET_KEY)) {
    console.error("✗ COUPANG_ACCESS_KEY / COUPANG_SECRET_KEY가 필요합니다. 키 없이 검증하려면 --dry-run을 사용하세요.");
    process.exitCode = 1;
    return;
  }

  const products = options.dryRun
    ? mockProducts(options.keyword, options.limit)
    : await searchProducts(options.keyword, options.limit, {
        subId: options.subId,
        imageSize: "512x512",
      });

  if (products.length === 0) {
    throw new Error(`검색 결과가 없습니다: ${options.keyword}`);
  }

  const draft = renderDraft(options, products);
  if (options.stdout) {
    process.stdout.write(draft);
    return;
  }

  const outputDir = path.join(process.cwd(), "src/content/products");
  const outputPath = path.join(outputDir, `${options.slug}.draft.ts`);
  if (!options.force && (await exists(outputPath))) {
    throw new Error(`이미 파일이 있습니다: ${outputPath}\n덮어쓰려면 --force를 사용하세요.`);
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, draft, "utf8");
  console.log(`✓ 검수용 초안 생성: ${outputPath}`);
  console.log("  다음 단계: 공식 스펙·출처·평가축·등급 검수 → .draft 제거 → content.ts 수동 등록");
}

main().catch((error) => {
  console.error(`✗ ${(error as Error).message}`);
  process.exitCode = 1;
});
