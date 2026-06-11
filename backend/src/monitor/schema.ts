export type { CreateMonitor, UpdateMonitor as SingleMonitorUpdatePayload } from "@signal-monitor/shared";

export interface SingleMonitorParams {
  id: string;
}

export const singleMonitorParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", format: "uuid" },
  },
} as const;

export const createMonitorSchema = {
  type: "object",
  required: ["name", "intervalMinutes", "sources", "keywords"],
  properties: {
    name: { type: "string" },
    intervalMinutes: { type: "integer", minimum: 30 },
    sources: { type: "array", items: { type: "string" } },
    keywords: { type: "array", items: { type: "string" } },
  },
} as const;

export const singleMonitorUpdatePayloadSchema = {
  ...createMonitorSchema,
  required: [],
} as const;
