import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { ArticleForm } from "@/components/admin/ArticleForm";
import type { ArticleRow } from "@/lib/content";

export default async function AdminEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await supabaseAdmin()
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) notFound();

  return (
    <div>
      <h1 className="text-xl font-medium">글 수정, {slug}</h1>
      <div className="mt-6">
        <ArticleForm initial={data as ArticleRow} />
      </div>
    </div>
  );
}
