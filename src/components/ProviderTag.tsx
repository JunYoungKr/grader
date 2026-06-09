import { PROVIDERS } from "@/lib/providers";
import type { Provider } from "@/lib/types";

export function ProviderTag({ provider }: { provider: Provider }) {
  return (
    <span className="text-xs text-faint">{PROVIDERS[provider].label}</span>
  );
}
