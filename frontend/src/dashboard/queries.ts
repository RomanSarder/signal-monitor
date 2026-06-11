import { useQuery } from "@tanstack/react-query";
import type { Monitor } from "@signal-monitor/shared";
import { apiFetch } from "../api";

export const monitorsQueryKey = ["monitors"] as const;

export function useMonitors() {
  return useQuery<Monitor[]>({
    queryKey: monitorsQueryKey,
    queryFn: () => apiFetch("/monitors"),
  });
}
