import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Monitor, PatchResultBody, ResultsListResponse } from "@signal-monitor/shared";
import { apiFetch } from "../api";
import type { FilterState } from "./useFilters";

export const monitorsQueryKey = ["monitors"] as const;

export function useMonitors() {
  return useQuery<Monitor[]>({
    queryKey: monitorsQueryKey,
    queryFn: () => apiFetch("/monitors"),
  });
}

export const resultsQueryKey = (f: FilterState) => ["results", f] as const;

export function useResults(filters: FilterState) {
  return useQuery<ResultsListResponse>({
    queryKey: resultsQueryKey(filters),
    queryFn: () => {
      const p = new URLSearchParams({ limit: "25", offset: "0" });
      if (filters.categories.length === 1) p.set("category", filters.categories[0]);
      if (filters.minScore > 1) p.set("minScore", String(filters.minScore));
      if (filters.monitorId) p.set("monitorId", filters.monitorId);
      if (filters.from) p.set("from", filters.from);
      if (filters.to) p.set("to", filters.to);
      p.set("sort", filters.sort);
      return apiFetch(`/results?${p}`);
    },
  });
}

export function usePatchResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PatchResultBody }) =>
      apiFetch(`/results/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["results"] }),
  });
}

export function useDeleteResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/results/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["results"] }),
  });
}
