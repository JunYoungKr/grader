"use client";
import type { SavedItem } from "@/lib/saved";
import { useSaved } from "./useSaved";
import { Icon } from "../ui/Icon";
export function SaveButton({
  item,
  label = false,
}: {
  item: SavedItem;
  label?: boolean;
}) {
  const { items, ready, error, toggle } = useSaved();
  const saved = items.some((i) => i.id === item.id);
  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        disabled={!ready}
        onClick={() => toggle(item)}
        aria-pressed={saved}
        aria-label={`${item.title} ${saved ? "저장 취소" : "저장"}`}
        className={label ? "button button-secondary" : "icon-button bg-card"}
      >
        <Icon
          name="bookmark"
          size={20}
          fill={saved ? "currentColor" : "none"}
          className={saved ? "text-brand" : ""}
        />
        {label && (saved ? "저장했어요" : "저장하기")}
      </button>
      {error && (
        <span role="alert" className="max-w-56 text-caption text-accent">
          {error}
        </span>
      )}
    </span>
  );
}
