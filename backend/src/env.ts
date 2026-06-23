import fastifyEnv from "@fastify/env";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    config: {
      DATABASE_URL: string;
      REDIS_URL: string;
      SECRET: string;
      NODE_ENV: "development" | "production" | "test";
      FRONTEND_URL?: string;
    };
  }
}

const schema = {
  type: "object",
  required: [
    "DATABASE_URL",
    "REDIS_URL",
    "SECRET",
    "NODE_ENV",
    "ANTHROPIC_API_KEY",
    "RESEND_API_KEY",
  ],
  properties: {
    DATABASE_URL: {
      type: "string",
    },
    REDIS_URL: {
      type: "string",
    },
    SECRET: {
      type: "string",
    },
    NODE_ENV: {
      type: "string",
      default: "development",
    },
    ANTHROPIC_API_KEY: {
      type: "string",
    },
    RESEND_API_KEY: {
      type: "string",
    },
    RESEND_FROM_EMAIL: {
      type: "string",
      default: "onboarding@resend.dev",
    },
    FRONTEND_URL: {
      type: "string",
    },
  },
};

export default fp(async (fastify) => {
  await fastify.register(fastifyEnv, { schema, dotenv: true });
});
