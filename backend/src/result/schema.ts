export type {
  IntentCategory,
  Result,
  PatchResultBody,
  GetResultsListQuery,
  ResultsListResponse,
  ResultStats,
} from "@signal-monitor/shared";

export interface ResultParams {
  id: string;
}

export const resultParamsSchema = {
  type: "object",
  required: ["id"],
  properties: { id: { type: "string", format: "uuid" } },
} as const;

export const patchResultBodySchema = {
  type: "object",
  properties: {
    isRead: { type: "boolean" },
    isSaved: { type: "boolean" },
  },
} as const;

export const resultStatsSchema = {
  type: "object",
  properties: {
    byCategory: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          count: { type: "integer" },
        },
      },
    },
    bySource: {
      type: "array",
      items: {
        type: "object",
        properties: {
          source: { type: "string" },
          count: { type: "integer" },
        },
      },
    },
    byDay: {
      type: "array",
      items: {
        type: "object",
        properties: {
          date: { type: "string" },
          count: { type: "integer" },
        },
      },
    },
  },
} as const;

export const querySchema = {
  type: "object",
  properties: {
    limit: { type: "integer", minimum: 0, maximum: 100, default: 25 },
    offset: { type: "integer", minimum: 0, default: 0 },
    monitorId: { type: "string" },
    category: {
      type: "string",
      enum: ["hiring", "noise", "pain_point", "discussion"],
    },
    minScore: {
      type: "integer",
      minimum: 1,
    },
    isRead: {
      type: "boolean",
    },
    isSaved: {
      type: "boolean",
    },
    from: {
      type: "string",
      format: "date-time",
    },
    to: {
      type: "string",
      format: "date-time",
    },
    sort: {
      type: "string",
      enum: ["newest", "score"],
    },
  },
} as const;

export const resultSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    monitorId: { type: "string" },
    source: { type: "string" },
    sourceId: { type: "string" },
    url: { type: "string" },
    title: { type: "string" },
    snippet: { type: "string" },
    author: { type: "string" },
    publishedAt: { type: "string", format: "date-time" },
    matchedKeywords: { type: "array", items: { type: "string" } },
    intentScore: { type: "integer" },
    intentCategory: { type: "string" },
    intentReason: { type: "string" },
    scoredAt: { type: "string", format: "date-time" },
    isRead: { type: "boolean" },
    isSaved: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;
