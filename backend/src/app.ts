import { FastifyPluginAsync } from "fastify";

import env from "./env";
import db from "./db/db";
import cache from "./cache";

const app: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(env);
  fastify.register(db);
  fastify.register(cache);
  fastify.get("/health", async () => ({ status: "ok" }));
};

export default app;
