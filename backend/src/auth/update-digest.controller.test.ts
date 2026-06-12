import { describe, it, expect } from "vitest";
import { buildApp, mockDbMulti } from "../test-utils";
import updateDigestController from "./update-digest.controller";

function build(authenticated = true) {
  const app = buildApp(mockDbMulti([]), { authenticated });
  app.register(updateDigestController, { prefix: "/auth" });
  return app;
}

describe("PATCH /auth/digest", () => {
  it("returns 204 on valid update", async () => {
    const app = build();
    const res = await app.inject({
      method: "PATCH",
      url: "/auth/digest",
      payload: { digestMinutes: 540 },
    });
    expect(res.statusCode).toBe(204);
  });

  it("returns 401 when not authenticated", async () => {
    const app = build(false);
    const res = await app.inject({
      method: "PATCH",
      url: "/auth/digest",
      payload: { digestMinutes: 540 },
    });
    expect(res.statusCode).toBe(401);
  });

  it("returns 400 when digestMinutes is missing", async () => {
    const app = build();
    const res = await app.inject({
      method: "PATCH",
      url: "/auth/digest",
      payload: {},
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when digestMinutes exceeds 1439", async () => {
    const app = build();
    const res = await app.inject({
      method: "PATCH",
      url: "/auth/digest",
      payload: { digestMinutes: 1440 },
    });
    expect(res.statusCode).toBe(400);
  });
});
