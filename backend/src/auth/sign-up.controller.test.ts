import { describe, it, expect, afterEach } from "vitest";
import { buildApp, mockDb } from "../test-utils";
import signUpController from "./sign-up.controller";

function build(dbResult: unknown) {
  const app = buildApp(mockDb(dbResult));
  app.register(signUpController, { prefix: "/auth" });
  return app;
}

describe("POST /auth/sign-up", () => {
  const validBody = { email: "test@example.com", password: "secret123" };

  afterEach(async () => {});

  it("returns 201 on success", async () => {
    const app = build([{ id: "user-id", email: "test@example.com" }]);
    const res = await app.inject({
      method: "POST",
      url: "/auth/sign-up",
      payload: validBody,
    });
    expect(res.statusCode).toBe(201);
  });

  it("returns 400 for invalid email format", async () => {
    const app = build([]);
    const res = await app.inject({
      method: "POST",
      url: "/auth/sign-up",
      payload: { email: "not-an-email", password: "secret123" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const app = build([]);
    const res = await app.inject({
      method: "POST",
      url: "/auth/sign-up",
      payload: { email: "test@example.com" },
    });
    expect(res.statusCode).toBe(400);
  });
});
