import Link from "next/link";
import { refreshDiscovery } from "./actions";
import { supabaseAdmin } from "@/lib/supabase/server";
import { PromoCandidateCard, type PromoCandidateRow } from "@/components/admin/PromoCandidateCard";

export const dynamic = "force-dynamic";

export default async function DiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; updated?: string; error?: string }>;
}) {
  const params = await searchParams;
  const view = ["new", "saved", "dismissed"].includes(params.view ?? "")
    ? params.view!
    : "new";
  const db = supabaseAdmin();
  const [{ data, error }, state] = await Promise.all([
    db.from("coupang_promo_candidates")
      .select("*")
      .eq("review_status", view)
      .order("last_seen_at", { ascending: false })
      .limit(100),
    db.from("coupang_promo_sync_state")
      .select("last_success_at, candidate_count")
      .eq("name", "promo-candidates")
      .maybeSingle(),
  ]);
  const candidates = (data ?? []) as PromoCandidateRow[];
  const syncedAt = state.data?.last_success_at
    ? new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short",
    }).format(new Date(state.data.last_success_at))
    : null;

  return (
    <main className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">상품 후보</h1>
          <p className="mt-2 text-sm text-muted">
            골드박스와 살림 검색어에서 모은 실제 상품입니다. 게시 전 현재 가격과 사용 조건을 확인하세요.
          </p>
          <p className="mt-1 text-sm text-muted">
            {syncedAt ? `최근 수집 ${syncedAt}, ${state.data?.candidate_count ?? 0}개` : "아직 수집한 상품이 없습니다."}
          </p>
        </div>
        <form action={refreshDiscovery}>
          <button type="submit" className="min-h-11 rounded-md bg-brand px-4 text-sm font-medium text-on-brand">
            지금 후보 수집
          </button>
        </form>
      </div>
      {params.updated && (
        <p className="mt-4 rounded-md bg-brand-soft p-3 text-sm text-brand">
          상품 후보 {params.updated}개를 수집했습니다.
        </p>
      )}
      {params.error && (
        <p className="mt-4 rounded-md bg-surface p-3 text-sm text-ink">
          이번 수집에 실패했습니다. 이전 후보는 유지됩니다. 잠시 후 다시 시도해 주세요.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-md bg-surface p-3 text-sm text-ink">
          후보 목록을 읽지 못했습니다. 데이터베이스 설정을 확인해 주세요.
        </p>
      )}
      <nav className="mt-6 flex flex-wrap gap-3 border-b border-hairline pb-3 text-sm">
        {([
          ["new", "새 후보"], ["saved", "관심 상품"], ["dismissed", "제외한 상품"],
        ] as const).map(([value, label]) => (
          <Link
            key={value}
            href={`/admin/discovery?view=${value}`}
            className={value === view ? "font-semibold text-brand" : "text-muted hover:text-ink"}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-5 space-y-4">
        {candidates.map((candidate) => (
          <PromoCandidateCard key={candidate.product_key} candidate={candidate} view={view} />
        ))}
        {candidates.length === 0 && !error && (
          <p className="rounded-md border border-hairline bg-card p-8 text-center text-muted">
            {view === "new" ? "새 후보가 없습니다. 지금 후보 수집을 눌러 시작하세요." : "이 목록에는 아직 상품이 없습니다."}
          </p>
        )}
      </div>
    </main>
  );
}
