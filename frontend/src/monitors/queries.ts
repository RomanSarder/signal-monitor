import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateMonitor, JobRun, Monitor } from "@signal-monitor/shared";
import { apiFetch } from "../api";
import { monitorsQueryKey, statsQueryKey } from "../dashboard/queries";

export { useMonitors } from "../dashboard/queries";

export function useMonitor(id: string) {
  return useQuery<Monitor>({
    queryKey: ["monitors", id],
    queryFn: () => apiFetch(`/monitors/${id}`),
  });
}

export function useUpdateMonitor(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateMonitor>) =>
      apiFetch(`/monitors/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["monitors", id] });
      qc.invalidateQueries({ queryKey: monitorsQueryKey });
    },
  });
}

export function useDeleteMonitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/monitors/${id}`, { method: "DELETE" }),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: ["monitors", id] });
      qc.invalidateQueries({ queryKey: monitorsQueryKey, exact: true });
    },
  });
}

export function usePauseMonitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/monitors/${id}/status/pause`, { method: "POST" }),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["monitors", id] });
      qc.invalidateQueries({ queryKey: monitorsQueryKey });
    },
  });
}

export function useResumeMonitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/monitors/${id}/status/resume`, { method: "POST" }),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["monitors", id] });
      qc.invalidateQueries({ queryKey: monitorsQueryKey });
    },
  });
}

export function useRunMonitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/monitors/${id}/run`, { method: "POST" }),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["monitors", id] });
      qc.invalidateQueries({ queryKey: monitorsQueryKey });
    },
  });
}

export function useCreateMonitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMonitor) =>
      apiFetch("/monitors", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: monitorsQueryKey }),
  });
}

export function useMonitorStats(monitorId: string) {
  return useQuery({
    queryKey: statsQueryKey(monitorId),
    queryFn: () => apiFetch(`/results/stats?monitorId=${monitorId}`),
    enabled: !!monitorId,
  });
}

export function useJobRuns(monitorId: string) {
  return useQuery<JobRun[]>({
    queryKey: ["job-runs", monitorId],
    queryFn: () => apiFetch(`/job-runs?monitorId=${monitorId}`),
    enabled: !!monitorId,
  });
}
