import { Icon } from "./Icon";
export function SearchForm({
  query = "",
  category,
  compact = false,
}: {
  query?: string;
  category?: string;
  compact?: boolean;
}) {
  return (
    <form
      action="/browse"
      role="search"
      className={`flex items-center gap-2 rounded-md border border-hairline bg-card pl-4 pr-1 ${compact ? "min-h-touch" : "min-h-button"}`}
    >
      <input
        type="search"
        name="q"
        aria-label="살림 글과 상품 검색"
        placeholder="글과 상품 검색"
        defaultValue={query}
        className="min-w-0 flex-1 bg-transparent py-2 text-small outline-none"
      />
      {category && <input type="hidden" name="category" value={category} />}
      <button className="icon-button" type="submit" aria-label="검색">
        <Icon name="search" size={18} />
      </button>
    </form>
  );
}
