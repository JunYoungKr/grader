import { ExternalIcon } from "./ExternalIcon";
import type { Source } from "@/lib/types";

export function SourceList({
  sources,
  id = "sources",
}: {
  sources: Source[];
  id?: string;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-20">
      <h2 className="text-title font-semibold">출처</h2>
      <ul className="mt-3 space-y-1.5 text-body">
        {sources.map((s, i) => (
          <li key={i}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand hover:underline"
            >
              {s.label}
              <ExternalIcon />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
