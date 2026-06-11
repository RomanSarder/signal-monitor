import { useMutation } from "@tanstack/react-query";
import type { ChangePasswordBody } from "@signal-monitor/shared";
import { apiFetch } from "../api";

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordBody) =>
      apiFetch("/auth/password", { method: "PATCH", body: JSON.stringify(body) }),
  });
}
