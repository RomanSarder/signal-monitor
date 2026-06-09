import fp from "fastify-plugin";
import { drizzle } from "drizzle-orm/postgres-js";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

declare module "fastify" {
  interface FastifyInstance {
    db: PostgresJsDatabase;
  }
}

export default fp(async (fastify) => {
  const db = drizzle({
    connection: {
      url: fastify.config.DATABASE_URL,
    },
  });

  fastify.decorate("db", db);
});
