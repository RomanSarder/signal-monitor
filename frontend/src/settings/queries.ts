import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChangePasswordBody, UpdateDigestBody } from "@signal-monitor/shared";
import { apiFetch } from "../api";
import { meQueryKey } from "../auth/queries";

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordBody) =>
      apiFetch("/auth/password", { method: "PATCH", body: JSON.stringify(body) }),
  });
}

export function useUpdateDigest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateDigestBody) =>
      apiFetch("/auth/digest", { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: meQueryKey }),
  });
}
