import { FastifyPluginAsync } from "fastify";
import jwt from "./jwt";
import signUpController from "./sign-up.controller";
import signInController from "./sign-in.controller";

const auth: FastifyPluginAsync = async (fastify) => {
  fastify.register(jwt);

  fastify.register(
    async (fastify) => {
      fastify.register(signUpController);
      fastify.register(signInController);
    },
    { prefix: "auth" },
  );
};

export default auth;
