import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { collectCoupangSnapshot, COUPANG_CACHE_TAG } from "@/lib/coupang-sync";
import { isCoupangSyncAuthorized } from "@/lib/coupang-sync-auth";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (
    !isCoupangSyncAuthorized(
      request.headers.get("authorization"),
      process.env.COUPANG_SYNC_SECRET,
    )
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const runId = randomUUID();
  let db: ReturnType<typeof supabaseAdmin> | undefined;
  let claimed = false;
  try {
    // Fail before acquiring a lease when deployment configuration is incomplete.
    if (!process.env.COUPANG_ACCESS_KEY || !process.env.COUPANG_SECRET_KEY)
      throw new Error("Coupang credentials missing");
    db = supabaseAdmin();
    const claim = await db.rpc("claim_coupang_sync", { p_run_id: runId });
    if (claim.error) throw new Error("Could not acquire sync lease");
    if (!claim.data)
      return NextResponse.json({
        status: "skipped",
        reason: "running_or_already_completed_today",
      });
    claimed = true;
    const snapshot = await collectCoupangSnapshot();
    const result = await db.rpc("complete_coupang_sync", {
      p_run_id: runId,
      p_snapshot: snapshot,
    });
    if (result.error || !result.data)
      throw new Error("Could not publish snapshot; previous data retained");
    claimed = false;
    revalidateTag(COUPANG_CACHE_TAG);
    revalidatePath("/");
    revalidatePath("/browse");
    for (const category of Object.keys(snapshot.categories))
      revalidatePath(`/category/${category}`);
    return NextResponse.json({
      status: "updated",
      generatedAt: snapshot.generatedAt,
      products: Object.values(snapshot.categories).flat().length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown sync failure";
    console.error("[coupang-sync]", message);
    if (claimed && db) {
      const result = await db.rpc("fail_coupang_sync", {
        p_run_id: runId,
        p_error: message.slice(0, 500),
      });
      if (result.error)
        console.error(
          "[coupang-sync] Could not record failure; lease will expire",
        );
    }
    return NextResponse.json(
      { error: "Sync failed; previous data retained" },
      { status: 500 },
    );
  }
}
