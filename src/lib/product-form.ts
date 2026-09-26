import type { Product } from "./types";

export type ProductDraft = Omit<Product, "priceExample" | "attributes"> & {
  priceExample: string;
  attributesJson: string;
  specsText: string;
};

export function parsePairs(text: string): [string, string][] {
  return text.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const separator = line.indexOf("|");
    return separator === -1
      ? [line, ""]
      : [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
  });
}

export function productToDraft(product: Product): ProductDraft {
  const { priceExample, attributes, specs, ...rest } = product;
  return {
    ...rest,
    specs,
    priceExample: String(priceExample),
    attributesJson: attributes ? JSON.stringify(attributes, null, 2) : "",
    specsText: (specs ?? []).map((spec) => `${spec.label} | ${spec.value}`).join("\n"),
  };
}

export function productFromDraft(draft: ProductDraft): Product {
  const { priceExample, attributesJson, specsText, ...product } = draft;
  return {
    ...product,
    id: product.id.trim(),
    name: product.name.trim(),
    type: product.type.trim(),
    descriptor: product.descriptor.trim(),
    affiliateUrl: product.affiliateUrl.trim(),
    imageUrl: product.imageUrl?.trim() || undefined,
    priceExample: Number(priceExample),
    specs: parsePairs(specsText).map(([label, value]) => ({ label, value })),
    attributes: attributesJson.trim() ? JSON.parse(attributesJson) : undefined,
  };
}
