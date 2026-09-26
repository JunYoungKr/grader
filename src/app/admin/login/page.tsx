"use client";

import { Icon } from "@/components/ui/Icon";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabaseBrowser().auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError("이메일과 비밀번호를 확인해 주세요.");
        return;
      }
      router.push("/admin/content");
      router.refresh();
    } catch {
      setError("로그인에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-shell py-12">
      <div className="panel mx-auto max-w-md p-8">
        <Icon name="leaf" size={28} className="mb-6 text-brand" />
        <h1 className="text-heading font-medium tracking-tight">콘텐츠 관리</h1>
        <p className="mt-2 text-sm text-muted">
          등록된 운영자 계정으로 로그인해 주세요.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="text-small font-medium text-muted"
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field mt-2"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-small font-medium text-muted"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field mt-2"
            />
          </div>
          {error && (
            <p role="alert" className="text-small text-accent">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="button button-primary w-full disabled:opacity-50"
          >
            {busy ? "로그인 중…" : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
