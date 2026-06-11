import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../api";
import { monitorsQueryKey, useMonitors } from "../dashboard/queries";

export { useMonitors };

export function usePauseMonitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/monitors/${id}/status/pause`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: monitorsQueryKey }),
  });
}

export function useResumeMonitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/monitors/${id}/status/resume`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: monitorsQueryKey }),
  });
}

export function useRunMonitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/monitors/${id}/run`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: monitorsQueryKey }),
  });
}
