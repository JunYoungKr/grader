import Link from "next/link";
import type { RelatedLink as RelatedLinkType } from "@/lib/types";

export function RelatedLinks({
  links,
  title = "관련 글",
  id = "related",
}: {
  links: RelatedLinkType[];
  title?: string;
  id?: string;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-20">
      <h2 className="text-title font-semibold">{title}</h2>
      <ul className="mt-3 divide-y divide-hairline border-y border-hairline">
        {links.map((l) => (
          <li key={l.slug}>
            <Link
              href={`/${l.slug}`}
              className="block py-3 text-body transition-colors hover:text-brand"
            >
              {l.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
