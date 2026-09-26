/**
 * 쿠팡 카테고리 베스트 API → 카테고리 페이지용 정적 스냅샷.
 *
 * 판매량 수치나 Grader 등급을 만들지 않는다. 개별 비교 글도 자동 발행하지 않는다.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { categories } from "../src/content/categories";
import {
  COUPANG_ALLOWED_CATEGORY_NAMES,
  COUPANG_CATEGORY_SOURCES,
} from "../src/lib/coupang-categories";
import {
  getBestCategoryProducts,
  type CoupangProduct,
} from "../src/lib/coupang";
import type {
  PopularProduct,
  PopularProductSnapshot,
} from "../src/lib/types";

loadEnvConfig(process.cwd());

const PRODUCTS_PER_CATEGORY = 20;
const API_FETCH_LIMIT = 100;
const OUTPUT_PATH = path.join(
  process.cwd(),
  "src/content/coupang-bestsellers.json",
);

function kstDate(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function roundRobin<T>(batches: T[][], limit: number): T[] {
  const result: T[] = [];
  for (let index = 0; result.length < limit; index += 1) {
    let added = false;
    for (const batch of batches) {
      const item = batch[index];
      if (item !== undefined) {
        result.push(item);
        added = true;
        if (result.length === limit) break;
      }
    }
    if (!added) break;
  }
  return result;
}

function uniqueProducts(products: CoupangProduct[]): CoupangProduct[] {
  const seen = new Set<number>();
  return products.filter((product) => {
    const valid = Boolean(
      product.productId &&
        product.productName &&
        product.productImage &&
        product.productUrl,
    );
    if (!valid || seen.has(product.productId)) return false;
    seen.add(product.productId);
    return true;
  });
}

function uniqueSelections<T extends { product: CoupangProduct }>(items: T[]): T[] {
  const seen = new Set<number>();
  return items.filter(({ product }) => {
    if (seen.has(product.productId)) return false;
    seen.add(product.productId);
    return true;
  });
}

async function main(): Promise<void> {
  if (!process.env.COUPANG_ACCESS_KEY || !process.env.COUPANG_SECRET_KEY) {
    throw new Error(
      "COUPANG_ACCESS_KEY / COUPANG_SECRET_KEY가 필요합니다 (.env.local).",
    );
  }

  const checkedAt = kstDate();
  const snapshot: PopularProductSnapshot = {
    generatedAt: new Date().toISOString(),
    categories: {},
  };

  for (const category of categories) {
    const sources = COUPANG_CATEGORY_SOURCES[category.slug];
    const allowedCategoryNames =
      COUPANG_ALLOWED_CATEGORY_NAMES[category.slug];
    if (!sources?.length || !allowedCategoryNames?.length) {
      throw new Error(`쿠팡 카테고리 매핑이 없습니다: ${category.slug}`);
    }

    const batches: Array<
      Array<{ product: CoupangProduct; sourceId: number; sourceLabel: string }>
    > = [];
    for (const source of sources) {
      const products = await getBestCategoryProducts(
        source.id,
        API_FETCH_LIMIT,
        { imageSize: "512x512" },
      );
      batches.push(
        uniqueProducts(products)
          .filter((product) =>
            allowedCategoryNames.includes(product.categoryName),
          )
          .map((product) => ({
            product,
            sourceId: source.id,
            sourceLabel: source.label,
          })),
      );
    }

    const candidates = roundRobin(
      batches,
      batches.reduce((total, batch) => total + batch.length, 0),
    );
    const selected = uniqueSelections(candidates).slice(0, PRODUCTS_PER_CATEGORY);
    if (selected.length < PRODUCTS_PER_CATEGORY) {
      throw new Error(
        `${category.name} 상품이 ${selected.length}개뿐입니다 (필요: ${PRODUCTS_PER_CATEGORY}).`,
      );
    }

    snapshot.categories[category.slug] = selected.map(
      ({ product, sourceId, sourceLabel }, index): PopularProduct => ({
        id: `${category.slug}-${product.productId}-${index + 1}`,
        coupangProductId: product.productId,
        name: product.productName,
        imageUrl: product.productImage.replace(/^http:\/\//, "https://"),
        price: product.productPrice,
        priceCheckedAt: checkedAt,
        affiliateUrl: product.productUrl,
        isRocket: Boolean(product.isRocket),
        isFreeShipping: Boolean(product.isFreeShipping),
        categoryName: product.categoryName || sourceLabel,
        sourceCategoryId: sourceId,
        sourceCategoryLabel: sourceLabel,
        position: index + 1,
      }),
    );

    console.log(`✓ ${category.name}: ${selected.length}개`);
  }

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(`✓ 스냅샷 저장: ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(`✗ ${(error as Error).message}`);
  process.exitCode = 1;
});
