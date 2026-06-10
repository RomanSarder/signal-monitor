import fastifyEnv from "@fastify/env";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    config: {
      DATABASE_URL: string;
      REDIS_HOST: string;
      REDIS_PORT: string;
      SECRET: string;
      NODE_ENV: "development" | "production" | "test";
    };
  }
}

const schema = {
  type: "object",
  required: ["DATABASE_URL", "REDIS_URL", "SECRET", "NODE_ENV"],
  properties: {
    DATABASE_URL: {
      type: "string",
    },
    REDIS_HOST: {
      type: "string",
    },
    REDIS_PORT: {
      type: "string",
    },
    SECRET: {
      type: "string",
    },
    NODE_ENV: {
      type: "string",
      default: "development",
    },
  },
};

export default fp(async (fastify) => {
  await fastify.register(fastifyEnv, { schema, dotenv: true });
});
