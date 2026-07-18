"use client";

import { createBrowserClient } from "@supabase/ssr";

// 어드민 로그인용 브라우저 클라이언트 — 세션을 쿠키에 저장해 서버가 읽는다.
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
