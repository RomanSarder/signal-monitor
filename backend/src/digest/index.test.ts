import { describe, it, expect } from "vitest";
import { buildApp, mockDb, mockDigestQueue } from "../test-utils";
import { digest } from "./index";

function build(authenticated = true, queue = mockDigestQueue()) {
  const app = buildApp(mockDb(undefined), { authenticated, digestQueue: queue });
  app.register(digest);
  return { app, queue };
}

describe("POST /digest/send", () => {
  it("returns 202 and enqueues a job", async () => {
    const { app, queue } = build();
    const res = await app.inject({ method: "POST", url: "/digest/send" });
    expect(res.statusCode).toBe(202);
    expect(res.json()).toEqual({ queued: true });
    expect(queue.add).toHaveBeenCalledOnce();
  });

  it("passes force: true to the queue when provided as query param", async () => {
    const { app, queue } = build();
    await app.inject({ method: "POST", url: "/digest/send?force=true" });
    expect(queue.add).toHaveBeenCalledWith("digest-request", { force: true, userId: "user-id" });
  });

  it("uses the authenticated user id", async () => {
    const { app, queue } = build();
    await app.inject({ method: "POST", url: "/digest/send" });
    expect(queue.add).toHaveBeenCalledWith("digest-request", { force: undefined, userId: "user-id" });
  });

  it("returns 401 when not authenticated", async () => {
    const { app } = build(false);
    const res = await app.inject({ method: "POST", url: "/digest/send" });
    expect(res.statusCode).toBe(401);
  });
});
