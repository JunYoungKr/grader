"use client";

import { useActionState, useMemo, useState } from "react";
import { saveArticle, type ActionState } from "@/app/admin/actions";
import { categories } from "@/content/categories";
import type { ArticleRow } from "@/lib/content";
import type { Grade, Provider } from "@/lib/types";
import { parsePairs, productFromDraft, productToDraft, type ProductDraft } from "@/lib/product-form";

// 운영자 1인용 편집 폼 — 자주 만지는 것(제품·가격·링크·등급)은 구조화 입력,
// 드물게 쓰는 중첩 구조(섹션·배너·체크리스트)는 JSON 입력으로 단순화.

const GRADES: Grade[] = ["S", "A", "B", "C"];
const PROVIDERS: Provider[] = ["coupang", "iherb", "linkprice", "tenping"];

const inputCls = "field mt-2";
const labelCls = "text-small font-medium text-muted";

function toLines<T>(
  items: T[] | undefined | null,
  fmt: (t: T) => string,
): string {
  return (items ?? []).map(fmt).join("\n");
}

const EMPTY_PRODUCT: ProductDraft = {
  id: "",
  name: "",
  type: "",
  descriptor: "",
  grade: undefined,
  specs: [],
  priceExample: "",
  provider: "coupang",
  affiliateUrl: "",
  recommended: false,
  attributesJson: "",
  specsText: "",
};

export function ArticleForm({ initial }: { initial?: ArticleRow }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    saveArticle,
    {},
  );

  const [meta, setMeta] = useState({
    slug: initial?.slug ?? "",
    category: initial?.category ?? categories[0].slug,
    type: initial?.type ?? "comparison",
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    updated: initial?.updated ?? "",
    medical: initial?.medical ?? false,
    published: initial?.published ?? true,
    sort_order: String(initial?.sort_order ?? 100),
  });
  const [summaryText, setSummaryText] = useState(
    (initial?.summary ?? []).join("\n"),
  );
  const [axesText, setAxesText] = useState(
    toLines(initial?.axes, (a) => `${a.label} | ${a.desc}`),
  );
  const [relatedText, setRelatedText] = useState(
    toLines(initial?.related, (r) => `${r.slug} | ${r.title}`),
  );
  const [sourcesText, setSourcesText] = useState(
    toLines(initial?.sources, (s) => `${s.label} | ${s.url}`),
  );
  const [sectionsJson, setSectionsJson] = useState(
    initial?.sections ? JSON.stringify(initial.sections, null, 2) : "",
  );
  const [promoJson, setPromoJson] = useState(
    initial?.promo_banner ? JSON.stringify(initial.promo_banner, null, 2) : "",
  );
  const [checklistJson, setChecklistJson] = useState(
    initial?.checklist ? JSON.stringify(initial.checklist, null, 2) : "",
  );
  const [products, setProducts] = useState<ProductDraft[]>(
    (initial?.products ?? []).map(productToDraft),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  function setProduct(i: number, patch: Partial<ProductDraft>) {
    setProducts((prev) =>
      prev.map((p, j) => (j === i ? { ...p, ...patch } : p)),
    );
  }

  const payload = useMemo(() => {
    try {
      const parsed = {
        originalSlug: initial?.slug,
        slug: meta.slug.trim(),
        category: meta.category,
        type: meta.type,
        title: meta.title.trim(),
        description: meta.description.trim(),
        updated: meta.updated.trim(),
        medical: meta.medical,
        published: meta.published,
        sort_order: Number(meta.sort_order) || 100,
        summary: summaryText
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
        axes: axesText.trim()
          ? parsePairs(axesText).map(([label, desc]) => ({ label, desc }))
          : undefined,
        related: relatedText.trim()
          ? parsePairs(relatedText).map(([slug, title]) => ({ slug, title }))
          : undefined,
        sources: sourcesText.trim()
          ? parsePairs(sourcesText).map(([label, url]) => ({ label, url }))
          : undefined,
        sections: sectionsJson.trim() ? JSON.parse(sectionsJson) : undefined,
        promoBanner: promoJson.trim() ? JSON.parse(promoJson) : undefined,
        checklist: checklistJson.trim() ? JSON.parse(checklistJson) : undefined,
        products:
          meta.type === "comparison" || meta.type === "guide"
            ? products.map(productFromDraft)
            : undefined,
      };
      setJsonError(null);
      return JSON.stringify(parsed);
    } catch (e) {
      setJsonError(`JSON 필드 오류: ${(e as Error).message}`);
      return "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    meta,
    summaryText,
    axesText,
    relatedText,
    sourcesText,
    sectionsJson,
    promoJson,
    checklistJson,
    products,
    initial?.slug,
  ]);

  return (
    <form action={formAction} className="max-w-3xl space-y-8 pb-20">
      <input type="hidden" name="payload" value={payload} />

      {/* 기본 정보 */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>slug</label>
          <input
            className={inputCls}
            value={meta.slug}
            onChange={(e) => setMeta({ ...meta, slug: e.target.value })}
            placeholder="zero-cola-grade-2026"
            required
          />
        </div>
        <div>
          <label className={labelCls}>카테고리</label>
          <select
            className={inputCls}
            value={meta.category}
            onChange={(e) => setMeta({ ...meta, category: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({c.slug})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>타입</label>
          <select
            className={inputCls}
            value={meta.type}
            onChange={(e) =>
              setMeta({ ...meta, type: e.target.value as ArticleRow["type"] })
            }
          >
            <option value="comparison">comparison (구매 가이드)</option>
            <option value="guide">guide (설명형)</option>
            <option value="hub">hub (토픽 허브)</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>갱신 표기 (YYYY.MM)</label>
          <input
            className={inputCls}
            value={meta.updated}
            onChange={(e) => setMeta({ ...meta, updated: e.target.value })}
            placeholder="2026.06"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>제목</label>
          <input
            className={inputCls}
            value={meta.title}
            onChange={(e) => setMeta({ ...meta, title: e.target.value })}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>설명</label>
          <textarea
            className={inputCls}
            rows={2}
            value={meta.description}
            onChange={(e) => setMeta({ ...meta, description: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-6 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={meta.published}
              onChange={(e) =>
                setMeta({ ...meta, published: e.target.checked })
              }
            />
            공개
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={meta.medical}
              onChange={(e) => setMeta({ ...meta, medical: e.target.checked })}
            />
            의료 면책 표시 (YMYL)
          </label>
          <label className="flex items-center gap-2 text-sm">
            정렬
            <input
              className="w-20 rounded-md border border-hairline bg-paper px-2 py-1 text-sm"
              type="number"
              value={meta.sort_order}
              onChange={(e) => setMeta({ ...meta, sort_order: e.target.value })}
            />
          </label>
        </div>
      </section>

      {/* 요약 */}
      <section>
        <label className={labelCls}>한눈에 요약, 한 줄에 하나</label>
        <textarea
          className={inputCls}
          rows={3}
          value={summaryText}
          onChange={(e) => setSummaryText(e.target.value)}
        />
      </section>

      {/* 비교 글과 설명형 글에 판매처 상품을 연결한다. */}
      {(meta.type === "comparison" || meta.type === "guide") && (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">제품</h2>
            <button
              type="button"
              className="rounded-md border border-hairline px-2.5 py-1 text-xs text-muted hover:bg-surface"
              onClick={() => setProducts((p) => [...p, { ...EMPTY_PRODUCT }])}
            >
              + 제품 추가
            </button>
          </div>
          <div className="mt-3 space-y-4">
            {products.map((p, i) => (
              <div key={i} className="rounded-lg border border-hairline p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>id</label>
                    <input
                      className={inputCls}
                      value={p.id}
                      onChange={(e) => setProduct(i, { id: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>이름</label>
                    <input
                      className={inputCls}
                      value={p.name}
                      onChange={(e) => setProduct(i, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>유형 (예: 제로 탄산음료)</label>
                    <input
                      className={inputCls}
                      value={p.type}
                      onChange={(e) => setProduct(i, { type: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>한 줄 특징</label>
                    <input
                      className={inputCls}
                      value={p.descriptor}
                      onChange={(e) =>
                        setProduct(i, { descriptor: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>
                      기존 등급 (비교 글만 필수, 공개 화면 미노출)
                    </label>
                    <select
                      className={inputCls}
                      value={p.grade ?? ""}
                      onChange={(e) =>
                        setProduct(i, { grade: (e.target.value || undefined) as Grade | undefined })
                      }
                    >
                      <option value="">평가하지 않음</option>
                      {GRADES.map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>
                      가격 (원, 조회 시점 실측만)
                    </label>
                    <input
                      className={inputCls}
                      type="number"
                      value={p.priceExample}
                      onChange={(e) =>
                        setProduct(i, { priceExample: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>제휴처</label>
                    <select
                      className={inputCls}
                      value={p.provider}
                      onChange={(e) =>
                        setProduct(i, { provider: e.target.value as Provider })
                      }
                    >
                      {PROVIDERS.map((pr) => (
                        <option key={pr}>{pr}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>
                      제휴 링크 (실링크만, # 금지)
                    </label>
                    <input
                      className={inputCls}
                      value={p.affiliateUrl}
                      onChange={(e) =>
                        setProduct(i, { affiliateUrl: e.target.value })
                      }
                      placeholder="https://link.coupang.com/a/..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls} htmlFor={`product-image-${i}`}>
                      상품 이미지 주소
                    </label>
                    <input
                      id={`product-image-${i}`}
                      type="url"
                      className={inputCls}
                      value={p.imageUrl ?? ""}
                      onChange={(e) => setProduct(i, { imageUrl: e.target.value })}
                      placeholder="https://thumbnail.coupangcdn.com/..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>
                      스펙, 한 줄에 “라벨 | 값”
                    </label>
                    <textarea
                      className={inputCls}
                      rows={3}
                      value={p.specsText}
                      onChange={(e) =>
                        setProduct(i, { specsText: e.target.value })
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>
                      attributes JSON (선택, 비교 엔진용{" "}
                      {"{ ageMonths, features }"})
                    </label>
                    <textarea
                      className={`${inputCls} font-mono text-xs`}
                      rows={2}
                      value={p.attributesJson}
                      onChange={(e) =>
                        setProduct(i, { attributesJson: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(p.recommended)}
                      onChange={(e) =>
                        setProduct(i, { recommended: e.target.checked })
                      }
                    />
                    1순위 추천 (에디터 PICK)
                  </label>
                  <button
                    type="button"
                    className="text-xs text-faint hover:text-ink"
                    onClick={() =>
                      setProducts((prev) => prev.filter((_, j) => j !== i))
                    }
                  >
                    제품 삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 부가 구조 */}
      <section className="space-y-4">
        <div>
          <label className={labelCls}>평가 축, 한 줄에 “라벨 | 설명”</label>
          <textarea
            className={inputCls}
            rows={3}
            value={axesText}
            onChange={(e) => setAxesText(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>관련 글, 한 줄에 “slug | 제목”</label>
          <textarea
            className={inputCls}
            rows={2}
            value={relatedText}
            onChange={(e) => setRelatedText(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>출처, 한 줄에 “라벨 | URL”</label>
          <textarea
            className={inputCls}
            rows={2}
            value={sourcesText}
            onChange={(e) => setSourcesText(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>본문 섹션 JSON (Section[])</label>
          <textarea
            className={`${inputCls} font-mono text-xs`}
            rows={5}
            value={sectionsJson}
            onChange={(e) => setSectionsJson(e.target.value)}
            placeholder='[{"heading":"...","paragraphs":["..."]}]'
          />
        </div>
        <div>
          <label className={labelCls}>프로모 배너 JSON (PromoBanner)</label>
          <textarea
            className={`${inputCls} font-mono text-xs`}
            rows={3}
            value={promoJson}
            onChange={(e) => setPromoJson(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>체크리스트 JSON</label>
          <textarea
            className={`${inputCls} font-mono text-xs`}
            rows={3}
            value={checklistJson}
            onChange={(e) => setChecklistJson(e.target.value)}
          />
        </div>
      </section>

      {(jsonError || state.error) && (
        <p className="rounded-md bg-surface px-3 py-2 text-sm text-muted">
          {jsonError ?? state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={Boolean(jsonError)}
        className="inline-flex rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-on-brand transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        저장, 사이트에 즉시 반영
      </button>
    </form>
  );
}
