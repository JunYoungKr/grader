import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// ADMIN_EMAILS(콤마 구분)에 있는 계정만 어드민으로 인정.
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(email.toLowerCase());
}

// 세션 쿠키에서 어드민 사용자 조회 — 미로그인/비허용이면 null.
export async function getAdminUser(): Promise<{ email: string } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  const sb = createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {
        /* 읽기 전용 컨텍스트 — 갱신은 middleware가 담당 */
      },
    },
  });
  const { data } = await sb.auth.getUser();
  const email = data.user?.email;
  return isAdminEmail(email) ? { email: email as string } : null;
}
