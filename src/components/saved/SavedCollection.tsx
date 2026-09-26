"use client";
import Link from "next/link";
import { useState } from "react";
import { useSaved } from "./useSaved";
import { SaveButton } from "./SaveButton";
import { ProductPhoto } from "../content/ProductPhoto";
import { ProductPrice } from "../content/ProductMeta";
import { EmptyState } from "../ui/Primitives";
import { ExternalIcon } from "../ExternalIcon";
export function SavedCollection() {
  const { items, ready } = useSaved();
  const [filter, setFilter] = useState("all");
  if (!ready)
    return (
      <p className="py-12 text-muted" role="status">
        저장한 살림을 불러오고 있어요.
      </p>
    );
  if (!items.length)
    return (
      <EmptyState
        title="저장한 글과 상품이 없습니다"
        description="글이나 상품의 저장 버튼을 눌러 추가하세요."
        href="/browse"
      />
    );
  const visible = items.filter((i) => filter === "all" || i.kind === filter);
  return (
    <>
      <div
        className="mb-6 flex flex-wrap gap-2"
        role="group"
        aria-label="저장 목록 종류"
      >
        {[
          { key: "all", name: "전체" },
          { key: "article", name: "가이드" },
          { key: "product", name: "상품" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            aria-pressed={filter === tab.key}
            onClick={() => setFilter(tab.key)}
            className={`button ${filter === tab.key ? "button-primary" : "button-secondary"}`}
          >
            {tab.name}{" "}
            {
              items.filter((i) => tab.key === "all" || i.kind === tab.key)
                .length
            }
          </button>
        ))}
      </div>
      {visible.length ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((item) => (
            <li key={item.id} className="panel flex flex-col p-4">
              <div className="relative">
                <ProductPhoto src={item.imageUrl} alt={item.title} />
                <div className="absolute right-2 top-2">
                  <SaveButton item={item} />
                </div>
              </div>
              <h2 className="mb-3 mt-4 text-body font-medium">{item.title}</h2>
              <div className="mt-auto">
                {item.price !== undefined && (
                  <ProductPrice
                    price={item.price}
                    checkedAt={item.priceCheckedAt}
                  />
                )}
                {item.kind === "article" ? (
                  <Link href={item.href} className="text-link mt-3">
                    가이드 읽기
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="sponsored nofollow noopener"
                    className="button button-secondary mt-4 w-full"
                    data-ga="affiliate"
                    data-ga-provider={item.provider}
                    data-ga-product-id={item.productId ?? item.id}
                    data-ga-product={item.title}
                    data-ga-article={item.article ?? "saved"}
                    data-ga-category={item.category}
                    data-ga-price={item.price}
                    data-ga-placement="saved_collection"
                  >
                    <span className="flex flex-col items-center py-1 leading-snug">
                      <span className="inline-flex items-center gap-2">
                        판매처 확인 <ExternalIcon />
                      </span>
                      <span className="mt-1 text-caption text-muted">
                        제휴 링크
                      </span>
                    </span>
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="아직 저장한 항목이 없어요"
          description="다른 목록을 선택하거나 살림 둘러보기에서 저장해 보세요."
          href="/browse"
        />
      )}
    </>
  );
}
