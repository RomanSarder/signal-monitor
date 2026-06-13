import { SourceAdapter } from "./adapter";
import { RateLimitError } from "./errors";
import sanitize from 'sanitize-html';

const HN_RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour — HN Algolia: 1,000 req/hour

interface HnResult {
  objectID: string;
  title: string;
  story_text?: string;
  comment_text?: string;
  url?: string;
  author: string;
  created_at_i: number;
}

export const hackerNewsSourceAdapter: SourceAdapter = {
  async fetchKeyword(keyword: string, sinceTimestamp: number) {
    const url = new URL("https://hn.algolia.com/api/v1/search");
    url.searchParams.set("query", keyword);
    url.searchParams.set("tags", "(story,comment)");
    url.searchParams.set("hitsPerPage", "20");
    url.searchParams.set("numericFilters", `created_at_i>${sinceTimestamp}`);

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfterSec = parseInt(response.headers.get("Retry-After") ?? "", 10);
        throw new RateLimitError(Number.isFinite(retryAfterSec) ? retryAfterSec * 1000 : HN_RATE_LIMIT_MS);
      }
      throw new Error(`HN Algolia fetch failed: ${response.status}`);
    }

    const data = (await response.json()) as unknown as { hits: HnResult[] };

    return data.hits.map((entry) => {
      return {
        source_id: entry.objectID,
        title: entry.title,
        snippet: sanitize(entry.story_text || entry.comment_text || "", { allowedTags: [] }),
        url:
          entry.url || `https://news.ycombinator.com/item?id=${entry.objectID}`,
        author: entry.author,
        published_at: new Date(entry.created_at_i * 1000),
      };
    });
  },
};
