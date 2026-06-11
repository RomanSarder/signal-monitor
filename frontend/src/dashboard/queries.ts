import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Monitor, PatchResultBody, ResultsListResponse } from "@signal-monitor/shared";
import { apiFetch } from "../api";
import type { FilterState } from "./useFilters";

const PAGE_SIZE = 25;

export const monitorsQueryKey = ["monitors"] as const;

export function useMonitors() {
  return useQuery<Monitor[]>({
    queryKey: monitorsQueryKey,
    queryFn: () => apiFetch("/monitors"),
  });
}

export const resultsQueryKey = (f: FilterState) => ["results", f] as const;

export function useInfiniteResults(filters: FilterState) {
  return useInfiniteQuery<ResultsListResponse>({
    queryKey: resultsQueryKey(filters),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => {
      const p = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(pageParam) });
      if (filters.categories.length === 1) p.set("category", filters.categories[0]);
      if (filters.minScore > 1) p.set("minScore", String(filters.minScore));
      if (filters.monitorId) p.set("monitorId", filters.monitorId);
      if (filters.from) p.set("from", filters.from);
      if (filters.to) p.set("to", filters.to);
      p.set("sort", filters.sort);
      return apiFetch(`/results?${p}`);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.items.length < PAGE_SIZE) return undefined;
      return allPages.reduce((sum, p) => sum + p.items.length, 0);
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
