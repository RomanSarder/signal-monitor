export type IntentCategory = "hiring" | "noise" | "pain_point" | "discussion";

export interface Result {
  id: string;
  monitorId: string;
  source: string;
  sourceId: string;
  url: string;
  title: string | null;
  snippet: string;
  author: string;
  publishedAt: string;
  matchedKeywords: string[];
  intentScore: number | null;
  intentCategory: IntentCategory | null;
  intentReason: string | null;
  scoredAt: string | null;
  isRead: boolean | null;
  isSaved: boolean | null;
  createdAt: string | null;
}

export interface PatchResultBody {
  isRead?: boolean;
  isSaved?: boolean;
}

export interface GetResultsListQuery {
  limit: number;
  offset: number;
  monitorId?: string;
  category?: IntentCategory;
  minScore?: number;
  isRead: boolean;
  isSaved: boolean;
  from: string;
  to: string;
  sort: "newest" | "score";
}

export interface ResultsListResponse {
  total: number;
  items: Result[];
}

export interface ResultStats {
  byCategory: Array<{ category: string | null; count: number }>;
  bySource: Array<{ source: string; count: number }>;
  byDay: Array<{ date: string; count: number }>;
}
