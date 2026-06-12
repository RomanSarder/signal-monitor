import { vi } from "vitest";
import { Job } from "bullmq";
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import sensible from "@fastify/sensible";

export function mockDb(result: unknown) {
  const chain: Record<string, unknown> = {};
  const methods = [
    "select", "insert", "update", "delete",
    "from", "where", "values", "set", "orderBy",
    "returning", "onConflictDoNothing",
    "innerJoin", "leftJoin",
    "groupBy", "limit", "offset",
  ];
  for (const m of methods) {
    chain[m] = () => chain;
  }
  // Make chain awaitable — all terminal calls resolve to result
  (chain as any).then = (res: any, rej?: any) =>
    Promise.resolve(result).then(res, rej);
  (chain as any).catch = (rej: any) => Promise.resolve(result).catch(rej);
  return chain as any;
}

export function mockDbMulti(...results: unknown[]) {
  let i = 0;
  const chain: any = {};
  [
    "select", "insert", "update", "delete",
    "from", "where", "values", "set", "orderBy",
    "returning", "onConflictDoNothing",
    "innerJoin", "leftJoin",
    "groupBy", "limit", "offset",
  ].forEach((m) => {
    chain[m] = () => chain;
  });
  chain.then = (res: any, rej?: any) => {
    const result = results[i++] ?? [];
    if (result instanceof Error) {
      return Promise.reject(result).then(res, rej);
    }
    return Promise.resolve(result).then(res, rej);
  };
  return chain;
}

export function mockJob<T>(data: T): Job<T> {
  return { data } as Job<T>;
}

export function mockPollQueue() {
  return {
    add: vi.fn().mockResolvedValue(undefined),
    upsertJobScheduler: vi.fn().mockResolvedValue(undefined),
    removeJobScheduler: vi.fn().mockResolvedValue(undefined),
  };
}

export function mockDigestQueue() {
  return {
    add: vi.fn().mockResolvedValue(undefined),
  };
}

export interface BuildOptions {
  authenticated?: boolean;
  pollQueue?: ReturnType<typeof mockPollQueue>;
  digestQueue?: ReturnType<typeof mockDigestQueue>;
}

export function buildApp(db: any, opts: BuildOptions = {}): FastifyInstance {
  const { authenticated = true } = opts;
  const app = Fastify();

  app.register(sensible);
  app.decorate("db", db);
  app.decorate("pollQueue", (opts.pollQueue ?? mockPollQueue()) as any);
  app.decorate("digestQueue", (opts.digestQueue ?? mockDigestQueue()) as any);
  app.decorate(
    "authenticate",
    async function (req: FastifyRequest, reply: FastifyReply) {
      if (!authenticated) {
        return reply.unauthorized("Unauthorized");
      }
      (req as any).user = { id: "user-id", email: "user@example.com" };
    },
  );
  app.decorate(
    "signJwt",
    async function (_payload: unknown, _reply: FastifyReply) {
      // no-op: the controller is responsible for sending the response
    },
  );

  return app;
}
