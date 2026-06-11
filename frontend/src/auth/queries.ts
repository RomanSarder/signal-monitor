import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthBody, MeResponse } from "@signal-monitor/shared";

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? res.statusText);
  }
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const meQueryKey = ["me"] as const;

export function useMe() {
  return useQuery<MeResponse>({
    queryKey: meQueryKey,
    queryFn: () => apiFetch("/auth/me"),
    retry: false,
  });
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
