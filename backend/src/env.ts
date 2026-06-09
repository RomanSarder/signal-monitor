import fastifyEnv from "@fastify/env";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    config: {
      DATABASE_URL: string;
      REDIS_URL: string;
    };
  }
}

const schema = {
  type: "object",
  required: ["DATABASE_URL", "REDIS_URL"],
  properties: {
    DATABASE_URL: {
      type: "string",
    },
    REDIS_URL: {
      type: "string",
    },
  },
};

export default fp(async (fastify) => {
  await fastify.register(fastifyEnv, { schema, dotenv: true });
});
