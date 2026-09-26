import Link from "next/link";
import type { ReactNode } from "react";
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`page-shell ${className}`}>{children}</div>;
}
export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  return (
    <Link href={href} className={`button button-${variant} ${className}`}>
      {children}
    </Link>
  );
}
export function SectionHeading({
  title,
  description,
  href,
  linkLabel = "전체 보기",
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-section font-semibold">{title}</h2>
        {description && (
          <p className="mt-3 text-body text-muted">{description}</p>
        )}
      </div>
      {href && (
        <Link href={href} className="text-link">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  href,
  action = "살림 둘러보기",
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="border-y border-hairline px-6 py-10 text-center">
      <h2 className="text-title font-medium">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-small text-muted">
        {description}
      </p>
      {href && (
        <ButtonLink href={href} variant="secondary" className="mt-6">
          {action}
        </ButtonLink>
      )}
    </div>
  );
}
export function ContentNotice({ children }: { children: ReactNode }) {
  return (
    <p className="border-l-2 border-hairline pl-4 text-small text-muted">
      {children}
    </p>
  );
}
export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="현재 위치" className="mb-6 text-caption text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:text-brand">
            홈
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-brand">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
