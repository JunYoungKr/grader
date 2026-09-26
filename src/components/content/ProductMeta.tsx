import { formatPrice } from "@/lib/grade";
export function ProductPrice({
  price,
  checkedAt,
}: {
  price: number;
  checkedAt?: string;
}) {
  return (
    <div>
      <p className="text-title font-semibold tabular-nums">
        {formatPrice(price)}
      </p>
      <p className="mt-1 text-caption text-faint">
        {checkedAt ? `${checkedAt.replaceAll("-", ".")} 조회` : "조회일 미등록"}
        <span className="block">현재 가격은 판매처에서 확인</span>
      </p>
    </div>
  );
}
export function DeliveryTags({
  rocket,
  free,
}: {
  rocket?: boolean;
  free?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {rocket && <span className="text-caption text-brand">로켓배송</span>}
      {free && <span className="text-caption text-muted">무료배송</span>}
    </div>
  );
}
