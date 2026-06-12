export type { AuthBody, MeResponse, ChangePasswordBody, UpdateDigestBody } from "@signal-monitor/shared";

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
    digestMinutes: { type: "integer" },
  },
} as const;

export const updateDigestBodySchema = {
  type: "object",
  required: ["digestMinutes"],
  properties: {
    digestMinutes: { type: "integer", minimum: 0, maximum: 1439 },
  },
} as const;
