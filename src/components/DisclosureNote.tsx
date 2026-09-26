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
    <p className={`text-caption leading-relaxed text-muted ${className}`}>
      {buildDisclosure(providers)}
    </p>
  );
}
