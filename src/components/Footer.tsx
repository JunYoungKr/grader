import Link from "next/link";
import { SITE_NAME, CONTACT_EMAIL } from "@/lib/site";
import { DisclosureNote } from "./DisclosureNote";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-hairline">
      <div className="mx-auto max-w-content space-y-3 px-5 py-8">
        <nav className="flex gap-4 text-sm text-muted">
          <Link href="/about" className="hover:text-ink">
            소개
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            개인정보
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink">
            문의
          </a>
        </nav>
        <DisclosureNote />
        <p className="text-xs text-faint">© 2026 {SITE_NAME}</p>
      </div>
    </footer>
  );
}
