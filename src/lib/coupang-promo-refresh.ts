import { collectPromoCandidates } from "./coupang-promo";
import { supabaseAdmin } from "./supabase/server";

export async function refreshPromoCandidates(): Promise<number> {
  const candidates = await collectPromoCandidates();
  if (candidates.length === 0) {
    throw new Error("No valid discovery candidates; previous list retained");
  }
  const { error } = await supabaseAdmin().rpc("save_coupang_promo_candidates", {
    p_candidates: candidates,
  });
  if (error) throw new Error(`Could not save discovery candidates: ${error.message}`);
  return candidates.length;
}
