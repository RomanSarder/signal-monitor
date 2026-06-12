import { describe, it, expect, vi } from "vitest";
import { createDigestProcessor } from "./digest-processor";
import { mockDbMulti, mockJob } from "../../test-utils";

const USER_ID = "00000000-0000-0000-0000-000000000001";

const userRow = {
  id: USER_ID,
  email: "test@example.com",
  passwordHash: "hash",
  digestMinutes: 540,
  createdAt: new Date(),
};

const dueUserRecord = { users: userRow, digestLogs: null };

const relevantResultRecord = {
  users: userRow,
  monitors: { id: "00000000-0000-0000-0000-000000000002", name: "Test Monitor" },
  results: {
    id: "00000000-0000-0000-0000-000000000003",
    title: "Hiring backend engineers",
    snippet: "We are growing our team and looking for engineers.",
    url: "https://example.com/post",
    intentScore: 8,
    intentCategory: "hiring",
    intentReason: "Active hiring post with clear intent.",
    author: "testuser",
    publishedAt: new Date(),
  },
};

describe("createDigestProcessor", () => {
  it("does nothing when there are no due users", async () => {
    const db = mockDbMulti([]);
    const sendEmail = vi.fn();

    await createDigestProcessor({ db, sendEmail })(mockJob({}));

    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("inserts digestLog with resultCount 0 and skips email when user has no results", async () => {
    // DB calls: select dueUsers → [dueUserRecord], select results → [], insert digestLog → []
    const db = mockDbMulti([dueUserRecord], [], []);
    const sendEmail = vi.fn();

    await createDigestProcessor({ db, sendEmail })(mockJob({}));

    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("sends email and inserts digestLog when user has results", async () => {
    // DB calls: select dueUsers, select results, insert digestLog
    const db = mockDbMulti([dueUserRecord], [relevantResultRecord], []);
    const sendEmail = vi.fn().mockResolvedValue({ error: null });

    await createDigestProcessor({ db, sendEmail })(mockJob({}));

    expect(sendEmail).toHaveBeenCalledOnce();
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: userRow.email,
      subject: expect.stringContaining("1 signal"),
    }));
  });

  it("throws when sendEmail returns an error", async () => {
    const db = mockDbMulti([dueUserRecord], [relevantResultRecord]);
    const sendEmail = vi.fn().mockResolvedValue({ error: { message: "API key invalid" } });

    await expect(
      createDigestProcessor({ db, sendEmail })(mockJob({})),
    ).rejects.toThrow("Resend error: API key invalid");
  });

  it("propagates error when the initial db query throws", async () => {
    const db = mockDbMulti(new Error("db connection failed"));
    const sendEmail = vi.fn();

    await expect(
      createDigestProcessor({ db, sendEmail })(mockJob({})),
    ).rejects.toThrow("db connection failed");

    expect(sendEmail).not.toHaveBeenCalled();
  });
});
