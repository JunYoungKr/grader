import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { normalizeContentCopy } from "../src/lib/display-copy";

loadEnvConfig(process.cwd());

// Preview by default. --apply updates only changed copy fields on existing rows.
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server configuration is missing");
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await sb.from("articles").select("*").order("slug");
  if (error) throw error;
  const changes = data.flatMap((row) => {
    const clean = normalizeContentCopy(row);
    if (clean.description === "저당 식단을 시작할 때 당이 다시 들어오기 쉬운 네 자리, 음료, 단백질, 아침, 요리당, 를 채우는 구성입니다. 역할, 표기, 가격 기준으로 비교했습니다.")
      clean.description = "저당 식단을 시작할 때 음료, 단백질, 아침 식사, 요리에 쓰는 당을 채우는 구성입니다. 역할과 표기, 가격을 기준으로 비교했습니다.";
    const patch = Object.fromEntries(
      Object.entries(clean).filter(([field, value]) =>
        JSON.stringify(value) !== JSON.stringify(row[field])),
    );
    return Object.keys(patch).length ? [{ row, patch }] : [];
  });
  console.log(JSON.stringify(changes.map(({ row, patch }) => ({
    slug: row.slug, fields: Object.keys(patch),
  })), null, 2));
  if (!process.argv.includes("--apply") || !changes.length) return;
  const dir = resolve(".local-backups");
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const backup = resolve(dir, `articles-copy-${Date.now()}.json`);
  writeFileSync(backup, JSON.stringify(changes.map(({ row }) => row), null, 2), { mode: 0o600 });
  console.log(`Backup saved: ${backup}`);
  for (const { row, patch } of changes) {
    const { data: saved, error: saveError } = await sb.from("articles")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("slug", row.slug).eq("updated_at", row.updated_at).select("slug");
    if (saveError) throw saveError;
    if (saved?.length !== 1) throw new Error(`Concurrent edit detected: ${row.slug}`);
  }
  console.log(`Updated ${changes.length} existing articles`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Copy update failed");
  process.exitCode = 1;
});
