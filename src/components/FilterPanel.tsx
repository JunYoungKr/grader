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
  const budget = filters.budget;
  const showBudget = budget !== null && budget.min < budget.max;
  const budgetValue = state.budgetMax ?? budget?.max ?? 0;

  const age = filters.age;
  const monthOptions = age
    ? Array.from({ length: age.max - age.min + 1 }, (_, i) => age.min + i)
    : [];

  return (
    <div className="rounded-lg border border-hairline bg-paper p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">내 조건으로 좁히기</h3>
        <button
          type="button"
          aria-label="필터 초기화"
          className="text-[13px] text-brand transition-opacity hover:opacity-80"
          onClick={() => onChange({ budgetMax: null, features: [], month: null })}
        >
          초기화
        </button>
      </div>

      <div className="mt-4 space-y-5">
        {showBudget && budget && (
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
              min={budget.min}
              max={budget.max}
              step={1000}
              value={budgetValue}
              onChange={(e) => {
                const v = Number(e.target.value);
                onChange({ ...state, budgetMax: v >= budget.max ? null : v });
              }}
              className="mt-2 w-full accent-brand"
            />
          </div>
        )}

        {filters.features.length > 0 && (
          <div role="group" aria-label="필요 기능">
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
                    className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
                      on
                        ? "border-[color-mix(in_srgb,var(--brand)_35%,transparent)] bg-brand-soft text-brand"
                        : "border-hairline bg-paper text-muted hover:bg-surface"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {age && (
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
              {monthOptions.map((m) => (
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
