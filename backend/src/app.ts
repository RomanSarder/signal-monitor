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

const app: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(env);
  fastify.register(cookie);
  fastify.register(sensible);
  fastify.register(db);
  fastify.register(cache);
  fastify.register(queue);

  fastify.register(auth);
  fastify.register(monitor);
  fastify.register(result);
  fastify.get("/health", async () => ({ status: "ok" }));
};

export default app;
