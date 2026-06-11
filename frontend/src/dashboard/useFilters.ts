import { useState } from "react";
import type { IntentCategory } from "@signal-monitor/shared";

export interface FilterState {
  categories: IntentCategory[];
  minScore: number;
  monitorId: string;
  from: string;
  to: string;
  sort: "newest" | "score";
}

export const FILTER_DEFAULTS: FilterState = {
  categories: [],
  minScore: 4,
  monitorId: "",
  from: "",
  to: "",
  sort: "newest",
};

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(FILTER_DEFAULTS);
  return {
    filters,
    setCategories: (v: IntentCategory[])       => setFilters(f => ({ ...f, categories: v })),
    setMinScore:   (v: number)                 => setFilters(f => ({ ...f, minScore: v })),
    setMonitorId:  (v: string)                 => setFilters(f => ({ ...f, monitorId: v })),
    setFrom:       (v: string)                 => setFilters(f => ({ ...f, from: v })),
    setTo:         (v: string)                 => setFilters(f => ({ ...f, to: v })),
    setSort:       (v: "newest" | "score")     => setFilters(f => ({ ...f, sort: v })),
    clearFilters:  ()                          => setFilters(FILTER_DEFAULTS),
  };
}
