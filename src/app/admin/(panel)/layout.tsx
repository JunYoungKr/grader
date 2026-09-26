import Link from "next/link";
import { getAdminUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/admin/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="page-shell py-8">
      <div className="panel flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/content"
            className="text-lg font-medium tracking-tight"
          >
            Grader 어드민
          </Link>
          <Link href="/admin" className="text-sm text-brand hover:opacity-80">
            GA4
          </Link>
          <Link href="/admin/discovery" className="text-sm text-brand hover:opacity-80">
            상품 후보
          </Link>
          <Link href="/" className="text-sm text-brand hover:opacity-80">
            사이트 보기 →
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-small text-muted">
          <span>{user.email}</span>
          <SignOutButton />
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
