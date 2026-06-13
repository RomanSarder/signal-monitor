import { hackerNewsSourceAdapter } from "./hn";
import { SourceAdapter } from "./adapter";

export { hackerNewsSourceAdapter } from "./hn";
export { RateLimitError } from "./errors";

export const adapters: Record<string, SourceAdapter> = {
  hn: hackerNewsSourceAdapter,
};
