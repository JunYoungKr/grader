"use client";

import type { DerivedFilters, FilterState } from "@/lib/explorer";
import { formatPrice } from "@/lib/grade";

export function FilterPanel({
  filters,
  state,
  onChange,
}: {
  filters: DerivedFilters;
  state: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const showBudget = filters.budget !== null && filters.budget.min < filters.budget.max;
  const budgetValue = state.budgetMax ?? filters.budget?.max ?? 0;

  return (
    <div className="rounded-lg border border-hairline bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">내 조건으로 좁히기</h3>
        <button
          type="button"
          className="text-[13px] text-muted underline-offset-2 hover:underline"
          onClick={() => onChange({ budgetMax: null, features: [], month: null })}
        >
          초기화
        </button>
      </div>

      <div className="mt-4 space-y-5">
        {showBudget && filters.budget && (
          <div>
            <div className="flex items-center justify-between text-[13px]">
              <label htmlFor="filter-budget" className="text-muted">
                예산 상한
              </label>
              <span className="tabular-nums">
                {state.budgetMax === null ? "전체" : formatPrice(state.budgetMax)}
              </span>
            </div>
            <input
              id="filter-budget"
              type="range"
              min={filters.budget.min}
              max={filters.budget.max}
              step={1000}
              value={budgetValue}
              onChange={(e) =>
                onChange({ ...state, budgetMax: Number(e.target.value) })
              }
              className="mt-2 w-full accent-brand"
            />
          </div>
        )}

        {filters.features.length > 0 && (
          <div>
            <span className="text-[13px] text-muted">필요 기능</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {filters.features.map((f) => {
                const on = state.features.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      onChange({
                        ...state,
                        features: on
                          ? state.features.filter((x) => x !== f)
                          : [...state.features, f],
                      })
                    }
                    className={`rounded-full border px-3 py-1 text-[13px] transition-colors ${
                      on
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-hairline text-muted hover:bg-paper"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {filters.age && (
          <div>
            <label htmlFor="filter-month" className="text-[13px] text-muted">
              우리 아이 개월수
            </label>
            <select
              id="filter-month"
              value={state.month ?? ""}
              onChange={(e) =>
                onChange({
                  ...state,
                  month: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className="mt-2 block w-full rounded-md border border-hairline bg-paper px-3 py-2 text-sm"
            >
              <option value="">선택 안 함</option>
              {Array.from(
                { length: filters.age.max - filters.age.min + 1 },
                (_, i) => filters.age!.min + i,
              ).map((m) => (
                <option key={m} value={m}>
                  {m}개월
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
