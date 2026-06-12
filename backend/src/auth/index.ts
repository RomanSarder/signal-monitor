import fastifyPlugin from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import jwt from "./jwt";
import signUpController from "./sign-up.controller";
import signInController from "./sign-in.controller";
import signOutController from "./sign-out.controller";
import meController from "./me.controller";
import changePasswordController from "./change-password.controller";
import updateDigestController from "./update-digest.controller";

const auth: FastifyPluginAsync = async (fastify) => {
  fastify.register(jwt);

  fastify.register(
    async (fastify) => {
      fastify.register(signUpController);
      fastify.register(signInController);
      fastify.register(signOutController);
      fastify.register(meController);
      fastify.register(changePasswordController);
      fastify.register(updateDigestController);
    },
    { prefix: "auth" },
  );
};

export default fastifyPlugin(auth);
