import Image from "next/image";
import { setDiscoveryStatus } from "@/app/admin/(panel)/discovery/actions";

export type PromoCandidateRow = {
  product_key: string;
  product_id: number;
  name: string;
  price: number;
  previous_price: number | null;
  price_checked_at: string;
  previous_price_checked_at: string | null;
  image_url: string;
  affiliate_url: string;
  category_name: string;
  is_rocket: boolean;
  is_free_shipping: boolean;
  sources: string[];
  review_status: "new" | "saved" | "dismissed";
  last_seen_at: string;
};

function koreanTime(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function candidateSource(source: string): string {
  if (source === "goldbox") return "골드박스";
  if (source.startsWith("search:")) return `검색어 ${source.slice(7)}`;
  return source;
}

export function PromoCandidateCard({
  candidate,
  view,
}: {
  candidate: PromoCandidateRow;
  view: string;
}) {
  const lowerThanPrevious = candidate.previous_price !== null &&
    candidate.previous_price > candidate.price &&
    candidate.previous_price_checked_at !== null;
  return (
    <article className="flex flex-col gap-5 rounded-lg border border-hairline bg-card p-5 sm:flex-row">
      <div className="shrink-0 overflow-hidden rounded-md bg-paper sm:h-40 sm:w-40">
        <Image
          src={candidate.image_url}
          alt={candidate.name}
          width={320}
          height={320}
          sizes="(min-width: 640px) 160px, 100vw"
          className="aspect-square h-full w-full object-contain"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-2 text-sm text-muted">
          <span>{candidate.category_name}</span>
          {candidate.sources.map((source) => (
            <span key={source} className="rounded-sm bg-brand-soft px-2 py-0.5 text-brand">
              {candidateSource(source)}
            </span>
          ))}
        </div>
        <h2 className="mt-2 text-lg font-semibold leading-snug text-ink">{candidate.name}</h2>
        <p className="mt-2 text-xl font-semibold text-ink">
          {candidate.price.toLocaleString("ko-KR")}원
        </p>
        <p className="mt-1 text-sm text-muted">
          가격 확인 {koreanTime(candidate.price_checked_at)}
          {candidate.is_rocket ? ", 로켓배송 표시" : ""}
          {candidate.is_free_shipping ? ", 무료배송 표시" : ""}
        </p>
        {lowerThanPrevious && (
          <p className="mt-2 text-sm font-medium text-brand">
            이전 조회 가격 {candidate.previous_price!.toLocaleString("ko-KR")}원
            {" "}({koreanTime(candidate.previous_price_checked_at!)})
          </p>
        )}
        <p className="mt-1 text-xs text-faint">마지막 수집 {koreanTime(candidate.last_seen_at)}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a
            href={candidate.affiliate_url}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-md border border-hairline px-4 text-sm font-medium text-ink hover:bg-surface"
          >
            현재 상품 확인
          </a>
          {(["saved", "dismissed", "new"] as const)
            .filter((status) => status !== candidate.review_status)
            .map((status) => (
              <form key={status} action={setDiscoveryStatus}>
                <input type="hidden" name="productKey" value={candidate.product_key} />
                <input type="hidden" name="status" value={status} />
                <input type="hidden" name="view" value={view} />
                <button
                  type="submit"
                  className="min-h-11 rounded-md border border-hairline px-4 text-sm font-medium text-brand hover:bg-brand-soft"
                >
                  {status === "saved" ? "관심 상품으로 저장" :
                    status === "dismissed" ? "제외" : "새 후보로 되돌리기"}
                </button>
              </form>
            ))}
        </div>
      </div>
    </article>
  );
}
