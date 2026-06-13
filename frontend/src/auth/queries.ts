import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthBody, MeResponse } from "@signal-monitor/shared";
import { apiFetch } from "../api";

export { ApiError } from "../api";

export const meQueryKey = ["me"] as const;

export const meQueryOptions = {
  queryKey: meQueryKey,
  queryFn: (): Promise<MeResponse> => apiFetch("/auth/me"),
  retry: false,
  staleTime: Infinity,
} as const;

export function useMe() {
  return useQuery(meQueryOptions);
}

export function useSignIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AuthBody) =>
      apiFetch("/auth/sign-in", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: meQueryKey }),
  });
}

export function useSignUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AuthBody) =>
      apiFetch("/auth/sign-up", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: meQueryKey }),
  });
}

export function useSignOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch("/auth/sign-out", { method: "POST" }),
    onSuccess: () => qc.clear(),
  });
}
