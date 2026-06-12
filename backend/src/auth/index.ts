import fastifyPlugin from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import jwt from "./jwt";
import signUpController from "./sign-up.controller";
import signInController from "./sign-in.controller";
import signOutController from "./sign-out.controller";
import meController from "./me.controller";
import changePasswordController from "./change-password.controller";
import updateDigestController from "./update-digest.controller";
import fastifyRateLimit from "@fastify/rate-limit";

const auth: FastifyPluginAsync = async (fastify) => {
  fastify.register(jwt);

  fastify.register(
    async (fastify) => {
      // Rate-limit only the unauthenticated mutation endpoints that are
      // brute-force attack surfaces. Authenticated or read-only routes
      // (me, sign-out, password, digest) are excluded.
      fastify.register(async (fastify) => {
        fastify.register(fastifyRateLimit, {
          max: 10,
          timeWindow: 15 * 60 * 1000,
        });
        fastify.register(signUpController);
        fastify.register(signInController);
      });

      fastify.register(signOutController);
      fastify.register(meController);
      fastify.register(changePasswordController);
      fastify.register(updateDigestController);
    },
    { prefix: "auth" },
  );
};

export default fastifyPlugin(auth);
