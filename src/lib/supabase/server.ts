import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 공개 읽기용(anon) — published 글만 보인다(RLS).
// env 미설정 시 null을 돌려주고 호출부가 빈 목록으로 폴백(빌드가 깨지지 않게).
export function supabasePublic(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("[supabase] NEXT_PUBLIC_SUPABASE_URL/ANON_KEY 미설정, 콘텐츠 빈 목록 폴백");
    return null;
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

// 어드민 쓰기용(service role) — 서버 전용. 클라이언트 번들에 절대 노출 금지.
export function supabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY 미설정, 어드민 쓰기 불가");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
