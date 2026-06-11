/**
 * 기존 코드 콘텐츠(src/content/products/*.ts) → Supabase articles 테이블 시드.
 *
 * 사용법:
 *   npm run seed:articles          # 업서트 실행
 *   npm run seed:articles -- --dry # DB 없이 변환 결과만 출력(검증용)
 *
 * 필요 env (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Article } from "../src/lib/types";
import { lowSugarStarterArticle } from "../src/content/products/low-sugar-starter";
import { pantsHemClipArticle } from "../src/content/products/pants-hem-clip";
import { pepsiZeroLimeArticle } from "../src/content/products/pepsi-zero-lime";
import { harimChickenBreastArticle } from "../src/content/products/harim-chicken-breast";
import { kelloggsRealGranolaArticle } from "../src/content/products/kelloggs-real-granola";
import { mynormalAlluloseArticle } from "../src/content/products/mynormal-allulose";

// .env.local 간이 로더 (의존성 없이)
const envPath = resolve(import.meta.dirname ?? __dirname, "../.env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

const articles: Article[] = [
  lowSugarStarterArticle,
  pantsHemClipArticle,
  pepsiZeroLimeArticle,
  harimChickenBreastArticle,
  kelloggsRealGranolaArticle,
  mynormalAlluloseArticle,
];

const rows = articles.map((a, i) => ({
  slug: a.slug,
  category: a.category,
  type: a.type,
  title: a.title,
  description: a.description,
  updated: a.updated,
  medical: Boolean(a.medical),
  summary: a.summary,
  axes: a.axes ?? null,
  products: a.products ?? null,
  promo_banner: a.promoBanner ?? null,
  sections: a.sections ?? null,
  checklist: a.checklist ?? null,
  related: a.related ?? null,
  sources: a.sources ?? null,
  published: true,
  sort_order: (i + 1) * 10,
}));

async function main() {
  if (process.argv.includes("--dry")) {
    console.log(JSON.stringify(rows, null, 2));
    console.log(`\n[dry] ${rows.length}개 글 변환 OK (업서트 안 함)`);
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY를 .env.local에 설정하세요.");
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await sb.from("articles").upsert(rows, { onConflict: "slug" });
  if (error) {
    console.error("시드 실패:", error.message);
    process.exit(1);
  }
  console.log(`시드 완료 — ${rows.length}개 글 업서트:`);
  for (const r of rows) console.log(`  - ${r.slug} (${r.category})`);
}

main();
