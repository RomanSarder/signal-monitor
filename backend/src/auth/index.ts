import { FastifyPluginAsync } from "fastify";
import jwt from "./jwt";
import signUpController from "./sign-up.controller";
import signInController from "./sign-in.controller";
import meController from "./me.controller";

const auth: FastifyPluginAsync = async (fastify) => {
  fastify.register(jwt);

  fastify.register(
    async (fastify) => {
      fastify.register(signUpController);
      fastify.register(signInController);
      fastify.register(meController);
    },
    { prefix: "auth" },
  );
};

export default auth;
