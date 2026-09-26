import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/server";
import { deleteArticle } from "../../actions";
import type { ArticleRow } from "@/lib/content";

export default async function AdminListPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const { saved, deleted } = await searchParams;
  const { data, error } = await supabaseAdmin()
    .from("articles")
    .select("slug, title, category, type, published, sort_order, updated_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as Pick<
    ArticleRow,
    "slug" | "title" | "category" | "type" | "published" | "sort_order"
  >[] &
    { updated_at?: string }[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">글 관리</h1>
        <Link
          href="/admin/new"
          className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-on-brand transition-opacity hover:opacity-90"
        >
          새 글
        </Link>
      </div>

      {saved && (
        <p className="mt-3 rounded-md bg-brand-soft px-3 py-2 text-sm text-brand">
          저장됨: {saved} — 공개 페이지에 즉시 반영되었습니다.
        </p>
      )}
      {deleted && (
        <p className="mt-3 rounded-md bg-surface px-3 py-2 text-sm text-muted">
          삭제됨: {deleted}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-md bg-surface px-3 py-2 text-sm text-muted">
          목록 조회 실패: {error.message}
        </p>
      )}

      <div className="mt-4 overflow-x-auto rounded-lg border border-hairline">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-xs text-faint">
              <th className="px-4 py-3 font-medium">제목</th>
              <th className="px-4 py-3 font-medium">slug</th>
              <th className="px-4 py-3 font-medium">카테고리</th>
              <th className="px-4 py-3 font-medium">타입</th>
              <th className="px-4 py-3 font-medium">공개</th>
              <th className="px-4 py-3 font-medium">정렬</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.slug}
                className="border-b border-hairline last:border-0"
              >
                <td className="px-4 py-3 font-medium">
                  <Link
                    href={`/admin/edit/${r.slug}`}
                    className="hover:text-brand"
                  >
                    {r.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{r.slug}</td>
                <td className="px-4 py-3 text-muted">{r.category}</td>
                <td className="px-4 py-3 text-muted">{r.type}</td>
                <td className="px-4 py-3">{r.published ? "공개" : "비공개"}</td>
                <td className="px-4 py-3 tabular-nums text-muted">
                  {r.sort_order}
                </td>
                <td className="px-4 py-3">
                  <form action={deleteArticle}>
                    <input type="hidden" name="slug" value={r.slug} />
                    <button
                      type="submit"
                      className="text-xs text-faint hover:text-ink"
                    >
                      삭제
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !error && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  글이 없습니다. 시드 스크립트(npm run seed:articles)를 먼저
                  실행하세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
