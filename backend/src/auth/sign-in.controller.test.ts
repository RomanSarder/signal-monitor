import { describe, it, expect } from "vitest";
import bcrypt from "bcrypt";
import { buildApp, mockDb } from "../test-utils";
import signInController from "./sign-in.controller";

const PASSWORD = "secret123";
const PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 1);

const existingUser = {
  id: "user-id",
  email: "test@example.com",
  passwordHash: PASSWORD_HASH,
  createdAt: new Date(),
};

function build(dbResult: unknown) {
  const app = buildApp(mockDb(dbResult));
  app.register(signInController, { prefix: "/auth" });
  return app;
}

describe("POST /auth/sign-in", () => {
  it("returns 200 with valid credentials", async () => {
    const app = build([existingUser]);
    const res = await app.inject({
      method: "POST",
      url: "/auth/sign-in",
      payload: { email: existingUser.email, password: PASSWORD },
    });
    expect(res.statusCode).toBe(200);
  });

  it("returns 401 when user does not exist", async () => {
    const app = build([]);
    const res = await app.inject({
      method: "POST",
      url: "/auth/sign-in",
      payload: { email: "nobody@example.com", password: PASSWORD },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().message).toBe("Invalid credentials");
  });

  it("returns 401 with wrong password", async () => {
    const app = build([existingUser]);
    const res = await app.inject({
      method: "POST",
      url: "/auth/sign-in",
      payload: { email: existingUser.email, password: "wrongpassword" },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().message).toBe("Invalid credentials");
  });

  it("returns 400 for invalid body", async () => {
    const app = build([]);
    const res = await app.inject({
      method: "POST",
      url: "/auth/sign-in",
      payload: { email: "not-an-email", password: PASSWORD },
    });
    expect(res.statusCode).toBe(400);
  });
});
