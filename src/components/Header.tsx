"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "./ui/Icon";
import { SearchForm } from "./ui/SearchForm";
import { ThemeToggle } from "./ThemeToggle";
const navigation = [
  { href: "/", label: "홈" },
  { href: "/browse", label: "살림 둘러보기" },
  { href: "/about", label: "Grader의 기준" },
];
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-paper">
      <div className="page-shell flex h-header items-center gap-8">
        <Link
          href="/"
          aria-label="Grader 홈"
          onClick={() => setOpen(false)}
          className="flex shrink-0 items-center gap-2 text-brand"
        >
          <span className="text-2xl font-medium tracking-tight">Grader</span>
        </Link>
        <nav aria-label="주 메뉴" className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`inline-flex min-h-touch items-center whitespace-nowrap text-small ${pathname === item.href ? "font-medium text-brand" : "text-muted hover:text-brand"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden w-64 xl:block">
          <SearchForm compact />
        </div>
        <div className="ml-auto flex items-center gap-1 xl:ml-0">
          <Link
            href="/saved"
            className="icon-button"
            aria-label="저장한 살림"
            aria-current={pathname === "/saved" ? "page" : undefined}
          >
            <Icon name="bookmark" />
          </Link>
          <ThemeToggle />
          <button
            type="button"
            className="icon-button md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
      {open && (
        <div
          id="mobile-menu"
          className="page-shell border-t border-hairline pb-5 pt-3 md:hidden"
        >
          <nav aria-label="모바일 메뉴" className="mb-4 flex flex-wrap gap-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-link"
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <SearchForm />
        </div>
      )}
    </header>
  );
}
