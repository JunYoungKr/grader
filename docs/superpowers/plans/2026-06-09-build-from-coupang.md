# build-from-coupang Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 쿠팡 상품 링크를 받아 추적 딥링크(수익 링크)를 생성하고, 검수용 `Article` 초안(`src/content/products/<slug>.draft.ts`)을 써주는 CLI 스크립트를 만든다.

**Architecture:** 순수 함수(인자 파싱·매핑·렌더링·파일쓰기)를 export하고, 파일 끝에 entry 가드로 `main()`을 호출한다. 네트워크 호출(`createDeeplinks`)은 기존 `lib/coupang.ts`를 재사용하고, `--dry-run`은 mock 딥링크로 대체해 키 없이 검증한다. 등급·스펙·가격·문구는 자동으로 채우지 않고 TODO 주석이 달린 빈칸으로 출력한다.

**Tech Stack:** TypeScript, tsx(이미 설치), Node 내장 `node:test`(추가 의존성 없음), Node 22.

**실행 전 준비:** 현재 `main` 브랜치이므로 작업 브랜치를 먼저 만든다 — `git checkout -b feat/build-from-coupang`.

---

## File Structure

- **Create** `scripts/build-from-coupang.ts` — CLI 엔트리 + 순수 함수(파싱·매핑·렌더·쓰기). `tsconfig.json`의 `exclude: ["scripts"]`에 이미 포함되어 앱 빌드와 분리됨.
- **Create** `scripts/build-from-coupang.test.ts` — `node:test` 단위 테스트.
- **Modify** `package.json` — `scripts`에 `build:coupang`, `test:scripts` 추가.
- **재사용** `src/lib/coupang.ts`의 `createDeeplinks`, `src/lib/types.ts`의 `Article`/`Product` (상대경로 import — tsx가 `@/` paths를 보장 해석하지 않으므로 `../src/lib/...`).

테스트 실행 명령(모든 태스크 공통): `node --import tsx --test scripts/build-from-coupang.test.ts`

---

### Task 1: 인자 파싱 (`parseArgs`)

**Files:**
- Create: `scripts/build-from-coupang.ts`
- Test: `scripts/build-from-coupang.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

`scripts/build-from-coupang.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseArgs } from "./build-from-coupang.ts";

test("parseArgs: 정상 인자 파싱 + urls 쉼표 분리", () => {
  const args = parseArgs([
    "--slug=baby-wipes-grade-2026",
    "--category=newborn",
    "--urls=https://a.com/1, https://a.com/2",
  ]);
  assert.equal(args.slug, "baby-wipes-grade-2026");
  assert.equal(args.category, "newborn");
  assert.deepEqual(args.urls, ["https://a.com/1", "https://a.com/2"]);
  assert.equal(args.force, false);
  assert.equal(args.dryRun, false);
});

test("parseArgs: --force, --dry-run 플래그", () => {
  const args = parseArgs(["--slug=s", "--category=c", "--urls=https://a.com/1", "--force", "--dry-run"]);
  assert.equal(args.force, true);
  assert.equal(args.dryRun, true);
});

test("parseArgs: 필수 인자 누락 시 throw", () => {
  assert.throws(() => parseArgs(["--slug=s", "--category=c"]), /사용법/);
  assert.throws(() => parseArgs(["--category=c", "--urls=https://a.com/1"]), /사용법/);
});
```

- [ ] **Step 2: 실행해서 실패 확인**

Run: `node --import tsx --test scripts/build-from-coupang.test.ts`
Expected: FAIL — `Cannot find module './build-from-coupang.ts'`

- [ ] **Step 3: 최소 구현**

`scripts/build-from-coupang.ts`:
```ts
export interface CliArgs {
  slug: string;
  category: string;
  urls: string[];
  force: boolean;
  dryRun: boolean;
}

export function parseArgs(argv: string[]): CliArgs {
  const map = new Map<string, string>();
  let force = false;
  let dryRun = false;
  for (const a of argv) {
    if (a === "--force") { force = true; continue; }
    if (a === "--dry-run") { dryRun = true; continue; }
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) map.set(m[1], m[2]);
  }
  const slug = map.get("slug") ?? "";
  const category = map.get("category") ?? "";
  const urls = (map.get("urls") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!slug || !category || urls.length === 0) {
    throw new Error(
      "사용법: --slug=<slug> --category=<cat> --urls=<url1,url2> [--dry-run] [--force]",
    );
  }
  return { slug, category, urls, force, dryRun };
}
```

- [ ] **Step 4: 실행해서 통과 확인**

Run: `node --import tsx --test scripts/build-from-coupang.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: 커밋**

```bash
git add scripts/build-from-coupang.ts scripts/build-from-coupang.test.ts
git commit -m "feat(script): build-from-coupang 인자 파싱"
```

---

### Task 2: 딥링크 매핑 (`mapDeeplinkToProduct`, `mockDeeplinks`)

**Files:**
- Modify: `scripts/build-from-coupang.ts`
- Test: `scripts/build-from-coupang.test.ts`

- [ ] **Step 1: 실패 테스트 추가**

`scripts/build-from-coupang.test.ts` 상단 import에 추가:
```ts
import { mapDeeplinkToProduct, mockDeeplinks } from "./build-from-coupang.ts";
```
파일 하단에 테스트 추가:
```ts
test("mockDeeplinks: URL 개수만큼 딥링크 생성, originalUrl 보존", () => {
  const links = mockDeeplinks(["https://a.com/1", "https://a.com/2"]);
  assert.equal(links.length, 2);
  assert.equal(links[0].originalUrl, "https://a.com/1");
  assert.ok(links[0].landingUrl.startsWith("https://link.coupang.com/"));
});

test("mapDeeplinkToProduct: id 자동, affiliateUrl=landingUrl, grade 기본 C", () => {
  const link = { originalUrl: "https://a.com/1", shortenUrl: "s", landingUrl: "https://link.coupang.com/re/X" };
  const p = mapDeeplinkToProduct(link, "baby-wipes-grade-2026", 0);
  assert.equal(p.id, "baby-wipes-grade-2026-1");
  assert.equal(p.affiliateUrl, "https://link.coupang.com/re/X");
  assert.equal(p.provider, "coupang");
  assert.equal(p.grade, "C");
});
```

- [ ] **Step 2: 실행해서 실패 확인**

Run: `node --import tsx --test scripts/build-from-coupang.test.ts`
Expected: FAIL — `mapDeeplinkToProduct`/`mockDeeplinks` is not exported

- [ ] **Step 3: 최소 구현**

`scripts/build-from-coupang.ts` 상단에 import 추가:
```ts
import { type CoupangDeeplink } from "../src/lib/coupang";
import type { Product } from "../src/lib/types";
```
함수 추가:
```ts
// 키 없이 검증하기 위한 mock 딥링크 (--dry-run)
export function mockDeeplinks(urls: string[]): CoupangDeeplink[] {
  return urls.map((u) => ({
    originalUrl: u,
    shortenUrl: "https://link.coupang.com/a/MOCK",
    landingUrl: `https://link.coupang.com/re/MOCK?pageKey=${encodeURIComponent(u)}`,
  }));
}

// 딥링크 → Product. affiliateUrl(추적링크)만 실값, 나머지는 사람이 채울 빈칸.
export function mapDeeplinkToProduct(
  deeplink: CoupangDeeplink,
  slug: string,
  index: number,
): Product {
  return {
    id: `${slug}-${index + 1}`,
    name: "",
    type: "",
    descriptor: "",
    grade: "C",
    specs: [],
    priceExample: 0,
    provider: "coupang",
    affiliateUrl: deeplink.landingUrl,
  };
}
```

- [ ] **Step 4: 실행해서 통과 확인**

Run: `node --import tsx --test scripts/build-from-coupang.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: 커밋**

```bash
git add scripts/build-from-coupang.ts scripts/build-from-coupang.test.ts
git commit -m "feat(script): 딥링크 → Product 매핑 + dry-run mock"
```

---

### Task 3: 초안 렌더링 (`buildDraftArticle`, `renderDraftModule`, `toCamel`)

**Files:**
- Modify: `scripts/build-from-coupang.ts`
- Test: `scripts/build-from-coupang.test.ts`

- [ ] **Step 1: 실패 테스트 추가**

import에 추가:
```ts
import { buildDraftArticle, renderDraftModule, toCamel } from "./build-from-coupang.ts";
```
테스트 추가:
```ts
test("toCamel: 하이픈 slug → 카멜", () => {
  assert.equal(toCamel("baby-wipes-grade-2026"), "babyWipesGrade2026");
});

test("buildDraftArticle: comparison 타입 + products 보존", () => {
  const products = [mapDeeplinkToProduct({ originalUrl: "u", shortenUrl: "s", landingUrl: "L" }, "s", 0)];
  const a = buildDraftArticle({ slug: "s", category: "newborn", products });
  assert.equal(a.type, "comparison");
  assert.equal(a.category, "newborn");
  assert.equal(a.products?.length, 1);
});

test("renderDraftModule: 변수명·실값 링크·TODO 주석·import 포함", () => {
  const products = [mapDeeplinkToProduct({ originalUrl: "u", shortenUrl: "s", landingUrl: "https://link.coupang.com/re/X" }, "baby-wipes-grade-2026", 0)];
  const article = buildDraftArticle({ slug: "baby-wipes-grade-2026", category: "newborn", products });
  const src = renderDraftModule(article);
  assert.match(src, /export const babyWipesGrade2026Draft: Article =/);
  assert.match(src, /affiliateUrl: "https:\/\/link\.coupang\.com\/re\/X"/);
  assert.match(src, /grade: "C", \/\/ TODO/);
  assert.match(src, /import type \{ Article \} from "@\/lib\/types"/);
});
```

- [ ] **Step 2: 실행해서 실패 확인**

Run: `node --import tsx --test scripts/build-from-coupang.test.ts`
Expected: FAIL — `buildDraftArticle`/`renderDraftModule`/`toCamel` is not exported

- [ ] **Step 3: 최소 구현**

import에 `Article` 추가(기존 Product import 줄을 교체):
```ts
import type { Article, Product } from "../src/lib/types";
```
함수 추가:
```ts
export function toCamel(slug: string): string {
  return slug
    .split("-")
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");
}

export function buildDraftArticle(input: {
  slug: string;
  category: string;
  products: Product[];
}): Article {
  return {
    slug: input.slug,
    category: input.category,
    type: "comparison",
    title: "",
    description: "",
    updated: "",
    summary: [],
    axes: [],
    products: input.products,
    sources: [],
  };
}

function renderProduct(p: Product): string {
  return `    {
      id: ${JSON.stringify(p.id)},
      name: "", // TODO: 상품명
      type: "", // TODO: 유형 라벨 (예: 디럭스형)
      descriptor: "", // TODO: 한 줄 설명
      grade: "C", // TODO: 1차 출처 보고 등급 판정 (S/A/B/C)
      priceExample: 0, // TODO: 조회 시점 가격(원)
      provider: "coupang",
      affiliateUrl: ${JSON.stringify(p.affiliateUrl)},
      specs: [], // TODO: 인증·무게·성분 등 (1차 출처)
    }`;
}

export function renderDraftModule(article: Article): string {
  const varName = `${toCamel(article.slug)}Draft`;
  const products = (article.products ?? []).map(renderProduct).join(",\n");
  return `import type { Article } from "@/lib/types";

// ⚠️ build-from-coupang 가 생성한 검수용 초안입니다.
//    발행 전: ① 등급·스펙·가격·문구를 1차 출처 보고 채우고
//             ② 파일명을 ${article.slug}.ts 로 바꾼 뒤
//             ③ src/lib/content.ts 의 articles 배열에 등록하세요.

export const ${varName}: Article = {
  slug: ${JSON.stringify(article.slug)},
  category: ${JSON.stringify(article.category)},
  type: "comparison",
  title: "", // TODO: 글 제목
  description: "", // TODO: 메타 설명
  updated: "", // TODO: "YYYY.MM"
  summary: [], // TODO: 한눈에 요약 (3줄 권장)
  axes: [], // TODO: 평가 축 (예: { label: "안전성", desc: "..." })
  products: [
${products}
  ],
  sources: [], // TODO: 1차 출처 (식약처·소비자원·국가기술표준원 등)
};
`;
}
```

- [ ] **Step 4: 실행해서 통과 확인**

Run: `node --import tsx --test scripts/build-from-coupang.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: 커밋**

```bash
git add scripts/build-from-coupang.ts scripts/build-from-coupang.test.ts
git commit -m "feat(script): 검수용 .draft.ts 초안 렌더링"
```

---

### Task 4: 파일 경로·쓰기·중복 거부 (`draftPath`, `writeDraftFile`)

**Files:**
- Modify: `scripts/build-from-coupang.ts`
- Test: `scripts/build-from-coupang.test.ts`

- [ ] **Step 1: 실패 테스트 추가**

import에 추가(테스트 파일 상단):
```ts
import { draftPath, writeDraftFile } from "./build-from-coupang.ts";
import { mkdtempSync, existsSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
```
테스트 추가:
```ts
test("draftPath: products 디렉터리 + .draft.ts 접미사", () => {
  const p = draftPath("baby-wipes-grade-2026");
  assert.ok(p.endsWith(path.join("src/content/products", "baby-wipes-grade-2026.draft.ts")));
});

test("writeDraftFile: 새 파일 작성", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "draft-"));
  const out = path.join(dir, "x.draft.ts");
  writeDraftFile(out, "hello", false);
  assert.equal(readFileSync(out, "utf8"), "hello");
  rmSync(dir, { recursive: true, force: true });
});

test("writeDraftFile: 기존 파일은 force 없으면 throw, force면 덮어씀", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "draft-"));
  const out = path.join(dir, "x.draft.ts");
  writeDraftFile(out, "v1", false);
  assert.throws(() => writeDraftFile(out, "v2", false), /이미 존재/);
  writeDraftFile(out, "v2", true);
  assert.equal(readFileSync(out, "utf8"), "v2");
  rmSync(dir, { recursive: true, force: true });
});
```

- [ ] **Step 2: 실행해서 실패 확인**

Run: `node --import tsx --test scripts/build-from-coupang.test.ts`
Expected: FAIL — `draftPath`/`writeDraftFile` is not exported

- [ ] **Step 3: 최소 구현**

`scripts/build-from-coupang.ts` 상단 import에 추가:
```ts
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
```
함수 추가:
```ts
export function draftPath(slug: string): string {
  return path.join(process.cwd(), "src/content/products", `${slug}.draft.ts`);
}

export function writeDraftFile(outPath: string, content: string, force: boolean): void {
  if (existsSync(outPath) && !force) {
    throw new Error(`이미 존재: ${outPath} (덮어쓰려면 --force)`);
  }
  writeFileSync(outPath, content, "utf8");
}
```

- [ ] **Step 4: 실행해서 통과 확인**

Run: `node --import tsx --test scripts/build-from-coupang.test.ts`
Expected: PASS (11 tests)

- [ ] **Step 5: 커밋**

```bash
git add scripts/build-from-coupang.ts scripts/build-from-coupang.test.ts
git commit -m "feat(script): 초안 파일 쓰기 + 중복 거부(--force)"
```

---

### Task 5: main 조립 + npm 스크립트 + E2E 검증

**Files:**
- Modify: `scripts/build-from-coupang.ts`
- Modify: `package.json`

- [ ] **Step 1: `main` + entry 가드 구현**

`scripts/build-from-coupang.ts` 상단 import에 추가:
```ts
import { fileURLToPath } from "node:url";
import { createDeeplinks } from "../src/lib/coupang";
```
파일 맨 끝에 추가:
```ts
function safeParse(): CliArgs {
  try {
    return parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const args = safeParse();
  const deeplinks = args.dryRun
    ? mockDeeplinks(args.urls)
    : await createDeeplinks(args.urls, args.slug);
  if (deeplinks.length === 0) {
    console.error("딥링크 0건 — 입력 URL을 확인하세요.");
    process.exit(1);
  }
  const products = deeplinks.map((d, i) => mapDeeplinkToProduct(d, args.slug, i));
  const article = buildDraftArticle({ slug: args.slug, category: args.category, products });
  const out = draftPath(args.slug);
  try {
    writeDraftFile(out, renderDraftModule(article), args.force);
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }
  console.log(`✓ 초안 생성: ${out}`);
  console.log("  쿠팡 API 호출 제한(시간당 ~10회)에 유의하세요.");
  console.log(`  다음: 등급·스펙·가격을 채우고 → ${args.slug}.ts 로 이름 변경 → src/lib/content.ts 등록`);
}

const isEntry = process.argv[1] === fileURLToPath(import.meta.url);
if (isEntry) {
  void main();
}
```

- [ ] **Step 2: `package.json`에 스크립트 추가**

`scripts` 블록(`"insights"` 줄 뒤)에 추가:
```json
    "insights": "tsx scripts/analytics-insights.ts",
    "build:coupang": "tsx scripts/build-from-coupang.ts",
    "test:scripts": "node --import tsx --test scripts/build-from-coupang.test.ts"
```
(쉼표 위치 주의 — `insights` 줄 끝에 쉼표를 붙이고 두 줄을 추가.)

- [ ] **Step 3: 단위 테스트 전체 통과 확인**

Run: `npm run test:scripts`
Expected: PASS (11 tests)

- [ ] **Step 4: dry-run E2E 검증 (키 없이 실제 파일 생성)**

Run:
```bash
npm run build:coupang -- --slug=test-draft-2026 --category=newborn --urls="https://www.coupang.com/vp/products/1,https://www.coupang.com/vp/products/2"
```
Expected: `✓ 초안 생성: .../src/content/products/test-draft-2026.draft.ts` 출력 (단, dry-run 아니면 키 없어 실패 — 아래로 진행)

> 위는 키가 없으면 `COUPANG_ACCESS_KEY ... 필요` 에러가 정상이다. 키 없이 검증하려면 `--dry-run`을 붙인다:
```bash
npm run build:coupang -- --slug=test-draft-2026 --category=newborn --urls="https://www.coupang.com/vp/products/1,https://www.coupang.com/vp/products/2" --dry-run
```
Expected: `✓ 초안 생성: .../test-draft-2026.draft.ts`

- [ ] **Step 5: 생성물 검증 (타입 통과 + 중복 거부 + 정리)**

Run (생성된 초안이 `Article` 타입을 만족하는지 — `.draft.ts`는 `src/` 안이라 tsc가 검사):
```bash
npx tsc --noEmit
```
Expected: 에러 없음 (초안의 빈 `products` 필드들이 타입 충족)

Run (중복 거부 확인 — 같은 명령 재실행):
```bash
npm run build:coupang -- --slug=test-draft-2026 --category=newborn --urls="https://www.coupang.com/vp/products/1" --dry-run
```
Expected: `이미 존재: ... (덮어쓰려면 --force)` 에러로 중단

Run (테스트 산출물 정리 — 커밋에 포함하지 않음):
```bash
rm src/content/products/test-draft-2026.draft.ts
```

- [ ] **Step 6: 커밋**

```bash
git add scripts/build-from-coupang.ts package.json
git commit -m "feat(script): build-from-coupang main + npm 스크립트"
```

---

## 검증 요약

- `npm run test:scripts` — 단위 테스트 11개 통과 (파싱·매핑·렌더·쓰기·중복거부)
- `npm run build:coupang -- ... --dry-run` — 키 없이 `.draft.ts` 생성 E2E
- `npx tsc --noEmit` — 생성된 초안이 `Article`/`Product` 타입 충족
- 중복 실행 시 `--force` 없으면 거부

## 범위 밖 (YAGNI)

- 키워드 검색 기반 자동 채움(이름·가격·이미지) — 별도 모드.
- 등급 자동 판정 — 원칙상 불가.
- `content.ts` 자동 등록·발행, 가격 자동 갱신.
