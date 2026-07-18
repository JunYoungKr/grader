import Image from "next/image";
import type { Product } from "@/lib/types";

export function ProductImage({
  product,
  size = 160,
  className = "",
}: {
  product: Product;
  size?: number;
  className?: string;
}) {
  if (!product.imageUrl) return null;

  return (
    <div className={`overflow-hidden rounded-lg bg-paper ${className}`}>
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={size}
        height={size}
        sizes={`${size}px`}
        className="aspect-square object-contain p-2"
      />
    </div>
  );
}
