import { FastifyPluginAsync } from "fastify";
import { ChangePasswordBody, changePasswordBodySchema } from "./auth.schema";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const changePasswordController: FastifyPluginAsync = async (fastify) => {
  fastify.patch<{ Body: ChangePasswordBody }>(
    "/password",
    {
      onRequest: [fastify.authenticate],
      schema: { body: changePasswordBodySchema },
    },
    async (request, reply) => {
      const { currentPassword, newPassword } = request.body;

      const [existingUser] = await fastify.db
        .select()
        .from(users)
        .where(eq(users.id, request.user.id));

      const isCorrect = await bcrypt.compare(currentPassword, existingUser.passwordHash);
      if (!isCorrect) {
        return reply.unauthorized("Current password is incorrect");
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await fastify.db
        .update(users)
        .set({ passwordHash: newHash })
        .where(eq(users.id, request.user.id));

      return reply.status(204).send();
    },
  );
};

export default changePasswordController;
