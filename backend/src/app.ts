import { FastifyPluginAsync } from "fastify";
import cookie from "@fastify/cookie";
import sensible from "@fastify/sensible";

import env from "./env";
import db from "./db/db";
import cache from "./cache";
import auth from "./auth";
import { monitor } from "./monitor";
import queue from "./queue";
import { result } from "./result";
import { jobRun } from "./job-run";
import digestPlugin from "./workers/digest-worker/plugin";
import cleanupPlugin from "./workers/cleanup-worker/plugin";
import { digest } from "./digest";
import { deadLetter } from "./dead-letter";

const app: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(env);
  fastify.register(cookie);
  fastify.register(sensible);
  fastify.register(db);
  fastify.register(cache);
  fastify.register(queue);

  fastify.register(digestPlugin);
  fastify.register(cleanupPlugin);

  fastify.register(auth);
  fastify.register(monitor);
  fastify.register(result);
  fastify.register(jobRun);
  fastify.register(digest);
  fastify.register(deadLetter);
  fastify.get("/health", async () => ({ status: "ok" }));
};

export default app;
