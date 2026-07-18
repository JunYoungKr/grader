import { buildDisclosure, SITE_PROVIDERS } from "@/lib/providers";
import type { Provider } from "@/lib/types";

export function DisclosureNote({
  providers = SITE_PROVIDERS,
  className = "",
}: {
  providers?: Provider[];
  className?: string;
}) {
  return (
    <p
      className={`rounded-lg bg-surface p-4 text-xs leading-relaxed text-faint ${className}`}
    >
      {buildDisclosure(providers)}
    </p>
  );
}
