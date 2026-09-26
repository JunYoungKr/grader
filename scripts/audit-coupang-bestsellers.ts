import { readFile } from "node:fs/promises";
import path from "node:path";
import { categories } from "../src/content/categories";
import {
  COUPANG_ALLOWED_CATEGORY_NAMES,
  COUPANG_CATEGORY_SOURCES,
} from "../src/lib/coupang-categories";
import type {
  PopularProduct,
  PopularProductSnapshot,
} from "../src/lib/types";

const SNAPSHOT_PATH = path.join(
  process.cwd(),
  "src/content/coupang-bestsellers.json",
);
const EXPECTED_PER_CATEGORY = 20;
const REMOTE_CONCURRENCY = 8;
const REMOTE_TIMEOUT_MS = 10_000;

interface Finding {
  severity: "error" | "warning";
  code: string;
  message: string;
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^0-9a-z가-힣]/g, "");
}

function addDuplicateFindings(
  products: Array<PopularProduct & { siteCategory: string }>,
  findings: Finding[],
): void {
  const checks = [
    {
      code: "duplicate-product-id",
      label: "쿠팡 productId",
      key: (product: PopularProduct) => String(product.coupangProductId),
    },
    {
      code: "duplicate-product-name",
      label: "정규화 상품명",
      key: (product: PopularProduct) => normalizeName(product.name),
    },
    {
      code: "duplicate-affiliate-url",
      label: "제휴 URL",
      key: (product: PopularProduct) => product.affiliateUrl,
    },
  ];

  for (const check of checks) {
    const groups = new Map<string, Array<PopularProduct & { siteCategory: string }>>();
    for (const product of products) {
      const key = check.key(product);
      const group = groups.get(key) ?? [];
      group.push(product);
      groups.set(key, group);
    }
    for (const [key, group] of groups) {
      if (group.length < 2) continue;
      findings.push({
        severity: "error",
        code: check.code,
        message: `${check.label} 중복 ${key}: ${group
          .map((product) => `${product.siteCategory} ${product.position}위`)
          .join(", ")}`,
      });
    }
  }
}

function auditSnapshot(snapshot: PopularProductSnapshot): Finding[] {
  const findings: Finding[] = [];
  const expectedSlugs = new Set(categories.map((category) => category.slug));
  const actualSlugs = new Set(Object.keys(snapshot.categories));
  const products: Array<PopularProduct & { siteCategory: string }> = [];

  if (Number.isNaN(Date.parse(snapshot.generatedAt))) {
    findings.push({
      severity: "error",
      code: "invalid-generated-at",
      message: `잘못된 generatedAt: ${snapshot.generatedAt}`,
    });
  }

  for (const slug of expectedSlugs) {
    if (!actualSlugs.has(slug)) {
      findings.push({
        severity: "error",
        code: "missing-category",
        message: `카테고리 누락: ${slug}`,
      });
    }
  }
  for (const slug of actualSlugs) {
    if (!expectedSlugs.has(slug)) {
      findings.push({
        severity: "error",
        code: "unknown-category",
        message: `알 수 없는 카테고리: ${slug}`,
      });
    }
  }

  for (const category of categories) {
    const categoryProducts = snapshot.categories[category.slug] ?? [];
    if (categoryProducts.length !== EXPECTED_PER_CATEGORY) {
      findings.push({
        severity: "error",
        code: "invalid-category-count",
        message: `${category.name}: ${categoryProducts.length}개 (필요: ${EXPECTED_PER_CATEGORY}개)`,
      });
    }

    const allowedNames = COUPANG_ALLOWED_CATEGORY_NAMES[category.slug] ?? [];
    const allowedSourceIds = new Set(
      (COUPANG_CATEGORY_SOURCES[category.slug] ?? []).map((source) => source.id),
    );

    categoryProducts.forEach((product, index) => {
      products.push({ ...product, siteCategory: category.slug });
      const label = `${category.name} ${index + 1}위 (${product.name || "상품명 없음"})`;

      if (product.position !== index + 1) {
        findings.push({
          severity: "error",
          code: "invalid-position",
          message: `${label}: position=${product.position}`,
        });
      }
      if (!product.id || !product.name || product.coupangProductId <= 0) {
        findings.push({
          severity: "error",
          code: "missing-required-field",
          message: `${label}: 필수 식별 필드 누락`,
        });
      }
      if (!Number.isFinite(product.price) || product.price <= 0) {
        findings.push({
          severity: "error",
          code: "invalid-price",
          message: `${label}: 가격 ${product.price}`,
        });
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(product.priceCheckedAt)) {
        findings.push({
          severity: "error",
          code: "invalid-price-date",
          message: `${label}: 가격 조회일 ${product.priceCheckedAt}`,
        });
      }
      if (!allowedNames.includes(product.categoryName)) {
        findings.push({
          severity: "error",
          code: "invalid-coupang-category",
          message: `${label}: 쿠팡 분류 ${product.categoryName}`,
        });
      }
      if (!allowedSourceIds.has(product.sourceCategoryId)) {
        findings.push({
          severity: "error",
          code: "invalid-source-category",
          message: `${label}: 소스 카테고리 ${product.sourceCategoryId}`,
        });
      }

      try {
        const affiliateUrl = new URL(product.affiliateUrl);
        if (
          affiliateUrl.protocol !== "https:" ||
          affiliateUrl.hostname !== "link.coupang.com" ||
          !affiliateUrl.searchParams.get("lptag") ||
          affiliateUrl.searchParams.get("pageKey") !==
            String(product.coupangProductId)
        ) {
          throw new Error("invalid affiliate URL");
        }
      } catch {
        findings.push({
          severity: "error",
          code: "invalid-affiliate-url",
          message: `${label}: ${product.affiliateUrl}`,
        });
      }

      try {
        const imageUrl = new URL(product.imageUrl);
        if (
          imageUrl.protocol !== "https:" ||
          !imageUrl.hostname.endsWith(".coupangcdn.com")
        ) {
          throw new Error("invalid image URL");
        }
      } catch {
        findings.push({
          severity: "error",
          code: "invalid-image-url",
          message: `${label}: ${product.imageUrl}`,
        });
      }
    });
  }

  addDuplicateFindings(products, findings);
  return findings;
}

async function checkRemoteUrl(
  url: string,
  kind: "affiliate" | "image",
): Promise<Finding | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REMOTE_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      signal: controller.signal,
      headers: { "User-Agent": "Grader product audit/1.0" },
    });
    if (response.status >= 200 && response.status < 400) return null;
    return {
      severity: "error",
      code: `remote-${kind}-status`,
      message: `${response.status} ${url}`,
    };
  } catch (error) {
    return {
      severity: "error",
      code: `remote-${kind}-failure`,
      message: `${error instanceof Error ? error.message : "요청 실패"} ${url}`,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function auditRemoteUrls(
  snapshot: PopularProductSnapshot,
): Promise<Finding[]> {
  const products = Object.values(snapshot.categories).flat();
  const targets = [
    ...products.map((product) => ({ url: product.affiliateUrl, kind: "affiliate" as const })),
    ...products.map((product) => ({ url: product.imageUrl, kind: "image" as const })),
  ];
  const findings: Finding[] = [];

  for (let index = 0; index < targets.length; index += REMOTE_CONCURRENCY) {
    const batch = targets.slice(index, index + REMOTE_CONCURRENCY);
    const results = await Promise.all(
      batch.map((target) => checkRemoteUrl(target.url, target.kind)),
    );
    findings.push(...results.filter((finding): finding is Finding => finding !== null));
  }
  return findings;
}

async function main(): Promise<void> {
  const snapshot = JSON.parse(
    await readFile(SNAPSHOT_PATH, "utf8"),
  ) as PopularProductSnapshot;
  const counts = Object.fromEntries(
    categories.map((category) => [
      category.slug,
      snapshot.categories[category.slug]?.length ?? 0,
    ]),
  );
  const findings = auditSnapshot(snapshot);

  if (process.argv.includes("--remote")) {
    console.log("원격 제휴 링크, 이미지 240건 확인 중...");
    findings.push(...(await auditRemoteUrls(snapshot)));
  }

  console.log(`카테고리: ${JSON.stringify(counts)}`);
  console.log(`총 상품: ${Object.values(snapshot.categories).flat().length}개`);
  if (findings.length === 0) {
    console.log("✓ 검수 통과");
    return;
  }

  for (const finding of findings) {
    console.error(
      `${finding.severity === "error" ? "✗" : "!"} [${finding.code}] ${finding.message}`,
    );
  }
  const errors = findings.filter((finding) => finding.severity === "error").length;
  console.error(`검수 결과: 오류 ${errors}건, 경고 ${findings.length - errors}건`);
  if (errors > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`✗ ${(error as Error).message}`);
  process.exitCode = 1;
});
