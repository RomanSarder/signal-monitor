import { InferInsertModel } from "drizzle-orm";
import { monitors } from "../db/schema";

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

export type CreateMonitor = Pick<
  InferInsertModel<typeof monitors>,
  "name" | "intervalMinutes" | "sources" | "keywords"
>;

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

export type SingleMonitorUpdatePayload = Partial<
  Pick<
    InferInsertModel<typeof monitors>,
    "name" | "intervalMinutes" | "sources" | "keywords"
  >
>;

export const singleMonitorUpdatePayloadSchema = {
  ...createMonitorSchema,
  required: [],
} as const;
