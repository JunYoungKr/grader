"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="rounded-md border border-hairline px-2.5 py-1 text-xs text-muted transition-colors hover:bg-surface"
      onClick={async () => {
        await supabaseBrowser().auth.signOut();
        router.push("/admin/login");
        router.refresh();
      }}
    >
      로그아웃
    </button>
  );
}
