export type { AuthBody, MeResponse, ChangePasswordBody } from "@signal-monitor/shared";

export const authBodySchema = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string" },
  },
} as const;

export const changePasswordBodySchema = {
  type: "object",
  required: ["currentPassword", "newPassword"],
  properties: {
    currentPassword: { type: "string" },
    newPassword: { type: "string", minLength: 8 },
  },
} as const;

export const meResponseSchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    id: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;
