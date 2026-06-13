export class RateLimitError extends Error {
  constructor(public readonly retryAfterMs: number) {
    super(`Rate limited, retry after ${retryAfterMs}ms`);
    this.name = "RateLimitError";
  }
}
