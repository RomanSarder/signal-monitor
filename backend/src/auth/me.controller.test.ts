import { describe, it, expect } from "vitest";
import { buildApp, mockDb } from "../test-utils";
import meController from "./me.controller";

const userRow = {
  id: "user-id",
  email: "user@example.com",
  passwordHash: "hash",
  createdAt: new Date().toISOString(),
};

function build(authenticated: boolean) {
  const app = buildApp(mockDb([userRow]), { authenticated });
  app.register(meController, { prefix: "/auth" });
  return app;
}

describe("GET /auth/me", () => {
  it("returns user data when authenticated", async () => {
    const app = build(true);
    const res = await app.inject({ method: "GET", url: "/auth/me" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.id).toBe(userRow.id);
    expect(body.email).toBe(userRow.email);
    expect(body.passwordHash).toBeUndefined();
  });

  it("returns 401 when not authenticated", async () => {
    const app = build(false);
    const res = await app.inject({ method: "GET", url: "/auth/me" });
    expect(res.statusCode).toBe(401);
  });
});
