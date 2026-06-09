import { FastifyPluginAsync } from "fastify";
import cookie from "@fastify/cookie";

import env from "./env";
import db from "./db/db";
import cache from "./cache";
import auth from "./auth";

const app: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(env);
  fastify.register(cookie);
  fastify.register(db);
  fastify.register(cache);

  fastify.register(auth);
  fastify.get("/health", async () => ({ status: "ok" }));
};

export default app;
