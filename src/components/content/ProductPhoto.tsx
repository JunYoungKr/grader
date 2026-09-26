"use client";
import Image from "next/image";
import { useState } from "react";
import { Icon } from "../ui/Icon";
export function ProductPhoto({
  src,
  alt,
  compact = false,
}: {
  src?: string;
  alt: string;
  compact?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`photo-frame relative flex aspect-square w-full items-center justify-center rounded-lg ${compact ? "max-w-24" : ""}`}
    >
      {src && !failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={
            compact
              ? "96px"
              : "(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
          }
          className="object-contain p-5"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-photo-ink">
          <Icon name="basket" size={32} />
          <span className="text-caption">상품 이미지 준비 중</span>
        </div>
      )}
    </div>
  );
}
