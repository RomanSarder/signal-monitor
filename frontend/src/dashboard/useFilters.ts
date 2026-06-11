import { useState } from "react";
import type { IntentCategory } from "@signal-monitor/shared";

export interface FilterState {
  categories: IntentCategory[];
  minScore: number;
  monitorId: string;
  from: string;
  to: string;
}

const DEFAULTS: FilterState = {
  categories: [],
  minScore: 1,
  monitorId: "",
  from: "",
  to: "",
};

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(DEFAULTS);
  return {
    filters,
    setCategories: (v: IntentCategory[]) => setFilters(f => ({ ...f, categories: v })),
    setMinScore:   (v: number)           => setFilters(f => ({ ...f, minScore: v })),
    setMonitorId:  (v: string)           => setFilters(f => ({ ...f, monitorId: v })),
    setFrom:       (v: string)           => setFilters(f => ({ ...f, from: v })),
    setTo:         (v: string)           => setFilters(f => ({ ...f, to: v })),
    clearFilters:  ()                    => setFilters(DEFAULTS),
  };
}
