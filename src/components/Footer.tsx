import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site";
import { DisclosureNote } from "./DisclosureNote";
export function Footer() {
  return (
    <footer className="section-block footer-space border-t border-hairline pt-8 md:pb-10">
      <div className="page-shell">
        <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-2xl font-medium text-brand"
            >
              Grader
            </Link>
          </div>
          <nav
            aria-label="사이트 안내"
            className="flex flex-wrap items-start gap-x-6 gap-y-2 text-small text-muted"
          >
            <Link className="text-link" href="/about">
              Grader 소개
            </Link>
            <Link className="text-link" href="/privacy">
              개인정보처리방침
            </Link>
            <a className="text-link" href={`mailto:${CONTACT_EMAIL}`}>
              문의하기
            </a>
          </nav>
        </div>
        <DisclosureNote />
        <p className="mt-4 text-caption text-faint">© 2026 Grader</p>
      </div>
    </footer>
  );
}
