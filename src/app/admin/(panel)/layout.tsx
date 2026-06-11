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
    <div className="mx-auto max-w-content px-5 py-8">
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-lg font-medium tracking-tight">
            Grader 어드민
          </Link>
          <Link href="/" className="text-sm text-brand hover:opacity-80">
            사이트 보기 →
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span>{user.email}</span>
          <SignOutButton />
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
