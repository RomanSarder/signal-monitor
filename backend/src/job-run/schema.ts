export type { JobRun } from "@signal-monitor/shared";

export interface GetJobRunsQuery {
  monitorId: string;
  limit?: number;
}

export const jobRunsQuerySchema = {
  type: "object",
  required: ["monitorId"],
  properties: {
    monitorId: { type: "string", format: "uuid" },
    limit: { type: "integer", minimum: 1, maximum: 50, default: 10 },
  },
} as const;

export const jobRunSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    monitorId: { type: "string" },
    jobType: { type: "string", enum: ["poll", "score", "digest"] },
    status: {
      type: "string",
      enum: ["started", "completed", "completed_with_errors", "failed"],
    },
    startedAt: { type: "string", format: "date-time" },
    finishedAt: { type: "string", format: "date-time", nullable: true },
  },
} as const;
