import { FastifyPluginAsync } from "fastify";
import { COOKIE_NAME } from "./jwt";

const signOutController: FastifyPluginAsync = async (fastify) => {
  fastify.post("/sign-out", async (_request, reply) => {
    reply.clearCookie(COOKIE_NAME, { path: "/" });
    return reply.status(200).send("ok");
  });
};

export default signOutController;
