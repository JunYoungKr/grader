"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { refreshPromoCandidates } from "@/lib/coupang-promo-refresh";

async function requireAdmin() {
  if (!(await getAdminUser())) redirect("/admin/login");
}

export async function refreshDiscovery(): Promise<void> {
  await requireAdmin();
  let result = "";
  try {
    result = `updated=${await refreshPromoCandidates()}`;
    revalidatePath("/admin/discovery");
  } catch (error) {
    console.error(
      "[coupang-promo] Manual refresh failed",
      error instanceof Error ? error.message : "Unknown failure",
    );
    result = "error=refresh";
  }
  redirect(`/admin/discovery?${result}`);
}

export async function setDiscoveryStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const productKey = String(formData.get("productKey") ?? "");
  const status = String(formData.get("status") ?? "");
  const view = String(formData.get("view") ?? "priority");
  if (!/^\d+:(?:\d+|base)$/.test(productKey) ||
    !["new", "saved", "dismissed"].includes(status)) {
    throw new Error("잘못된 후보 변경 요청입니다.");
  }
  const { error } = await supabaseAdmin()
    .from("coupang_promo_candidates")
    .update({ review_status: status })
    .eq("product_key", productKey);
  if (error) throw new Error("후보 상태를 저장하지 못했습니다.");
  revalidatePath("/admin/discovery");
  redirect(`/admin/discovery?view=${["priority", "all", "saved", "dismissed"].includes(view) ? view : "priority"}`);
}
