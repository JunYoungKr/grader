"use client";
import { useEffect, useState } from "react";
import {
  parseSaved,
  SAVED_KEY,
  SAVED_EVENT,
  type SavedItem,
} from "@/lib/saved";
export function useSaved() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const sync = () => {
      try {
        setItems(parseSaved(localStorage.getItem(SAVED_KEY)));
      } catch {
        setItems([]);
      }
      setReady(true);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(SAVED_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(SAVED_EVENT, sync);
    };
  }, []);
  function toggle(item: SavedItem) {
    try {
      const current = parseSaved(localStorage.getItem(SAVED_KEY));
      const next = current.some((i) => i.id === item.id)
        ? current.filter((i) => i.id !== item.id)
        : [item, ...current].slice(0, 100);
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(SAVED_EVENT));
      setError("");
    } catch {
      setError(
        "이 브라우저에서는 저장할 수 없어요. 브라우저 저장 설정을 확인해 주세요.",
      );
    }
  }
  return { items, ready, error, toggle };
}
