// Apply the editorial punctuation rule to display text, preserving technical fields.
export function normalizeDisplayText(text: string): string {
  return text
    .replace(/(\d)[\u2012-\u2015](?=\d)/g, "$1~")
    .replace(/[ \t]*[\u00b7\u2022\u2027\u30fb\u2219\u22c5\u2012-\u2015]+[ \t]*/g, ", ")
    .replace(/[ \t]+-[ \t]+/g, ", ");
}

const DISPLAY_FIELDS = new Set([
  "title", "description", "summary", "name", "type", "descriptor",
  "label", "desc", "value", "heading", "paragraphs", "caption",
  "quantity", "note", "features", "imageAlt", "blurb",
  "categoryName", "sourceCategoryLabel",
]);

// This allowlist deliberately excludes identifiers, URLs, dates and object keys.
export function normalizeContentCopy<T>(value: T): T {
  function visit(item: unknown, field = ""): unknown {
    if (typeof item === "string")
      return DISPLAY_FIELDS.has(field) ? normalizeDisplayText(item) : item;
    if (Array.isArray(item)) return item.map((child) => visit(child, field));
    if (item && typeof item === "object")
      return Object.fromEntries(
        Object.entries(item).map(([key, child]) => [key, visit(child, key)]),
      );
    return item;
  }
  return visit(value) as T;
}
