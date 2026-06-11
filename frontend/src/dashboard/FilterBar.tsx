import { MultiSelect, MultiSelectItem, Select, SelectItem } from "@tremor/react";
import type { IntentCategory, Monitor } from "@signal-monitor/shared";
import type { FilterState } from "./useFilters";

interface FilterBarProps {
  filters: FilterState;
  monitors: Monitor[];
  onCategoriesChange: (v: IntentCategory[]) => void;
  onMinScoreChange: (v: number) => void;
  onMonitorIdChange: (v: string) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onClear: () => void;
}

const CATEGORIES: { value: IntentCategory; label: string }[] = [
  { value: "hiring", label: "Hiring" },
  { value: "pain_point", label: "Pain point" },
  { value: "discussion", label: "Discussion" },
  { value: "noise", label: "Noise" },
];

const dateInputClass =
  "w-full h-9 rounded-tremor-default border border-tremor-border bg-tremor-background px-3 text-sm text-tremor-content-strong focus:outline-none focus:ring-2 focus:ring-tremor-brand";

export default function FilterBar({
  filters,
  monitors,
  onCategoriesChange,
  onMinScoreChange,
  onMonitorIdChange,
  onFromChange,
  onToChange,
  onClear,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.minScore > 1 ||
    filters.monitorId !== "" ||
    filters.from !== "" ||
    filters.to !== "";

  return (
    <div className="bg-white border-b border-zinc-200 px-4 sm:px-6 py-3">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="min-w-[160px] flex-1">
          <label className="block text-xs text-zinc-500 mb-1">Category</label>
          <MultiSelect
            value={filters.categories}
            onValueChange={v => onCategoriesChange(v as IntentCategory[])}
            placeholder="All categories"
          >
            {CATEGORIES.map(({ value, label }) => (
              <MultiSelectItem key={value} value={value}>
                {label}
              </MultiSelectItem>
            ))}
          </MultiSelect>
        </div>

        <div className="min-w-[160px] flex-1">
          <label className="block text-xs text-zinc-500 mb-1">
            Min score: <span className="font-medium text-zinc-900">{filters.minScore}</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={filters.minScore}
            onChange={e => onMinScoreChange(Number(e.target.value))}
            className="w-full h-2 accent-indigo-600 cursor-pointer"
          />
        </div>

        <div className="min-w-[160px] flex-1">
          <label className="block text-xs text-zinc-500 mb-1">Monitor</label>
          <Select
            value={filters.monitorId}
            onValueChange={onMonitorIdChange}
            placeholder="All monitors"
          >
            {monitors.map(m => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="min-w-[140px] flex-1">
          <label className="block text-xs text-zinc-500 mb-1">From</label>
          <input
            type="date"
            value={filters.from}
            onChange={e => onFromChange(e.target.value)}
            className={dateInputClass}
          />
        </div>

        <div className="min-w-[140px] flex-1">
          <label className="block text-xs text-zinc-500 mb-1">To</label>
          <input
            type="date"
            value={filters.to}
            onChange={e => onToChange(e.target.value)}
            className={dateInputClass}
          />
        </div>

        <button
          onClick={onClear}
          disabled={!hasActiveFilters}
          className="h-9 px-3 text-sm text-zinc-400 border border-zinc-200 rounded-tremor-default shrink-0 disabled:opacity-40 disabled:cursor-default enabled:hover:text-zinc-900 enabled:hover:bg-zinc-50"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
