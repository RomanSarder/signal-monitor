import { FastifyPluginAsync } from "fastify";
import { COOKIE_NAME } from "./jwt";

const signOutController: FastifyPluginAsync = async (fastify) => {
  fastify.post("/sign-out", async (_request, reply) => {
    const isProd = process.env.NODE_ENV === "production";
    reply.clearCookie(COOKIE_NAME, {
      path: "/",
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });
    return reply.status(200).send("ok");
  });
};

export default signOutController;
