"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Article, Grade, Provider } from "@/lib/types";
import { getAdminUser } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getCategories } from "@/lib/content";

export interface ActionState {
  error?: string;
}

const GRADES: Grade[] = ["S", "A", "B", "C"];
const PROVIDERS: Provider[] = ["coupang", "iherb", "linkprice", "tenping"];

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

// 저장 후 공개 화면 즉시 갱신 — 이게 "어드민에서 고치면 바로 반영"의 핵심.
function revalidateSite(slug: string) {
  revalidatePath("/");
  revalidatePath(`/${slug}`);
  for (const c of getCategories()) revalidatePath(`/category/${c.slug}`);
  revalidatePath("/sitemap.xml");
}

function validate(a: Article & { published: boolean; sort_order: number }): string | null {
  if (!/^[a-z0-9-]+$/.test(a.slug)) return "slug는 소문자·숫자·하이픈만 가능합니다.";
  if (!a.title.trim()) return "제목은 필수입니다.";
  if (!getCategories().some((c) => c.slug === a.category))
    return `존재하지 않는 카테고리: ${a.category}`;
  if (!["comparison", "guide", "hub"].includes(a.type)) return "잘못된 글 타입.";
  if (a.type === "comparison") {
    if (!a.products?.length) return "comparison 글은 제품이 1개 이상 필요합니다.";
    for (const p of a.products) {
      if (!p.id || !p.name) return "제품 id·이름은 필수입니다.";
      if (!GRADES.includes(p.grade)) return `잘못된 등급: ${p.name}`;
      if (!PROVIDERS.includes(p.provider)) return `잘못된 제휴처: ${p.name}`;
      if (!/^https?:\/\//.test(p.affiliateUrl))
        return `제휴 링크는 실제 URL이어야 합니다("#" 금지): ${p.name}`;
      if (!(p.priceExample > 0)) return `가격이 0 이하입니다: ${p.name}`;
    }
  }
  return null;
}

export async function saveArticle(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  let payload: Article & { published: boolean; sort_order: number; originalSlug?: string };
  try {
    payload = JSON.parse(String(formData.get("payload")));
  } catch {
    return { error: "폼 데이터 파싱 실패 — JSON 필드를 확인하세요." };
  }

  const invalid = validate(payload);
  if (invalid) return { error: invalid };

  const row = {
    slug: payload.slug,
    category: payload.category,
    type: payload.type,
    title: payload.title,
    description: payload.description ?? "",
    updated: payload.updated ?? "",
    medical: Boolean(payload.medical),
    summary: payload.summary ?? [],
    axes: payload.axes ?? null,
    products: payload.products ?? null,
    promo_banner: payload.promoBanner ?? null,
    sections: payload.sections ?? null,
    checklist: payload.checklist ?? null,
    related: payload.related ?? null,
    sources: payload.sources ?? null,
    published: payload.published,
    sort_order: payload.sort_order,
    updated_at: new Date().toISOString(),
  };

  const sb = supabaseAdmin();

  // slug 변경 시 옛 행 제거(이동)
  if (payload.originalSlug && payload.originalSlug !== payload.slug) {
    await sb.from("articles").delete().eq("slug", payload.originalSlug);
    revalidatePath(`/${payload.originalSlug}`);
  }

  const { error } = await sb.from("articles").upsert(row, { onConflict: "slug" });
  if (error) return { error: `저장 실패: ${error.message}` };

  revalidateSite(payload.slug);
  redirect("/admin/content?saved=" + encodeURIComponent(payload.slug));
}

export async function deleteArticle(formData: FormData): Promise<void> {
  await requireAdmin();
  const slug = String(formData.get("slug"));
  const sb = supabaseAdmin();
  const { error } = await sb.from("articles").delete().eq("slug", slug);
  if (error) throw new Error(`삭제 실패: ${error.message}`);
  revalidateSite(slug);
  redirect("/admin/content?deleted=" + encodeURIComponent(slug));
}
