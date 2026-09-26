import { normalizeContentCopy } from "./display-copy";

export type SavedItem = {
  id: string;
  title: string;
  href: string;
  kind: "article" | "product";
  imageUrl?: string;
  price?: number;
  priceCheckedAt?: string;
  category?: string;
};
export const SAVED_KEY = "grader:saved:v1";
export const SAVED_EVENT = "grader:saved-change";
export function isSafeHref(value: string) {
  return (
    (value.startsWith("/") &&
      !value.startsWith("//") &&
      !value.includes("\\")) ||
    /^https:\/\//i.test(value)
  );
}
export function parseSaved(raw: string | null): SavedItem[] {
  try {
    const data: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (v): v is SavedItem =>
          !!v &&
          typeof v === "object" &&
          typeof v.id === "string" &&
          typeof v.title === "string" &&
          typeof v.href === "string" &&
          isSafeHref(v.href) &&
          (v.kind === "article" || v.kind === "product") &&
          (v.imageUrl === undefined ||
            (typeof v.imageUrl === "string" &&
              /^https:\/\//.test(v.imageUrl))) &&
          (v.price === undefined ||
            (typeof v.price === "number" && Number.isFinite(v.price))) &&
          (v.priceCheckedAt === undefined ||
            typeof v.priceCheckedAt === "string"),
      )
      .slice(0, 100)
      .map((item) => normalizeContentCopy(item));
  } catch {
    return [];
  }
}
